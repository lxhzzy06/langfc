import { Player, RawMessage, world } from '@minecraft/server';

const LF: RawMessage = { text: '\n' };

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

export const enum Prefixes {}

abstract class Base<R> {
	constructor(public readonly id: string, public readonly val: R) {}
}

abstract class Raw<R> extends Base<R> {
	public abstract text(): RawMessage;
	send(prefix?: Prefixes, player?: Player) {
		(player ?? world).sendMessage(prefix ? { translate: prefix as any, with: this.text() } : this.text());
	}
}

abstract class RawWith<R, W> extends Base<R> {
	public abstract text(w: W): RawMessage;
	send(w: W, prefix?: Prefixes, player?: Player) {
		(player ?? world).sendMessage(prefix ? { translate: prefix as any, with: this.text(w) } : this.text(w));
	}
}

class Line extends Raw<string> {
	public text(): RawMessage {
		return { translate: this.id };
	}
}

class LineWith<T extends number> extends RawWith<string, WithT<T> | RawMessage> {
	public text(w: WithT<T> | RawMessage): RawMessage {
		return { translate: this.id, with: w };
	}
}

class Para extends Raw<Line[]> {
	public text(): RawMessage {
		const out: RawMessage[] = [];
		const len = this.val.length;
		for (let i = 0; i < len; i++) {
			const v = this.val[i];
			out.push(v.text());
			if (i !== len - 1) {
				out.push(LF);
			}
		}
		return { rawtext: [{ rawtext: out }] };
	}
}

class ParaWith<T extends Array<Line | LineWith<any>>> extends RawWith<[...T], ParaWithT<[...T]>> {
	public text(w: ParaWithT<[...T]>): RawMessage {
		const out: RawMessage[] = [];
		const len = this.val.length;
		for (let i = 0, wi = 0; i < len; i++) {
			const v = this.val[i];
			out.push(v instanceof Line ? v.text() : v.text((w as any)[wi++]));
			if (i !== len - 1) {
				out.push(LF);
			}
		}
		return { rawtext: [{ rawtext: out }] };
	}
}

// --------------------------------------------------------------------------------------------- //
