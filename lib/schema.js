var Validator = require('jsonschema').Validator;
var Resources = require('./resources.js');

var v = new Validator();
var availableResources = [];

/**
 * Internationalizable schema
 */
var i18nFieldSchema = {
  "id": "/I18N",
  "type": "object",
  "additionalProperties": {
    "type": "string"
  }
}
v.addSchema(i18nFieldSchema, "/I18N");

var i18nArraySchema = {
  "id": "/I18NArray",
  "type": "object",
  "additionalProperties": {
    "type": "array"
  }
}
v.addSchema(i18nArraySchema, "/I18NArray");

var i18nOptionalFieldSchema = {
  "id": "/I18NOptional",
  "oneOf": [
    {"$ref": "/I18N"},
    {"$ref": "/I18NArray"},
    {"type": "string"}
  ]
}
v.addSchema(i18nOptionalFieldSchema, "/I18NOptional");

/**
 * Resources
 */
Validator.prototype.customFormats.httpUrlFormat = function(input) {
  return /^(https?:)?\/\//i.test(input);
};
var httpUrlResourceSchema = {
  "id": "/HttpUrlResource",
  "type": "string",
  "format": "httpUrlFormat"
}
v.addSchema(httpUrlResourceSchema, "/HttpUrlResource");

Validator.prototype.customFormats.uriFormat = function(input) {
  return /^(carto|osmic|osm-icons):\/\//i.test(input);
};
var uriResourceSchema = {
  "id": "/UriResource",
  "type": "string",
  "format": "uriFormat"
}
v.addSchema(uriResourceSchema, "/UriResource");

Validator.prototype.customFormats.relativeFileFormat = function(input) {
  if (typeof input !== 'string') {
    return false;
  }
  if (!input.match(/^res:\/\/(.*)\.(svg|png|jpe?g)$/i)) {
    return false;
  }
  const resourceName = input.replace(/^res:\/\/(.*\.(?:svg|png|jpe?g))$/i, '$1');

  return availableResources.includes(resourceName);
};
var relativeFileResourceSchema = {
  "id": "/RelativeFileResource",
  "type": "string",
  "format": "relativeFileFormat"
}
v.addSchema(relativeFileResourceSchema, "/RelativeFileResource");

var i18nResourceObjectSchema = {
  "id": "/I18NResourceObject",
  "type": "object",
  "patternProperties": {
    "[a-z]+": "/Resource"
  }
}
v.addSchema(i18nResourceObjectSchema, "/I18NResourceObject");

var resourceSchema = {
  "id": "/Resource",
  "oneOf": [
    {"$ref": "/HttpUrlResource"},
    {"$ref": "/UriResource"},
    {"$ref": "/RelativeFileResource"},
    {"$ref": "/I18NResourceObject"}
  ]
}
v.addSchema(resourceSchema, "/Resource");

/**
 * Source
 */
var sourceSchema = {
  "id": "/Source",
  "type": "object",
  "properties": {
    "type": {"enum": ["TAG"], "required": true}, // Only implementation of type is TAG for now
    "key": {"type": "string", "required": true}
  },
  "additionalProperties": false
};
v.addSchema(sourceSchema, "/Source");

var existsConditionSchema = {
  "id": "/ConditionExists",
  "type": "object",
  "properties": {
    "type": {"enum": ["EXISTS"], "required": true},
    "value": {"type": "boolean", "required": true} // Value is boolean in case type is EXISTS
  },
  "additionalProperties": false
};
v.addSchema(existsConditionSchema, "/ConditionExists");

var equalsConditionSchema = {
  "id": "/ConditionEquals",
  "type": "object",
  "properties": {
    "type": {"enum": ["EQUALS"], "required": true},
    "value": {"required": true} // Value is string in case type is EQUALS
  },
  "additionalProperties": false
};
v.addSchema(equalsConditionSchema, "/ConditionEquals");

var conditionSchema = {
  "id": "/Condition",
  "type": "object",
  "oneOf": [
    {"$ref": "/ConditionExists"},
    {"$ref": "/ConditionEquals"}
  ]
};
v.addSchema(conditionSchema, "/Condition");

var actionSetTagValueSchema = {
  "id": "/ActionSetTagValue",
  "type": "object",
  "properties": {
    "type": {"enum": ["SET_TAG_VALUE"], "required": true},
    "key": {"type": "string", "required": true},
    "value": {"required": true}
  },
  "additionalProperties": false
};
v.addSchema(actionSetTagValueSchema, "/ActionSetTagValue");

var actionSchema = {
  "id": "/Action",
  "type": "object",
  "oneOf": [
    {"$ref": "/ActionSetTagValue"}
  ]
};
v.addSchema(actionSchema, "/Action");

var constraintSchema = {
  "id": "/Constraint",
  "type": "object",
  "properties": {
    "source": {"$ref": "/Source", "required": true},
    "condition": {"$ref": "/Condition", "required": true},
    "action": {"$ref": "/Action", "required": true}
  },
  "additionalProperties": false
};
v.addSchema(constraintSchema, "/Constraint");

var validationSchema = {
  "id": "/Validation",
  "type": "object",
  "properties": {
    "regex": {type: "string"},
    "length": {type: "number"},
    "minLength": {type: "number"},
    "maxLength": {type: "number"},
    "minValue": {type: "number"},
    "maxValue": {type: "number"},
    "minChoices": {type: "number"},
    "maxChoices": {type: "number"}
  },
  "additionalProperties": false
};
v.addSchema(validationSchema, "/Validation");

var constantTagSchema = {
  "id": "/TagConstant",
  "type": "object",
  "properties": {
    "key": {"type": "string", "required": true},
    "type": {"enum": ["CONSTANT"], "required": true},
    "description": {"$ref": "/I18NOptional"},
    "value": {"type": "string", "required": true},
    "required": {"type": "boolean"},
    "show": {"type": "boolean"},
    "editable": {"type": "boolean"}
  },
  "additionalProperties": false
};
v.addSchema(constantTagSchema, "/TagConstant");

var tagSchema = {
  "id": "/TagValue",
  "oneOf": [
    {"type": "string"},
    {"type": "object", "additionalProperties": {"$ref": "/I18NOptional"}}
  ]
};
v.addSchema(tagSchema, "/TagValue");

var stringValuesTagSchema = {
  "id": "/TagStringValues",
  "type": "object",
  "properties": {
    "key": {"type": "string", "required": true},
    "type": {"enum": ["TEXT", "NUMBER", "SINGLE_CHOICE", "MULTI_CHOICE", "OPENING_HOURS", "LEVEL"], "required": true},
    "description": {"$ref": "/I18NOptional"},
    "values": {"type": "array", "items": {"$ref": "/TagValue"}},
    "required": {"type": "boolean"},
    "show": {"type": "boolean"},
    "editable": {"type": "boolean"},
    "validation": {"$ref": "/Validation"}
  },
  "additionalProperties": false
};
v.addSchema(stringValuesTagSchema, "/TagStringValues");

var tagSchema = {
  "id": "/Tag",
  "type": "object",
  "oneOf": [
    {"$ref": "/TagStringValues"},
    {"$ref": "/TagConstant"}
  ]
};
v.addSchema(tagSchema, "/Tag");

var itemSchema = {
  "id": "/Item",
  "type": "object",
  "properties": {
    "name": {"type": "string", "required": true},
    "url": {"type": "string"},
    "label": {"$ref": "/I18NOptional", "required": true},
    "description": {"$ref": "/I18NOptional", "required": true},
    "keywords": {
      "$ref": "/I18NOptional",
      "required": true
    },
    "tags": {"type": "array", "items": {"$ref": "/Tag"}, "required": true},
    "constraints": {"type": "array", "items": {"$ref": "/Constraint"}}
  }
};
v.addSchema(itemSchema, "/Item");

var groupSchema = {
  "id": "/Group",
  "type": "object",
  "properties": {
    "name": {"$ref": "/I18NOptional", "required": true},
    "icon": {"$ref": "/Resource"},
    "url": {"type": "string"},
    "items": {"type": "array", "items": {"$ref": "/Item"}, "required": true}
  }
};
v.addSchema(groupSchema, "/Group");

var presetSchema = {
  "id": "/Preset",
  "type": "object",
  "properties": {
    "name": {"$ref": "/I18NOptional", "required": true},
    "version": {"type": "string", "required": true},
    "lastUpdate": {"type": "string"},
    "author": {"type": "string", "required": true},
    "description": {"$ref": "/I18NOptional", "required": true},
    "offlineArea": {"type": "array", "items": {"type": "array", "items": {"type": "number"}}},
    "image": {"$ref": "/Resource"},
    "groups": {"type": "array", "items": {"$ref": "/Group"}}
  }
};

module.exports = {
  "validate": function (element, presetName) {
    availableResources = Resources.availableResources(presetName);
    return v.validate(element, presetSchema);
  }
};
