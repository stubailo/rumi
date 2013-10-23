// utility functions

Util = _.extend({

  /**
   * This function serializes the contents of a form into an object where the keys
   * are the names of the fields, and the values are the values in the form.
   */
  serializeForm: function(el) {
    return _.object(_.map($(el).serializeArray(), function(obj) {
      return [obj.name, obj.value]; 
    }));
  }
});
