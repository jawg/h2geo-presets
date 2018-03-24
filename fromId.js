// Imports
const fs = require('fs');
const yaml = require('js-yaml');
const validator = require('./lib/schema');

// Constants
const IN_FOLDER = 'id_presets';
const OUT_FOLDER = 'id_presets_out';

// Input data from iD presets
const fields = JSON.parse(fs.readFileSync(IN_FOLDER+'/fields.json')).fields;
const presets = JSON.parse(fs.readFileSync(IN_FOLDER+'/presets.json')).presets;

// Converter
for(let k of Object.keys(presets)) {
	const preset = presets[k];
	
	if(preset.fields && (k.match(/\//g) || []).length === 1) {
		const out = {
			name: {
				default: preset.name+" preset",
				en: preset.name+" preset"
			},
			version: "0.1",
			author: "iD developers",
			description: {
				default: preset.name,
				en: preset.name
			},
			groups: [{
				name: {
					default: preset.name+" group",
					en: preset.name+" group"
				},
				items: [{
					name: {
						default: preset.name,
						en: preset.name
					},
					tags: []
				}]
			}]
		};
		
		for(let t of Object.keys(preset.tags)) {
			out.groups[0].items[0].tags.push({
				type: 'CONSTANT',
				key: t,
				value: preset.tags[t]
			});
		}
		
		for(let fk of preset.fields) {
			const field = fields[fk];
			
			const val = {
				key: field.key
			};
			let ok = true;
			
			switch(field.type) {
				case 'check':
					val.type = 'SINGLE_CHOICE';
					val.values = [ 'yes', 'no' ];
					break;
				case 'number':
				case 'maxspeed':
					val.type = 'NUMBER';
					break;
				case 'localized':
				case 'text':
				case 'textarea':
				case 'tel':
					val.type = 'TEXT';
					break;
				case 'url':
					val.type = 'TEXT';
					val.format = 'url';
					break;
				case 'structureRadio':
					if(field.keys && field.keys.length > 0) {
						val.type = 'SINGLE_CHOICE';
						val.values = field.keys;
					}
					else {
						console.log(k);
						ok = false;
					}
					break;
				case 'combo':
				case 'radio':
					if(field.options) {
						val.type = 'SINGLE_CHOICE';
						val.values = field.options;
					}
					else {
						ok = false;
					}
					break;
				default:
					console.log("unrecognized:", field.type);
// 					console.log(field);
					ok = false;
			}
			
			if(ok) {
				out.groups[0].items[0].tags.push(val);
			}
		}
		
		if(out.groups[0].items[0].tags.length > 0 && validator.validate(out)) {
			fs.writeFileSync(OUT_FOLDER+'/'+k.replace("/", "_")+'.yaml', yaml.dump(out));
		}
		else {
			console.log("Empty or invalid preset", k);
		}
	}
}
