function makePoint(x, y) {
	return {
		"type": "point",
		"p": [x, y]
	};
}

function makeSegment(p, q) {
	if (dist2(p, q) < eps) {
		return makePoint(p);
	} else {
		return {
			"type": "segment",
			"p": p,
			"q": q
		};
	}
}

function makeSegmentFromCoords(px, py, qx, qy) {
	return makeSegment([px, py], [qx, qy]);
}

function segmentLength(s) {
	if (s.type === "point") {
		return 0;
	} else {
		return Math.hypot(s.p[0] - s.q[0], s.p[1] - s.q[1]);
	}
}

// -----------------------------------

const eps = 1e-8;

function dotProd(p, q) {
	return p[0] * q[0] + p[1] * q[1];
}

function crossProd(p, q) {
	return p[0] * q[1] - p[1] * q[0];
}

function pointSub(p, q) {
	return [p[0] - q[0], p[1] - q[1]];
}

function dist2(p, q) {
	const r = pointSub(p, q);
	return dotProd(r, r);
}

function pointOnSeg(p, q, t) {
	return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
}

function reflect(p, about) {
	return pointOnSeg(p, about, 2);
}

function distAtMost(p, q, d) {
	const r = pointSub(p, q);
	return dotProd(r, r) <= d * d;
}

function segmentMinusCircle(s, center, radius) {
	if (s.type === "point") {
		if (distAtMost(s.p, center, radius)) {
			return [];
		} else {
			return [s];
		}
	}
	const sub = (a, b) => {
		// (a + (b - a) * t - center)^2 = radius^2
		const v0 = dotProd(pointSub(a, center), pointSub(a, center)) - radius * radius;
		const v1 = dotProd(pointSub(b, center), pointSub(b, center)) - radius * radius;
		const vneg1 = dotProd(pointSub(reflect(b, a), center), pointSub(reflect(b, a), center)) - radius * radius;
		// A - B + C, C, A + B + C
		const B = (v1 - vneg1) / 2.0;
		const C = v0;
		const A = v1 - B - C;
		const D = B * B - 4 * A * C;
		const t = (-B + Math.sqrt(D)) / (2.0 * A);
		if (t > 1 - eps) {
			return [makePoint(b)];
		} else {
			return [makeSegment(pointOnSeg(a, b, t), b)];
		}
	};
	const p = s.p;
	const q = s.q;
	if (distAtMost(p, center, radius)) {
		if (distAtMost(q, center, radius)) {
			return [];
		} else {
			return sub(p, q);
		}
	} else if (distAtMost(q, center, radius)) {
		return sub(q, p);
	} else {
		const d = pointSub(q, p);
		// (p + td - c)^2 -> min
		// (d, p + td - c) = 0
		// (d, c - p) = t * (d, d)
		const t = dotProd(d, pointSub(center, p)) / dotProd(d, d);
		const mid = pointOnSeg(p, q, t);
		if (t < 0 || t > 1 || segmentLength(makeSegment(center, mid)) > radius - eps) {
			return [s];
		} else {
			return sub(mid, p).concat(sub(mid, q));
		}
	}
}
