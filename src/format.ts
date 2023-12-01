import fs from 'fs';
import path from 'path';
export type Tar = { [index: string]: Tar | mark };
export type Prefixes = { [index: string]: { id: string; comment: string } };

export abstract class mark {
	id: string;
	constructor(id: string) {
		this.id = id;
	}
	abstract toString(): string;
	abstract get comment(): string;
}

export class Line extends mark {
	val: string;
	x?: number;
	constructor(id: string, val: string, x?: number) {
		super(id);
		this.val = val;
		this.x = x;
	}
	toString() {
		return this.x ? `new LineWith<${this.x}>(\`${this.id}\`, \`${this.val}\`)` : `new Line(\`${this.id}\`, \`${this.val}\`)`;
	}
	get comment() {
		return this.val;
	}
}

export class Para extends mark {
	lines: Line[];
	constructor(id: string, lines: Line[]) {
		super(id);
		this.lines = lines;
	}
	toString() {
		let _with = false;
		const val: string[] = [];
		for (const l of this.lines) {
			if (l.x) _with = true;
			val.push(l.toString());
		}
		return _with ? `new ParaWith(\`${this.id}\`, [${val}])` : `new Para(\`${this.id}\`, [${val}])`;
	}
	get comment() {
		let s = '';
		this.lines.forEach((v, i) => {
			if (i) s += '\n*';
			s += `@${i + 1} `;
			s += v.comment;
		});
		return s;
	}
}

const TS = fs.readFileSync(path.join(__dirname, '../mc_type.ts'), { encoding: 'utf-8' });

let obj_str = '';

function format_obj(obj: Tar) {
	const arr = Object.entries(obj);
	obj_str += '{';
	for (let i = 0; i < arr.length; i++) {
		const [k, v] = arr[i];
		if (v instanceof mark) {
			obj_str += `\n/**${v.comment}*/\n"${k}":`;
			obj_str += v.toString();
		} else {
			obj_str += `"${k}":`;
			format_obj(v);
		}
		if (i !== arr.length - 1) {
			obj_str += ',';
		}
	}
	obj_str += '}';
}

function format_prefixes(prefixes: Prefixes) {
	let prefixes_str = 'export const enum Prefixes {';
	const arr = Object.entries(prefixes);
	for (let i = 0; i < arr.length; i++) {
		const [k, v] = arr[i];
		prefixes_str += `\n/**${v.comment}*/\n${k}=`;
		prefixes_str += `'${v.id}'`;
		if (i !== arr.length - 1) {
			prefixes_str += ',';
		}
	}
	prefixes_str += '}';
	return prefixes_str;
}

export function format(obj: Tar, prefixes: Prefixes) {
	format_obj(obj);
	return TS + 'export default ' + obj_str + '\n' + format_prefixes(prefixes);
}
