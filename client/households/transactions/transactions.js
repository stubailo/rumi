Template.transactions.helpers({
  editing: function() {
    return this.created_at === PageSession.get("household_expense_editing");
  },
  isPayment: function() {
    return this.cost < 0;
  },
  payment_tab: function () {
    return PageSession.get("addTransactionFormState") === "payment";
  }
});

Template.transactions_balances.helpers({
  balances: function() {
    return this.getBalances();
  }
});

Template.transactions.events = {
  "click a.expense-tab": function (event, template) {
    PageSession.set("addTransactionFormState", "expense");
  },
  "click a.payment-tab": function (event, template) {
    PageSession.set("addTransactionFormState", "payment");
  }
};
