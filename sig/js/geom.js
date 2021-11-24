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

const Circle = (p, r) => ({p, r});
const Line = (p, v) => ({p, v});

const parallel = (l1, l2) => cross(l1.v, l2.v) === 0;

function intersect(l1, l2) {
	// [l1.p - l2.p + t * l1.v, l2.v] = 0
	const t = cross(l2.p.sub(l1.p), l2.v) / cross(l1.v, l2.v);
	return l1.p.add(l1.v.scale(t));
}

function radicalAxis(c1, c2) {
	const d = dist(c1.p, c2.p);
	// x^2 - r1^2 = d^2 - 2dx + x^2 - r2^2
	// -r1^2 = d^2 - 2dx - r2^2
	// 2dx = d^2 + r1^2 - r2^2
	const x = (d * d + c1.r * c1.r - c2.r * c2.r) / (2 * d);
	return Line(c1.p.add(vec(c1.p, c2.p).scale(x / d)), rot90(vec(c1.p, c2.p)));
}

function halfplanesIntersection(hps) {
	hps.sort((l1, l2) => {
		if (half(l1.v) != half(l2.v)) {
			return half(l1.v) - half(l2.v);
		} else {
			return cross(l2.v, l1.v);
		}
	});
	var infinite_index = null;
	for (i = 0; i < hps.length; ++i) {
		var j = (i == hps.length - 1) ? 0 : i + 1;
		if (cross(hps[i].v, hps[j].v) <= 0 && dot(hps[i].v, hps[j].v) < 0) {
			infinite_index = j;
		}
	}

	function contains(line, pt) {
		return cross(line.v, vec(line.p, pt)) > 0;
	}

	if (infinite_index === null) {
		var n = 1;
		hps.forEach(line => {
			if (cross(hps[n - 1].v, line.v) == 0) {
				if (cross(hps[n - 1].v, vec(hps[n - 1].p, line.p)) > 0) {
					hps[n++] = line;
				}
			} else {
				hps[n++] = line;
			}
		});

		var st = [];
		var len = 0;
		for (j = 0; j < 2 * n; ++j) {
			const i = j >= n ? j - n : j;
			const line = hps[i];
			while (len >= 2 && !contains(line, intersect(hps[st[len - 1]], hps[st[len - 2]]))) {
				st.pop();
				len -= 1;
			}
			if (len > 0 && cross(hps[st[len - 1]].v, line.v) == 0) {
				return [];	// should not happen in our (sig) scenario
			}
			st.push(i);
			len += 1;
		}

		var used = Array(n).fill(-1);
		for (i = 0; i < len; ++i) {
			if (used[st[i]] >= 0) {
				res = [];
				for (j = used[st[i]]; j < i; ++j) {
					res.push(hps[st[j]]);
				}
			}
			used[st[i]] = i;
		}
		return res;
	} else {
		const n = hps.length;
		var region = [];
		var len = 0;
		var idx = infinite_index;
		for (i = 0; i < n; ++i) {
			const line = hps[idx];
			idx += 1;
			if (idx == n) {
				idx = 0;
			}
			if (len == 0) {
				region.push(line);
				len += 1;
				continue;
			}
			if (cross(line.v, region[len - 1]) >= 0) {
				if (cross(vec(line.p, region[len - 1].p), line.v) >= 0) {
					region[len - 1] = line;
				}
			} else {
				while (len >= 2 && !contains(line, intersect(region[len - 1], region[len - 2]))) {
					region.pop();
					len -= 1;
				}
				region.push(line);
				len += 1;
			}
		}
		return region;
	}
}