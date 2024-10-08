import { MonotoneCubicHermitInterpolation } from "https://esm.sh/v135/@adaskothebeast/splines/es2022/splines.mjs";

import { clamp } from "/modules/stdlib/deps.ts";

export class MonotoneNormalSpline extends MonotoneCubicHermitInterpolation {
	at(t: number) {
		const t0 = this.xs[0];
		const tf = this.xs.at(-1)!;
		const ct = clamp(t, t0, tf);
		return super.interpolate(ct);
	}
}
