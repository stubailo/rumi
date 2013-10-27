Meteor.methods({
  addUserToHousehold: function (email, household_id) {
    var user = Meteor.users.findOne({"emails.address": email});
    if(!user) {
      throw new Meteor.Error(404, "User with email " + email + " doesn't exist.");
    }
    var user_id = user._id;
    Households.update({_id: household_id}, {$addToSet: {user_ids: user_id}});
  },
  removeSelfFromHousehold: function (household_id) {
    Households.update({_id: household_id}, {$pull: {user_ids: this.userId}});
  },
  addExpenseToHousehold: function(household_id, expense) {
    Household.validateExpense(household_id, expense);
    Households.update({_id: household_id}, {$push: {"expenses": expense}});
  },
  updateExpenseInHousehold: function (household_id, expense) {
    Household.validateExpense(household_id, expense);
    Households.update({_id: household_id, "expenses.created_at": expense.created_at}, {$set: {"expenses.$": expense}});
  },
  removeExpenseFromHousehold: function (household_id, expense) {
    Household.validateDeleteExpense(household_id, expense);
    console.log(expense);
    Households.update({_id: household_id}, {$pull: {"expenses": {"created_at": expense.created_at}}});
  }
});
