function Point(x, y) {
	this.x = x;
	this.y = y;

	this.sub = function(p) {
		return new Point(this.x - p.x, this.y - p.y);
	};

	this.add = function(p) {
		return new Point(this.x + p.x, this.y + p.y);
	};

	this.scale = function(k) {
		return new Point(this.x * k, this.y * k);
	};
}

const cross = (p, q) => p.x * q.y - p.y * q.x;
const dot = (p, q) => p.x * q.x + p.y * q.y;
const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
const rot90 = (p) => new Point(-p.y, p.x);
const vec = (p, q) => q.sub(p);
const half = (p) => p.y !== 0 ? +(p.y < 0) : +(p.x < 0);
const dir = (theta) => new Point(Math.cos(theta), Math.sin(theta));
const ang = (p) => Math.atan2(p.y, p.x);

const Circle = (p, r) => ({p, r});
const Line = (p, v) => ({p, v});

const parallel = (l1, l2) => cross(l1.v, l2.v) === 0;

const eps = 1e-9;

function intersect(c1, c2) {
	const d = dist(c1.p, c2.p);
	// r1^2 - x^2 = r2^2 - d^2 + 2dx - x^2
	// r1^2 = r2^2 - d^2 + 2dx
	// r1^2 - r2^2 + d^2 = 2dx
	const x = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d);
	if (Math.abs(x) > c1.r + eps) {
		return [];
	} else if (Math.abs(x) > c1.r - eps) {
		return [c1.p.add(c2.p.sub(c1.p).scale(x / d))];
	} else {
		const u = rot90(c2.p.sub(c1.p).scale(Math.sqrt(c1.r * c1.r - x * x) / d));
		return [c1.p.add(c2.p.sub(c1.p).scale(x / d)).add(u), c1.p.add(c2.p.sub(c1.p).scale(x / d)).sub(u)];
	}
}

const Arc = (c, f, t) => ({c, f, t});

function closest(arc, p) {
	var cands = [arc.c.p.add(dir(arc.f).scale(arc.c.r)), arc.c.p.add(dir(arc.t).scale(arc.c.r))];
	const d = dist(p, arc.c.p);
	if (d > eps) {
		const q = p.sub(arc.c.p);
		var phi = ang(q);
		while (phi < arc.f - eps) {
			phi += 2 * Math.PI;
		}
		while (phi > arc.t + eps) {
			phi -= 2 * Math.PI;
		}
		if (phi > arc.f - eps && phi < arc.t + eps) {
			cands.push(arc.c.p.add(q.scale(arc.c.r / d)));
		}
	}
	// console.log(arc);
	// console.log([dir(arc.f), arc.c.r, dir(arc.f) * arc.c.r]);
	// console.log(arc.c.p + dir(arc.f) * arc.c.r);
	return cands.reduce((s, t) => dist(s, p) < dist(t, p) ? s : t);
}