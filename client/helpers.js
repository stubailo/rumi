Handlebars.registerHelper("object", function(obj) {
  return _.map(obj, function(value, key) {
    return {key: key, value: value};
  });
});

Handlebars.registerHelper("user", function(user_id) {
  return Meteor.users.findOne({_id: user_id});
});

Handlebars.registerHelper("user_email", function(user_id) {
  var user = Meteor.users.findOne({_id: user_id});
  if(user) {
    return user.primary_email();
  }
});

Handlebars.registerHelper("can", function(action, type, obj) {
  return Ability.can(action, type, obj);
});

Handlebars.registerHelper("equals", function(a, b) {
  return a === b;
});

Handlebars.registerHelper("formatTime", function(timestamp) {
  return moment(timestamp).format('h:mm:ss a [on] MMMM Do YYYY');
});

Handlebars.registerHelper("currentPageIs", function(page) {
  return PageSession.get("page") === page;
});

Handlebars.registerHelper("formatCurrency", function(amount) {
  return "$" + amount.toFixed(2);
});
