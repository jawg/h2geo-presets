if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

function mapHeaders(preset, josmPreset) {
  preset.version = josmPreset.presets.$.version;
  preset.author = josmPreset.presets.$.author;
  preset.link = josmPreset.presets.$.link;

  preset.name = {};
  preset.name.en = josmPreset.presets.$.shortdescription;
  preset.description = {};
  preset.description.en = josmPreset.presets.$.description;
  preset.name = getI18nFields(josmPreset.presets.$, 'shortdescription');
  preset.description = getI18nFields(josmPreset.presets.$, 'description');
  // Mapping i18n name and description
  for (var i in josmPreset.presets.$) {

  }
}

/**
 * Retrieve internationalized fields from specific field name
 * @param obj the object which i18n fields are present
 * @param fieldName the name of the requested field
 * @returns {'en': 'value en', 'fr': 'value fr', ...}
 */
function getI18nFields(obj, fieldName) {
  var result = {};
  // Mapping i18n name and description
  var field;
  for (var i in obj) {
    if (i === fieldName) {
      result['default'] = obj[i];
    } else if (i.indexOf('.') != -1 && (field = i.substr(i.indexOf('.') + 1) === fieldName)) {
      var lang = i.substr(0, i.indexOf('.'));
      result[lang] = obj[i];
    }
  }
  return result;
}

/**
 * Map groups
 * @param preset
 * @param josmPreset
 */
function mapGroups(preset, josmPreset) {
  preset.groups = [];
  for (var i in josmPreset.presets.group) {
    var presetGroup = preset.groups[i] = {};
    var josmGroup = josmPreset.presets.group[i];
    presetGroup.name = getI18nFields(josmGroup.$, 'name');
    presetGroup.icon = josmGroup.$.icon;
    presetGroup.description = getI18nFields(josmPreset.presets.$, 'description');
    presetGroup.items = [];
    for (var j in josmGroup.item) {
      var presetItem = presetGroup.items[j] = {};
      var josmItem = josmGroup.item[j];
      presetItem.name = getKeys(josmItem);
      // FIXME only one supported link
      presetItem.url = josmItem.link[0].$.href;
      presetItem.label = getI18nFields(josmItem.$, 'name');
      presetItem.tags = [];
      // Parse constants
      if (josmItem.key) {
        for (var i in josmItem.key) {
          presetItem.tags.push({"key": josmItem.key[i].$.key, 'value': josmItem.key[i].$.value, 'type': 'CONSTANT', 'description': getI18nFields(josmItem.key[i], 'text')});
        }
      }
      // Parse single choice
      if (josmItem.combo) {
        for (var i in josmItem.combo) {
          //console.log(josmItem.combo[i]);
          presetItem.tags.push({
            "key": josmItem.combo[i].$.key,
            'values': josmItem.combo[i].$.values.split(','),
            'type': 'SINGLE_CHOICE',
            'description': getI18nFields(josmItem.combo[i], 'text')
          });
        }
      }
      // Parse multi choice
      // Parse number
      // Parse text
      // Parse opening hours
    }


  }
}

function getKeys(item) {
  var result = '';
  for (var i in item.key) {
    if (i == 0) {
      result = item.key[i].$.key + '=' + item.key[i].$.value;
    } else {
      result = item.key[i].$.key + '=' + item.key[i].$.value + ',' + result;
    }
  }
  return result;
}

module.exports = function (josmPreset) {
  var preset = {};
  // Map name, description, author, etc...
  mapHeaders(preset, josmPreset);
  // Map 
  mapGroups(preset, josmPreset);
  return preset;
};