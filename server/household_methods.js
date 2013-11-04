function generateLogEntry(type, data) {
  return {
    time: new Date().getTime(),
    user: Meteor.user().primary_email(),
    type: type,
    data: data
  };
}

Meteor.methods({
  addUserToHousehold: function (email, household_id) {
    var user = Meteor.users.findOne({"emails.address": email});
    if(!user) {
      throw new Meteor.Error(404, "User with email " + email + " doesn't exist.");
    }
    var user_id = user._id;

    var logEntry = generateLogEntry("addUser", {userAdded: email});

    Households.update({_id: household_id}, {$addToSet: {user_ids: user_id}, $push: {log: logEntry}});
  },
  removeSelfFromHousehold: function (household_id) {
    var logEntry = generateLogEntry("removeSelf");

    Households.update({_id: household_id}, {$pull: {user_ids: this.userId}, $push: {log: logEntry}});
  },
  addExpenseToHousehold: function(household_id, expense) {
    Household.validateExpense(household_id, expense);

    var logEntry = generateLogEntry("addExpense", {newExpense: expense});
    console.log(logEntry);

    Households.update({_id: household_id}, {$push: {"expenses": expense, log: logEntry}});
  },
  updateExpenseInHousehold: function (household_id, expense) {
    Household.validateExpense(household_id, expense);

    var oldExpense = _.find(Households.findOne({_id: household_id}).expenses, function(existingExpense) {
      return existingExpense.created_at === expense.created_at;
    });
    var logEntry = generateLogEntry("updateExpense", {oldExpense: oldExpense, newExpense: expense});
    Households.update({_id: household_id, "expenses.created_at": expense.created_at}, {$set: {"expenses.$": expense}, $push: {log: logEntry}});
  },
  removeExpenseFromHousehold: function (household_id, expense) {
    Household.validateDeleteExpense(household_id, expense);

    var logEntry = generateLogEntry("removeExpense", {removedExpense: expense});

    Households.update({_id: household_id}, {$pull: {"expenses": {"created_at": expense.created_at}}, $push: {log: logEntry}});
  }
});
