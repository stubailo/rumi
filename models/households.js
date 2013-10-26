Household = function (doc) {
  _.extend(this, doc);
};

Household.attributes = ["_id", "name", "user_ids"];

_.extend(Household.prototype, {
  // Household methods go here

  users: function() {
    return Meteor.users.find({_id: {$in: this.user_ids}}).fetch();
  },

  // the argument is a dictionary of user_ids to numbers
  addExpense: function(obj) {
    // TODO: add check to make sure this expense is allowed
    // TODO: make sure expenses are numbers lol

    obj.created_at = new Date().getTime();
    obj.household_id = this._id;
    Households.update({_id: this._id}, {$push: {expenses: obj}}); 
  },

  updateExpense: function(obj) {
    var old_expense = _.find(this.expenses, function(expense) {
      return expense.created_at === obj.created_at;
    });

    var new_expense = _.extend({}, old_expense, obj);
    console.log(old_expense, obj, new_expense);

    Meteor.call("updateExpenseInHousehold", this._id, new_expense);
  }
});

Households = new Meteor.Collection("households", {
  transform: function(doc) {
    return new Household(doc);
  }
});

if(Meteor.isServer) {
  Meteor.publish("households", function () {
    return Households.find({user_ids: this.userId});
  });

  Households.allow({
    insert: function (userId, household) {
      var keys = _.keys(household);
      var allowed_keys = Household.attributes;
      keys.sort();
      allowed_keys.sort();

      var propertiesAllowed = _.isEqual(keys, allowed_keys);
      var userIdsIsArray = household.user_ids instanceof Array;
      var userOwns = _.contains(household.user_ids, userId);
      return propertiesAllowed && userIdsIsArray && userOwns;
    },

    update: function (userId, household) {
      var userOwns = _.contains(household.user_ids, userId);
      return userOwns;
    }
  });
}
