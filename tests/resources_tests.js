const { expect } = require('chai');
const fs = require('fs-extra');

const resourcesHandler = require('../lib/resources');

describe('Tests on resource handler', () => {
  it('Test on availableResources', (done) => {
    const resourceNames = resourcesHandler.availableResources('tests');

    expect(resourceNames).to.deep.equal(['file_name_1.png', 'file_name_2.png']);

    done();
  });

  it('Test on copyResources', (done) => {
    resourcesHandler.copyResources('tests', ['file_name_1.png', 'file_name_2.png']);

    const fileNames = fs.readdirSync(__dirname + '/../out/tests/');
    expect(fileNames).to.deep.equal(['file_name_1.png', 'file_name_2.png']);

    fs.removeSync(__dirname + '/../out/tests/');

    done();
  });
});
