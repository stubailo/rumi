/**
 * This is a very simple version of Rails' CanCan so that we can write permissions in one
 * place instead of everywhere.
 */

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
