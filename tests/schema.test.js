const { expect } = require('chai');

const schemaValidator = require('../lib/schema');
const busStopsPreset = require('../sample/bus_stops.json');

describe('Tests on schema validator', () => {
  it('Should validate the bus_stops preset sample', () => {
    const result = schemaValidator.validate(busStopsPreset, 'bus_stops');

    expect(result.valid).to.equal(true);
  });

  it('Should not validate a bad preset', () => {
    const resultWithBadRelativeFile = schemaValidator.validate(
      { ...busStopsPreset, ...{ image: 'res://myUnknownFile.png' }},
      'bus_stops'
    );
    const resultWithBadRelativeFileExtension = schemaValidator.validate(
      { ...busStopsPreset, ...{ image: 'res://bus_stop.jpeeg' }},
      'bus_stops'
    );
    const resultWithBadProtocol = schemaValidator.validate(
      { ...busStopsPreset, ...{ image: 'badProtocol://bus_stop.png' }},
      'bus_stops'
    );
    const resultWithBadI18NResource = schemaValidator.validate(
      { ...busStopsPreset, ...{ image: { 'fr': 'badProtocol://bus_stop.png' } }},
      'bus_stops'
    );

    expect(resultWithBadRelativeFile.valid).to.equal(false);
    expect(resultWithBadRelativeFileExtension.valid).to.equal(false);
    expect(resultWithBadProtocol.valid).to.equal(false);
    expect(resultWithBadI18NResource.valid).to.equal(false);
  });
});
