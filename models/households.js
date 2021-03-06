Household = function (doc) {
  // make sure that each transaction has the same set of portions, for convenience
  if(doc.user_ids) {
    var defaultPortions = _.object(doc.user_ids.map(function(user_id) {
      return [user_id, 0];
    }));

    if(doc.expenses) {
      doc.expenses.forEach(function(expense) {
        _.defaults(expense.portions, defaultPortions);
      });

      doc.expenses = _.sortBy(doc.expenses, function(expense) {
        return -expense.created_at;
      });
    }
  }

  // sort log
  if(doc.log) {
    doc.log = _.sortBy(doc.log, function(logEntry) {
      return -logEntry.time;
    });
  }

  // add all of the attributes retrieved from the database to the object
  _.extend(this, doc);
};

// attributes that are allowed when a household is created
Household.attributes = ["_id", "name", "user_ids"];

// function to check if new or updated expense is valid
Household.validateExpense = function (household_id, expense) {
  var household = Households.findOne({_id: household_id});
  if(!Ability.can("update", "household", household)) {
    throw new Meteor.Error(0, "You don't have permission to update the household.");
  }
  
  if(expense.user_id !== Meteor.user()._id) {
    throw new Meteor.Error(0, "Expenses can only be added by the person that paid for them.");
  }
  
  // each expense needs to balance out to 0
  var portionSum = _.reduce(_.values(expense.portions), function(sum, value) {
    return sum + value; 
  }, 0);

  if(expense.cost === 0 || expense.cost === null || expense.cost === undefined) {
    throw new Meteor.Error(0, "Please enter a cost.");
  }
  
  if(expense.cost - portionSum !== 0) {
    throw new Meteor.Error(0, "Expenses must have a balance of 0.");
  }

  // it's a payment
  if(expense.cost < 0) {
    var targets = _.filter(_.pairs(expense.portions), function(portion) { return portion[1] !== 0; });
    if(targets.length > 1) {
      throw new Meteor.Error(0, "Payments must be between two people.");
    }

    if(targets[0][0] === expense.user_id) {
      throw new Meteor.Error(0, "You can't pay yourself.");
    }
  }

  return true;
};

// function to check if expense can be deleted
Household.validateDeleteExpense = function (household_id, expense) {
  if(expense.user_id !== Meteor.user()._id) {
    throw new Meteor.Error(0, "Expenses can only be deleted by the person that paid for them.");
  }

  return true;
};

_.extend(Household.prototype, {
  // Household methods go here

  // gets the actual user objects of people that belong to the household
  users: function() {
    return Meteor.users.find({_id: {$in: this.user_ids}}).fetch();
  },

  // adds some necessary attributes and calls the server method to add
  // an expense
  addExpense: function(obj, callback) {
    obj.created_at = new Date().getTime();
    obj.household_id = this._id;
    Meteor.call("addExpenseToHousehold", this._id, obj, callback);
  },

  // gets old expense, extends it with attributes from the updated fields
  // and saves it back to the database
  updateExpense: function(obj, callback) {
    var old_expense = _.find(this.expenses, function(expense) {
      return expense.created_at === obj.created_at;
    });

    var new_expense = _.extend({}, old_expense, obj);

    if(_.isEqual(new_expense, old_expense)) {
      // silently do nothing
      callback();
      return;
    }

    Meteor.call("updateExpenseInHousehold", this._id, new_expense, callback);
  },

  // creates an empty transaction
  newTransaction: function() {
    var portions = {};
    this.user_ids.forEach(function(user_id) {
      portions[user_id] = null;
    });

    var user_id;
    if(Meteor.user()) {
      user_id = Meteor.user()._id;
    }

    return {
      portions: portions,
      user_id: user_id
    };
  },

  // for each person, calculates the difference between what they have spent
  // and what they owe
  getBalances: function() {
    if(!this.expenses || this.expenses.length === 0) {
      return _.object(_.map(this.user_ids, function(user_id) {
        return [user_id, 0];
      }));
    }

    var users = {};

    function addToUser(user_id, value) {
      if(users[user_id]) {
        users[user_id] += value;
      } else {
        users[user_id] = value;
      }
    }

    this.expenses.forEach(function(expense) {
      // add amount they have paid
      addToUser(expense.user_id, expense.cost);

      // for each portion of the cost
      var user_id;
      for(user_id in expense.portions) {
        if(expense.portions.hasOwnProperty(user_id)) {
          // subtract what each person owes
          addToUser(user_id, -expense.portions[user_id]);
        }
      }
    });

    // we actually want the negative values here
    var user_id;
    for(user_id in users) {
      if(users.hasOwnProperty(user_id)) {
        users[user_id] = -users[user_id];
      }
    }

    return users;
  },

  // checks if all of the balances add up to zero, this is a precondition
  // for people being able to even out
  checkBalances: function () {
    var balances = this.getBalances();

    // verify they all add up to 0
    var sum = _.reduce(_.values(balances), function(sum, value) {
      return sum + value;
    }, 0);

    if(sum === 0) {
      return true;
    }

    return false;
  },

  // get the set of payments that would resolve all balances
  getPayments: function() {
    if(!this.checkBalances()) {
      throw new Meteor.Error(0, "Balances for household don't match up.");
    }

    // converts balances into list of user_id, balance objects
    var pairs = _.map(_.pairs(this.getBalances()), function(pair) {
      return {user_id: pair[0], balance: pair[1]};
    });

    // people who are owed money
    var lenders = _.filter(pairs, function(pair) {
      return pair.balance > 0;
    });
    
    // people who owe money
    var borrowers = _.filter(pairs, function(pair) {
      return pair.balance < 0;
    });

    // people with a balance of exactly 0 don't need to pay or get paid.  Lucky them!
    
    var payments = [];

    borrowers.forEach(function(borrower) {
      while(borrower.balance < 0) {
        // get one lender
        var lender = _.last(lenders);

        if(lender.balance + borrower.balance <= 0) {
          // borrower owes enough to completely pay this lender
          payments.push({
            source: borrower.user_id,
            target: lender.user_id,
            amount: lender.balance
          });
          
          borrower.balance += lender.balance;
          lender.balance = 0;
          lenders.pop();
        } else {
          // borrower can partially pay this lender
          payments.push({
            source: borrower.user_id,
            target: lender.user_id,
            amount: -borrower.balance
          });

          lender.balance += borrower.balance;
          borrower.balance = 0;
        }
      }
    });

    return payments;
  }
});

// define Meteor collection
Households = new Meteor.Collection("households", {
  transform: function(doc) {
    return new Household(doc);
  }
});

// publish only the households that this user is in
if(Meteor.isServer) {
  Meteor.publish("households", function () {
    return Households.find({user_ids: this.userId});
  });
}
