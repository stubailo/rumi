Template.household_add_payment.newExpense = function() {
  return this.newTransaction();
};

Template.household_add_payment.events = {
  "submit form": function(event, template) {
    event.preventDefault();
    var formData = Util.serializeForm(template.find("form"));
    var expense = {};
    expense.user_id = Meteor.user()._id;
    expense.cost = -formData.amount;
    expense.portions = {};
    expense.portions[formData.to] = -formData.amount;

    this.addExpense(expense);
  }
};

// editing and deleting stuff
Template.household_payment_row.events = {
  "click .edit": function(event, template) {
    event.preventDefault();
    PageSession.set("household_expense_editing", this.created_at);
  },

  "click .delete": function(event, template) {
    event.preventDefault();
    Meteor.call("removeExpenseFromHousehold", this.household_id, this);
  }
};

Template.household_payment_row.helpers({
  target: function() {
    var targetPair = _.find(_.pairs(this.portions), function(pair) {
      return pair[1] < 0;
    });

    return targetPair[0];
  },

  amount: function() {
    var targetPair = _.find(_.pairs(this.portions), function(pair) {
      return pair[1] < 0;
    });

    return -targetPair[1];
  },

  user_ids: function() {
    return PageSession.get("household").user_ids;
  }
});

Template.household_payment_form_row.helpers({
  selected: function(expense) {
    return expense.portions[this] !== 0;
  },

  amount: function() {
    var targetPair = _.find(_.pairs(this.portions), function(pair) {
      return pair[1] < 0;
    });

    return -targetPair[1];
  }
});
