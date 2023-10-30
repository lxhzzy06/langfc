import { format } from 'format';
import { parse } from 'parse';
import * as fs from 'fs';

export enum Eol {
	windows = '\r\n',
	unix = '\n'
}

interface Options {
	file: string;
	dist: string;
	exclude?: string[];
	eol?: Eol;
}

export default function langfc(options: Options) {
	const { file, dist, exclude, eol } = options;
	const content = fs.readFileSync(file, { encoding: 'utf-8' });
	const out = format(parse(content, eol ?? Eol.windows, exclude));
	fs.writeFileSync(dist, out, { encoding: 'utf-8' });
}
