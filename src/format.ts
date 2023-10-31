import fs from 'fs';
export type Tar = { [index: string]: Tar | mark };

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
		return this.x ? `new LineWith<${this.x}>("${this.id}", "${this.val}")` : `new Line("${this.id}", "${this.val}")`;
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
		return _with ? `new ParaWith("${this.id}", [${val}])` : `new Para("${this.id}", [${val}])`;
	}
	get comment() {
		let s = '';
		this.lines.forEach((v, i) => {
			if (i) s += '\n*';
			s += '@' + i + ' ';
			s += v.comment;
		});
		return s;
	}
}

const TS = fs.readFileSync('mc_type.ts', { encoding: 'utf-8' });

let out = '';

function format_obj(obj: Tar) {
	const arr = Object.entries(obj);
	out += '{';
	for (let i = 0; i < arr.length; i++) {
		const [k, v] = arr[i];
		if (v instanceof mark) {
			out += `\n/**${v.comment}*/\n"${k}":`;
			out += v.toString();
		} else {
			out += `"${k}":`;
			format_obj(v);
		}
		if (i !== arr.length - 1) {
			out += ',';
		}
	}
	out += '}';
}

export function format(obj: Tar) {
	format_obj(obj);
	return TS + 'export default ' + out;
}
