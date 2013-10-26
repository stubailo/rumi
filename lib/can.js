Ability = {
  can: function (action, type, obj) {
    switch(action + " " + type) {
      case "update expense":
        return Meteor.user()._id === obj.user_id;
      case "update household":
        return _.contains(obj.user_ids, Meteor.user()._id);
      default:
        return false;
    }
  }
};
