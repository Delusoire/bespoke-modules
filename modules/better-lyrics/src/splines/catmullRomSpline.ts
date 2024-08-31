import {
	remapScalar,
	scalarLerp,
	type vector,
	vectorDist,
	vectorLerp,
} from "/modules/Delusoire.delulib/lib/math.ts";
import { slidingWindows, sortBy, unzip } from "/hooks/std/collections.ts";
import { clamp, sortedLastIndexBy } from "/modules/stdlib/deps.ts";

export type vectorWithTime = [number, vector];

type Quadruplet<A> = readonly [A, A, A, A];
type PointQuadruplet = Quadruplet<vector>;
type TimeQuadruplet = Quadruplet<number>;
export type PointInTimeQuadruplet = Quadruplet<vectorWithTime>;
class CatmullRomCurve {
	private constructor(
		private P: PointQuadruplet,
		private T: TimeQuadruplet,
	) {}

	static fromPointsAndAlpha(P: PointQuadruplet, alpha: number) {
		const T = slidingWindows(P, 2)
			.map(([Pi, Pj]) => vectorDist(Pi, Pj) ** alpha)
			.map((ki, i, kis) => (i > 0 ? kis[i - 1] : 0) + ki) as unknown as TimeQuadruplet;
		return new CatmullRomCurve(P, T);
	}

	static fromPointsInTime(points: PointInTimeQuadruplet) {
		const [T, P] = unzip(points) as unknown as [TimeQuadruplet, PointQuadruplet];
		return new CatmullRomCurve(P, T);
	}

	at(t: number) {
		t = clamp(t, this.T[1], this.T[2]);
		const vectorLerpWithRemapedScalar = (s: vectorWithTime, e: vectorWithTime, x: number) =>
			vectorLerp(s[1], e[1], remapScalar(s[0], e[0], x));

		const A = [
			vectorLerpWithRemapedScalar([this.T[0], this.P[0]], [this.T[1], this.P[1]], t),
			vectorLerpWithRemapedScalar([this.T[1], this.P[1]], [this.T[2], this.P[2]], t),
			vectorLerpWithRemapedScalar([this.T[2], this.P[2]], [this.T[3], this.P[3]], t),
		];
		const B = [
			vectorLerpWithRemapedScalar([this.T[0], A[0]], [this.T[2], A[1]], t),
			vectorLerpWithRemapedScalar([this.T[1], A[1]], [this.T[3], A[2]], t),
		];
		return vectorLerpWithRemapedScalar([this.T[1], B[0]], [this.T[2], B[1]], t);
	}
}

export class AlphaCatmullRomSpline {
	private catnumRollCurves;

	private constructor(
		private points: Array<vector>,
		alpha: number,
	) {
		this.catnumRollCurves = slidingWindows(points, 4).map((P) =>
			CatmullRomCurve.fromPointsAndAlpha(P as unknown as PointQuadruplet, alpha)
		);
	}

	at(t: number) {
		const i = Math.floor(t);
		return this.catnumRollCurves[i].at(t - i);
	}

	static fromPoints(points: Array<vector>, alpha = 0.5) {
		if (points.length < 4) return null;

		return new AlphaCatmullRomSpline(points, alpha);
	}

	static fromPointsClamped(points: Array<vector>, alpha = 0.5) {
		if (points.length < 2) return null;

		const [P1, P2] = points;
		const P3 = points.at(-2)!;
		const P4 = points.at(-1)!;
		const P0 = vectorLerp(P1, P2, -1);
		const P5 = vectorLerp(P3, P4, 2);

		return AlphaCatmullRomSpline.fromPoints([P0, ...points, P5], alpha);
	}
}

export class CatmullRomSpline {
	private points;
	private catnumRollCurves;

	private constructor(points: Array<vectorWithTime>) {
		this.points = sortBy(points, (p) => p[0]);

		this.catnumRollCurves = slidingWindows(this.points, 4).map((P) =>
			CatmullRomCurve.fromPointsInTime(P as unknown as PointInTimeQuadruplet)
		);
	}

	at(t: number) {
		const point = [t, []] as vectorWithTime;
		const i = clamp(
			sortedLastIndexBy(this.points, point, (p) => p[0]) - 2,
			0,
			this.catnumRollCurves.length - 1,
		);
		return this.catnumRollCurves[i].at(t);
	}

	static fromPoints(points: Array<vectorWithTime>) {
		if (points.length < 4) return null;

		return new CatmullRomSpline(points);
	}

	static fromPointsClamped(points: Array<vectorWithTime>) {
		if (points.length < 2) return null;

		const [P1, P2] = points;
		const P3 = points.at(-2)!;
		const P4 = points.at(-1)!;
		const P0 = [scalarLerp(P1[0], P2[0], -1), vectorLerp(P1[1], P2[1], -1)] as vectorWithTime;
		const P5 = [scalarLerp(P3[0], P4[0], 2), vectorLerp(P3[1], P4[1], 2)] as vectorWithTime;

		return CatmullRomSpline.fromPoints([P0, ...points, P5]);
	}
}

function deCasteljau(points: vector[], position: number) {
	if (points.length < 2) return points[0];
	return deCasteljau(
		slidingWindows(points, 2).map(([Pi, Pj]) => vectorLerp(Pi, Pj, position)),
		position,
	);
}
