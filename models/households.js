Household = function (doc) {
  _.extend(this, doc);
};

Household.attributes = ["_id", "name", "user_ids"];

_.extend(Household.prototype, {
  // Household methods go here

  users: function() {
    console.log(Meteor.users.find().fetch());
    return Meteor.users.find({_id: {$in: this.user_ids}}).fetch();
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
    }
  });
}
