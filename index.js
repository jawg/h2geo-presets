// Imports
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const rmdir = require('rmdir-recursive').sync;
const validator = require('./lib/schema');
const postProcessor = require('./lib/post-processor');

// Constants
const outputDir = 'out/';
const baseDir = 'presets/';

/**
 * Process yaml file and translate into JSON. Output in output/ directory.
 * @param f the input yaml file
 * @return {"name": {"en": "The Preset Name"}, "description": {"en": "Your preset description"}, "file": "preset_file.json", "image": "image_url"}
 */
function processYaml(f) {
  // Convert Yaml to JSON
  var parsed = yaml.safeLoad(fs.readFileSync(baseDir + f));
  var presetName = path.basename(f, path.extname(f));
  var filename = presetName + '.json';
  var validation = validator.validate(parsed, presetName);
  if (!validation.valid) {
    console.error("File " + f + " is invalid. Will be ignored in parsing.");
    console.error(validation.errors);
    process.exit(1);
  } else {
    console.log("File " + f + " is valid. Will be parsed as preset.");
    postProcessor.postProcessCleanup(presetName, parsed);
  }
  fs.writeFileSync(outputDir + filename, JSON.stringify(parsed));
  return {"name": parsed.name, "description": parsed.description, "version": parsed.version, "image": parsed.image, "file": filename};
};

/**
 * Process json file. Output in output/ directory.
 * @param f the input json file
 * @return {"name": {"en": "The Preset Name"}, "description": {"en": "Your preset description"}, "file": "preset_file.json"}
 */
function processJson(f) {
  var parsed = JSON.parse(fs.readFileSync(baseDir + f));
  var presetName = path.basename(f, path.extname(f));
  var filename = path.basename(f);
  var filenameYml = presetName + '.yml';
  var validation = validator.validate(parsed, presetName);
  if (!validation.valid) {
    console.error("File " + f + " is invalid. Will be ignored in parsing.");
    console.error(validation.errors);
    process.exit(1);
  } else {
    console.log("File " + f + " is valid. Will be parsed as preset.");
    postProcessor.postProcessCleanup(parsed);
  }

  // Write to output directory
  fs.writeFileSync(outputDir + filename, JSON.stringify(parsed));

  // Convert JSON to Yaml
  fs.writeFileSync(baseDir + filenameYml, yaml.safeDump(parsed));
  // Remove Old JSON File
  fs.unlinkSync(baseDir + filename);
  return {"name": parsed.name, "description": parsed.description, "image": parsed.image, "file": filename};
};

/**
 * Main processing function factory
 * @param presets the presets object
 * @returns {Function} the function which will process all files
 */
function getFileProcessor(presets) {
  return (f) => {

    try {
      // Only process files
      var s = fs.statSync(baseDir + f);
      if (!s.isFile()) {
        return;
      }

      const ext = path.extname(f);
      const basename = path.basename(f);
      const presetName = path.basename(f, ext);

      let p;
      // Process yaml or json files
      switch (ext) {
        case '.yml':
        case '.yaml':
          p = processYaml(f);
          presets[p.file] = p;
          break;
        case '.json':
          p = processJson(f);
          validator.validate(p, presetName);
          presets[p.file] = p;
          break;
      }
    } catch (err) {
      console.error(err);
      process.exit(-1);
    }
  }
};



function exec() {
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const dir = fs.readdirSync(baseDir);
  const output = {
    revision: process.argv[2],
    lastUpdate: new Date().toISOString(),
    presets: {}
  };

  // Parse directory and process each file
  dir.forEach(getFileProcessor(output.presets));

  // Copy all resources to output
  fs.copySync('resources', outputDir + 'resources');
  fs.writeFileSync(outputDir + 'presets.json', JSON.stringify(output));

};


// Execute code
exec();
