const fs = require('fs-extra');

const RESOURCE_FOLDER = __dirname + '/../resources/';
const DESTINATION_FOLDER = __dirname + '/../out/';

/**
 * Gives the list of resources defined for a preset.
 *
 * @param {String} presetName - Name of the preset
 * @return {Array.<String>} List of the resources defined for this preset
 */
function availableResources(presetName) {
  return fs.readdirSync(RESOURCE_FOLDER + presetName).filter(fileName => fileName !== '.DS_Store');
}

/**
 * Copy the given list of resources for the given preset
 *
 * @param {String} presetName - Name of the preset
 * @param {Array.<String>} resourceNames - Names of the resources which should be added
 */

function copyResources(presetName, resourceNames) {
  if (!fs.existsSync(DESTINATION_FOLDER + presetName)) {
    fs.mkdirSync(DESTINATION_FOLDER + presetName);
  }

  resourceNames.forEach(resourceName => fs.copySync(RESOURCE_FOLDER + presetName + '/' + resourceName, DESTINATION_FOLDER + presetName + '/' + resourceName));
}

module.exports = {
  availableResources,
  copyResources,
};
