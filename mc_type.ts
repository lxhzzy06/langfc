import { RawMessage } from '@minecraft/server';

type WithT<L extends number, A extends string[] = [string]> = A['length'] extends L ? A : WithT<L, [string, ...A]>;

type ParaWithT<
	T extends Array<Line | LineWith<any>>,
	S extends Array<string[] | RawMessage> = [],
	I extends any[] = []
> = I['length'] extends T['length']
	? S
	: T[I['length']] extends Line
	? ParaWithT<T, S, [any, ...I]>
	: T[I['length']] extends LineWith<infer C>
	? ParaWithT<T, [...S, WithT<C> | RawMessage], [any, ...I]>
	: never;

class Raw {
	public id: string;
	public val: string;
	constructor(id: string, value: string) {
		this.id = id;
		this.val = value;
	}
}

class Line extends Raw {
	public text(): RawMessage {
		return { translate: this.id };
	}
}

class LineWith<T extends number> extends Raw {
	public text(w: WithT<T> | RawMessage): RawMessage {
		return { translate: this.id, with: w };
	}
}

class Para {
	static LF: RawMessage = { text: '\n' };
	public id: string;
	public val: Line[];
	constructor(id: string, val: Line[]) {
		this.id = id;
		this.val = val;
	}
	public text(): RawMessage {
		const out: RawMessage[] = [];
		const len = this.val.length;
		for (let i = 0; i < len; i++) {
			const v = this.val[i];
			out.push(v.text());
			if (i !== len - 1) {
				out.push(Para.LF);
			}
		}
		return { rawtext: out };
	}
}

class ParaWith<T extends Array<Line | LineWith<any>>> {
	public id: string;
	public val: T;
	constructor(id: string, val: [...T]) {
		this.id = id;
		this.val = val;
	}
	public text(w: ParaWithT<[...T]>): RawMessage {
		let wi = 0;
		const out: RawMessage[] = [];
		const len = this.val.length;
		for (let i = 0; i < len; i++) {
			const v = this.val[i];
			out.push(v instanceof Line ? v.text() : v.text((w as any)[wi++]));
			if (i !== len - 1) {
				out.push(Para.LF);
			}
		}
		return { rawtext: out };
	}
}

// --------------------------------------------------------------------------------------------- //
