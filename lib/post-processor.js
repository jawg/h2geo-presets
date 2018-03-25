const md5 = require('md5');

/**
 * cleanup i18n fields.
 * A valid i18n field is of the following
 */
var processI18nField = function(field) {
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
 * Cleanup image fields.
 * URIs must be transformed into URLs.
 */
const URI_REGEX = /^(carto|osmic|osm-icons|https?|res):\/\/(.*)$/;
const processImageField = function(field) {
  function cleanUri(uri) {
    const prefix = uri.replace(URI_REGEX, '$1');
    const imageName = uri.replace(URI_REGEX, '$2');

    switch (prefix) {
      case 'carto':
        return `https://raw.githubusercontent.com/gravitystorm/openstreetmap-carto/master/symbols/${imageName}.svg`;
      case 'osmic':
        return `https://raw.githubusercontent.com/gmgeo/osmic/master/${imageName}.svg`;
      case 'osm-icons':
        /* The directory names are from the first two characters of the md5 hash of the final filename.
         * Source: https://www.mediawiki.org/wiki/Manual:Image_administration#Data_storage */
        const hash = md5(imageName.replace(/ /g, '_') + '.svg');
        return `http://osm-icons.org/images/${hash[0]}/${hash.substring(0,2)}/${imageName}.svg`;
      case 'res':
        return `file://${imageName}`;
      case 'http':
      case 'https':
        return uri;
      default:
        console.log('Unsupported prefix: ' + prefix);
        return;
    }
  }

  if (typeof field === 'string') {
    return cleanUri(field);
  } else if (typeof field === 'object') {
    for (const language of Object.keys(field)) {
      field[language] = cleanUri(field[language]);
    }
    return field;
  } else {
    console.log('Unknown field type for an image: ' + field);
  }
};

/**
 * Clean values and ensure they are all converted into an i18nalized map
 */
var cleanValues = function(values) {
  for (var i in values) {
    // {"key": "Value"} or {"key": {"default": "Default Value", "fr": "Valeur par défaut"}}
    var value = values[i];

    if (typeof value === 'string') {
      // If string, transform string into object
      values[i] = {};
      values[i][value] = {"default": value};
    } else {
      var key = Object.keys(value)[0];
      // "Value" or {"default": "Default Value", "fr": "Valeur par défaut"}
      value = value[key];
      if (typeof value === 'string') {
        value = values[i][key] = {"default": value};
      } else {
        // If object, process i18n fields
        processI18nField(value);
      }
    }

  }
}

/**
 * This function cleans up a parsed object and ensures:
 * - every i18nalized field has a "default" entry
 * - all tag values fields are declared in a key/value form
 */
var postProcessCleanup = function(parsed) {
  if (typeof parsed.image != 'undefined') {
    parsed.image = processImageField(parsed.image);
  }
  for (var i in parsed.groups) {
    var group = parsed.groups[i];
    processI18nField(group.name);
    if (typeof group.description != 'undefined') {
      processI18nField(group.description);
    }
    if (typeof group.icon != 'undefined') {
      group.icon = processImageField(group.icon);
    }
    console.log("-----------------------------------------------------")
    console.log("Processing group " + group.name.default);
    console.log("-----------------------------------------------------")
    for (var j in group.items) {
      var item = group.items[j];
      processI18nField(item.label);
      processI18nField(item.description);
      if (typeof item.icon != 'undefined') {
        item.icon = processImageField(item.icon);
      }
      console.log("Processing item " + item.label.default);
      for (var k in item.tags) {
        var tag = item.tags[k];
        if (typeof tag.values != 'undefined') {
          // Tag has values
          cleanValues(tag.values);
        }
        if (typeof tag.images != 'undefined') {
          tag.images = processImageField(tag.images);
        }
      }
    }
  }
};

module.exports = {
  "postProcessCleanup": postProcessCleanup
};
