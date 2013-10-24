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
