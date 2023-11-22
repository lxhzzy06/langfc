import { Eol } from './index';
import { Tar, Line, Para, Prefixes } from './format';
let line = 1;
let EOL: Eol;
const OBJ: Tar = {};
type VT = Tar[keyof Tar];
let EXCLUDE: Array<string | RegExp>;

enum Token {
	Comment = '##',
	Para = 'Para',
	Prefix = 'Prefix'
}

function set(keys: string[], t: VT) {
	let temp: Tar = OBJ;
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (i === keys.length - 1) {
			Reflect.set(temp, key, t);
			break;
		} else if (!Reflect.get(temp, key)) {
			Reflect.set(temp, key, {});
		}
		temp = Reflect.get(temp, key) as Tar;
	}
}

function parse_line(s: string): [string, string] | undefined {
	if (s.startsWith(Token.Comment)) return;
	const equal = s.indexOf('=');
	if (equal < 0) throw Error('Not found the "=" sign at\n' + (line + 1) + ': ' + s + '\n');
	const id = s.slice(0, equal);
	for (const e of EXCLUDE) if (typeof e === 'string' ? id === e : e.test(id)) return;
	const val = s.slice(equal + 1).split('	##')[0];
	return [id, val];
}

export function parse(lang: string, eol: Eol, exclude?: Array<string | RegExp>): [Tar, Prefixes] {
	EOL = eol;
	EXCLUDE = exclude ?? [];
	const Prefixes: Prefixes = {};
	const lines = lang.split(EOL);
	for (line = 0; line < lines.length; line++) {
		let t: VT;
		let keys: string[] = [];
		const s = lines[line];
		if (!s.length) continue;
		if (s.startsWith('##/')) {
			const argv = s.split(' ').slice(1);
			switch (argv[0]) {
				case Token.Para:
					{
						const n = line + Number(argv[2]) - 1;
						const arr: Line[] = [];
						const id = argv[1];
						keys = id.split('.');
						do {
							const r = parse_line(lines[++line]);
							if (!r) continue;
							arr.push(new Line(...r, r[1].match(/%s/g)?.length));
						} while (line <= n);
						t = new Para(id, arr);
					}
					break;

				case Token.Prefix:
					{
						const l = parse_line(lines[++line]);
						if (l === undefined) throw Error('Cannot parse prefix at ' + line);
						Prefixes[argv[1]] = { id: l[0], comment: l[1] };
					}
					break;
			}
		} else {
			const r = parse_line(s);
			if (!r) continue;
			const [id, val] = r;
			keys = id.split('.');
			t = new Line(id, val, val.match(/%s/g)?.length);
		}
		set(keys, t!);
	}
	return [OBJ, Prefixes];
}
