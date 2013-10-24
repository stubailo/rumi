// utility functions

Util = _.extend({

  /**
   * This function serializes the contents of a form into an object where the keys
   * are the names of the fields, and the values are the values in the form.
   */
  serializeForm: function(el) {
    var out = {};
    var $el = $(el);
    $el.serializeArray().forEach(function(obj) {
      var isNumber = $el.find("[name='" + obj.name + "']").attr("type") === "number";

      var path = obj.name.split(".");
      var attrName = _.last(path);
      path = _.initial(path);
      
      // path is the nested set of objects you need, attrName is the final key

      var node = out;
      path.forEach(function(pathNode) {
        if(!node[pathNode]) {
          node[pathNode] = {};
        }

        node = node[pathNode];
      });

      if(isNumber) {
        obj.value = parseFloat(obj.value, 10);
      }
      
      node[attrName] = obj.value; 
    });

    return out;
  }
});
