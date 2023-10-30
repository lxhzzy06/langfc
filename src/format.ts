export type O = { [index: string]: O | [string, string, number] };

const TS = `import { RawMessage } from '@minecraft/server';
type With<L extends number, A extends string[] = [string]> = A['length'] extends L ? A : With<L, [string, ...A]>;

class Raw {
	public id: string;
	public raw: string;
	constructor(id: string, raw: string) {
		this.id = id;
		this.raw = raw;
	}
}

class RawText extends Raw {
	public text(): RawMessage {
		return { translate: this.id };
	}
}

class RawTextWithString<T extends number> extends Raw {
	constructor(id: string, raw: string) {
		super(id, raw);
	}
	public text(s: With<T> | RawMessage): RawMessage {
		return { translate: this.id, with: s };
	}
}

`;

let out = '';

function format_obj(obj: O) {
	const arr = Object.entries(obj);
	out += '{';
	for (let i = 0; i < arr.length; i++) {
		const [k, v] = arr[i];
		if (v instanceof Array) {
			const [id, value, x] = v;
			out += `\n/**${value}*/\n"${k}":`;
			out += x ? `new RawTextWithString<${x}>("${id}", "${value}")` : `new RawText("${id}", "${value}")`;
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

export function format(obj: O) {
	format_obj(obj);
	return TS + 'export default ' + out;
}
