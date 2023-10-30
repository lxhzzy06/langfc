import { Eol } from 'index';
import { O } from 'format';
let line = 1;
let EOL: Eol;
const COMMENT = '#';
const OBJ: O = {};

function set(keys: string[], t: [string, string, number]) {
	let temp: O = OBJ;
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (i === keys.length - 1) {
			Reflect.set(temp, key, t);
			break;
		} else if (!Reflect.get(temp, key)) {
			Reflect.set(temp, key, {});
		}
		temp = Reflect.get(temp, key) as O;
	}
}

function parse_line(s: string, exclude?: string[]) {
	if (s[0] === COMMENT) return;
	const equal = s.indexOf('=');
	if (equal < 0) throw Error('Not found the "=" sign at line ' + line);
	const id = s.slice(0, equal);
	if (exclude && exclude.includes(id)) {
		return;
	}
	const keys = id.split('.');
	const value = s.slice(equal + 1);
	const x = value.match(/%s/g)?.length;
	set(keys, [id, value, x as number]);
}

export function parse(lang: string, eol: Eol, exclude?: string[]) {
	EOL = eol;
	for (const s of lang.split(EOL).filter((v) => v.length)) {
		parse_line(s, exclude);
		line++;
	}
	return OBJ;
}
