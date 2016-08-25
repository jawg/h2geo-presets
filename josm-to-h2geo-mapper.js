if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

module.exports = function(josmPreset) {
  var preset = {};
  preset.name = {};
  preset.name.en = josmPreset.presets.$.shortdescription;
  preset.description = {};
  preset.description.en = josmPreset.presets.$.description;
  for (var i in josmPreset.presets.$) {
    if (i.indexOf(".") != -1) {
      var lang = i.substr(0, i.indexOf("."));
      var field = i.substr(i.indexOf(".") + 1);
      switch (field) {
        case 'shortdescription':
          preset.name[lang] = josmPreset.presets.$[i];
          break;
        case 'description':
            preset.description[lang] = josmPreset.presets.$[i];
          break;
      }
    }
  }
  console.log(preset);
  return preset;
};