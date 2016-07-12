// Imports
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const rmdir = require('rmdir-recursive').sync;

// Constants
const outputDir = 'out/';
const baseDir = 'presets/';

/**
 * Process yaml file and translate into JSON. Output in output/ directory.
 * @param f the input yaml file
 * @return {"name": {"en": "The Preset Name"}, "description": {"en": "Your preset description"}, "file": "preset_file.json"}
 */
var processYaml = function (f) {
  // Convert Yaml to JSON
  var parsed = yaml.safeLoad(fs.readFileSync(baseDir + f));
  if (!parsed.name || !parsed.description) {
    throw "Invalid Yaml Structure for file " + f;
  }
  var filename = path.basename(f, path.extname(f)) + '.json';
  fs.writeFileSync(outputDir + filename, JSON.stringify(parsed));
  return {"name": parsed.name, "description": parsed.description, "file": filename};
};

/**
 * Process json file. Output in output/ directory.
 * @param f the input json file
 * @return {"name": {"en": "The Preset Name"}, "description": {"en": "Your preset description"}, "file": "preset_file.json"}
 */
var processJson = function (f) {
  var parsed = JSON.parse(fs.readFileSync(baseDir + f));
  if (!parsed.name) {
    throw "Invalid JSON Structure for file " + f;
  }
  var filename = path.basename(f);
  var filenameYml = path.basename(f, path.extname(f)) + '.yml';
  
  // Write to output directory
  fs.writeFileSync(outputDir + filename, JSON.stringify(parsed));
  
  // Convert JSON to Yaml
  fs.writeFileSync(baseDir + filenameYml, yaml.safeDump(parsed));
  // Remove Old JSON File
  fs.unlinkSync(baseDir + filename);
  return {"name": parsed.name, "description": parsed.description, "file": filename};
};

/**
 * Main processing function factory
 * @param presets the presets object
 * @returns {Function} the function which will process all files 
 */
var getFileProcessor = function(presets) {
  return function (f) {

    try {
      // Only process files
      var s = fs.statSync(baseDir + f);
      if (!s.isFile()) {
        return;
      }

      var ext = path.extname(f);
      var basename = path.basename(f);

      var p;
      // Process yaml or json files
      switch (ext) {
        case '.yml':
        case '.yaml':
          p = processYaml(f);
          presets[p.file] = p;
          break;
        case '.json':
          p = processJson(f);
          presets[p.file] = p;
          break;
      }
    } catch (err) {
      console.error(err);
    }
  }
};

var exec = function() {
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);  
  }

  var dir = fs.readdirSync(baseDir);
  var output = {
    revision: process.argv[2],
    lastUpdate: new Date().toISOString(),
    presets: {}
  };
  
  /**
   * Parse directory
   */
  dir.forEach(getFileProcessor(output.presets));

  fs.writeFileSync(outputDir + 'presets.json', JSON.stringify(output));

};


// Execute code
exec();
