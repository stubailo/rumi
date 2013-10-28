Template.household_add_expense.newExpense = function(){
  return this.newTransaction();
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

Template.household_expense_row_header.householdUsers = function() {
  return PageSession.get("household").user_ids;
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

Template.household_expense_edit_row.error = function (){
  return PageSession.get("household_expense_update_error");
};


Template.household_expense_edit_row.events = {
  "click .cancel": function(event, template) {
    event.preventDefault();
    PageSession.set("household_expense_editing", undefined);
  },

  "submit form": function(event, template) {
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

