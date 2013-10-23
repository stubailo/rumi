User = function(doc) {
  _.extend(this, doc);
};

_.extend(User.prototype, {
  // User methods go here
  
  households: function() {
    return Households.find({user_ids: this._id});
  },

  primary_email: function() {
    return this.emails[0].address;
  }
});

Meteor.users._transform = function(doc) {
  return new User(doc);
};

if(Meteor.isServer) {
  Meteor.publish("allUsers", function() {
    return Meteor.users.find({}, {fields: {emails: 1}});
  });
}
