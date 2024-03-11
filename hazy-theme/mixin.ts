import type { RegisterTransformFN } from "/hooks/transforms/transform.js";

export default function (registerTransform: RegisterTransformFN) {
	registerTransform({
		transform: emit => str => {
			emit();
			return str;
		},
		glob: /^\/xpui\.js/,
	});
}
