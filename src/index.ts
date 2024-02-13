import { format } from './format.js';
import { parse } from './parse.js';
import * as fs from 'fs';

export enum Eol {
	windows = '\r\n',
	unix = '\n'
}

interface Options {
	input: string | string[];
	dist: string;
	exclude?: Array<string | RegExp>;
	eol?: Eol;
}

export default function langfc(options: Options) {
	const { input, dist, exclude, eol } = options;
	if (typeof input === 'string') {
		fs.readFile(input, (err, data) => {
			if (err) throw err;
			const out = format(...parse([data.toString()], eol ?? Eol.windows, exclude));
			fs.writeFileSync(dist, out, { encoding: 'utf-8' });
		});
	} else {
		const out = format(
			...parse(
				input.map((f) => fs.readFileSync(f).toString()),
				eol ?? Eol.windows,
				exclude
			)
		);
		fs.writeFileSync(dist, out, { encoding: 'utf-8' });
	}
}

