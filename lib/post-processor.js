/**
 * cleanup i18n fields.
 * A valid i18n field is of the following
 */
var processI18nField = function(field) {
  if (!field || typeof field === 'undefined') {
    return;
  }
  // If no default value
  if (typeof field.default === 'undefined') {
    if (typeof field.en != 'undefined') {
      // If EN present, set EN to default
      field.default = field.en;
    } else {
      // Else first available will be default
      field.default = field[Object.keys(field)[0]];
    }
  }
}

/**
 * Clean values and ensure they are all converted into an i18nalized map
 */
var cleanValues = function(values) {
  for (var i in values) {
    // {"key": "Value"} or {"key": {"default": "Default Value", "fr": "Valeur par défaut"}}
    var value = values[i];
    var key = Object.keys(value)[0];
    // "Value" or {"default": "Default Value", "fr": "Valeur par défaut"}
    value = value[key];
    if (typeof value === 'string') {
      // If string, transform string into object
      values[i] = {};
      values[i][key] = {"default": value};
    } else {
      // If object, process i18n fields
      processI18nField(value);
    }

  }
}

/**
 * This function cleans up a parsed object and ensures:
 * - every i18nalized field has a "default" entry
 * - all tag values fields are declared in a key/value form
 */
var postProcessCleanup = function(parsed) {
  for (var i in parsed.groups) {
    var group = parsed.groups[i];
    processI18nField(group.name);
    if (typeof group.description != 'undefined') {
      processI18nField(group.description);
    }
    console.log("-----------------------------------------------------")
    console.log("Processing group " + group.name.default);
    console.log("-----------------------------------------------------")
    for (var j in group.items) {
      var item = group.items[j];
      processI18nField(item.label);
      processI18nField(item.description);
      console.log("Processing item " + item.label.default);
      for (var k in item.tags) {
        var tag = item.tags[k];
        if (typeof tag.values != 'undefined') {
          // Tag has values
          cleanValues(tag.values);
        }
      }
    }
  }
}

module.exports = {
  "postProcessCleanup": postProcessCleanup
};
