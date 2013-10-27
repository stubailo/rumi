Template.household_add_transaction.payment_tab = function () {
  return PageSession.get("addTransactionFormState") === "payment";
};

Template.household_add_transaction.events = {
  "click a.expense-tab": function (event, template) {
    PageSession.set("addTransactionFormState", "expense");
  },
  "click a.payment-tab": function (event, template) {
    PageSession.set("addTransactionFormState", "payment");
  }
};

Template.transactions.getUser = function(user_id) {
  return Meteor.users.findOne({_id: user_id});
};

Template.transactions.balances = function() {
  return this.getBalances();
};

Template.transactions.editing = function() {
  return this.created_at === PageSession.get("household_expense_editing");
};
Template.transactions.isPayment = function() {
  return this.cost < 0;
};

Template.household_add_expense.new_expense = function(){
  var portions = {};
  this.user_ids.forEach(function(user_id) {
    portions[user_id] = null;
  });
  return {
    portions: portions,
    user_id: Meteor.user()._id
  };
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

Template.household_add_expense.error = function () {
  return PageSession.get("household_expense_add_error");
};

function addExpenseError(error) {
  if(error) {
    PageSession.set("household_expense_add_error", error.reason);
  }
}

Template.household_add_expense.events = {
  "submit form": function(event, template) {
    event.preventDefault();

    var formData = Util.serializeForm(template.find("form"));
    formData.user_id = Meteor.user()._id;
    this.addExpense(formData, addExpenseError);
  }
};

Template.household_expense_edit_row.error = function (){
  return PageSession.get("household_expense_update_error");
};

// editing and deleting stuff
Template.household_expense_row.events = {
  "click .edit": function(event, template) {
    event.preventDefault();
    PageSession.set("household_expense_editing", this.created_at);
  },

  "click .delete": function(event, template) {
    event.preventDefault();
    Meteor.call("removeExpenseFromHousehold", this.household_id, this);
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

Template.household_payment_row.target = function() {
  var targetPair = _.find(_.pairs(this.portions), function(pair) {
    return pair[1] < 0;
  });

  return targetPair[0];
};

Template.household_payment_row.amount = function() {
  var targetPair = _.find(_.pairs(this.portions), function(pair) {
    return pair[1] < 0;
  });

  return -targetPair[1];
};

Template.household_payment_form_row.user_ids = function() {
  return PageSession.get("household").user_ids;
};

Template.household_payment_form_row.selected = function(expense) {
  return expense.portions[this] !== 0;
};

Template.household_payment_form_row.amount = function() {
  var targetPair = _.find(_.pairs(this.portions), function(pair) {
    return pair[1] < 0;
  });

  return -targetPair[1];
};

Template.household_expenses.events = {
  "click .cancel": function(event, template) {
    event.preventDefault();
    PageSession.set("household_expense_editing", undefined);
  },

  "submit form.edit-form": function(event, template) {
    event.preventDefault();
    var formData = Util.serializeForm(template.find("form.edit-form"));
    PageSession.get("household").updateExpense(formData, function(error) {
      if(error) {
        PageSession.set("household_expense_update_error", error.reason);
      } else {
        PageSession.set("household_expense_editing", null);
      }
    });
  }
};
