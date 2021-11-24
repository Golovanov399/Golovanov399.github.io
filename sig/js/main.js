var width = document.getElementById("myCanvas").width;
var height = document.getElementById("myCanvas").height;
const sides = [Line(new Point(0, 0), new Point(1, 0)), Line(new Point(width, 0), new Point(0, 1)),
			   Line(new Point(width, height), new Point(-1, 0)), Line(new Point(0, height), new Point(0, -1))];


Number.prototype.clamp = function(min, max) {
	return Math.min(max, Math.max(min, this));
}

const list = {
	items: null,
	add(item) { this.items.push(item); return item },
	eachItem(callback) {
		var i = 0;
		while (i < this.items.length) {
			callback(this.items[i], i++);
		}
	}
}

function createList(extend) {
	return Object.assign({}, list, {items: []}, extend);
}

function getClosestPoint(from, minDist) {
	var closestPoint;
	this.eachItem(point => {
		const dist = Math.hypot(from.x - point.x, from.y - point.y);
		if (dist < minDist) {
			closestPoint = point;
			minDist = dist;
		}
	});
	return closestPoint;
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const setStyle = (style) => eachOf(Object.keys(style), key => { ctx[key] = style[key] });
const eachOf = (array, callback) => {var i = 0; while (i < array.length && callback(array[i], i++) !== true); };

function drawPoint(point) {
	ctx.moveTo(point.x, point.y);
	ctx.rect(point.x - 2, point.y - 2, 4, 4);
}

function drawLine(line) {
	var ipts = [];
	sides.forEach((side) => {
		if (!parallel(side, line)) {
			p = intersect(side, line);
			if (clamp(p.x, 0, width) === p.x && clamp(p.y, 0, height) === p.y) {
				ipts.push(p);
			}
		}
	});
	if (ipts.length == 2) {
		ctx.moveTo(Math.round(ipts[0].x), Math.round(ipts[0].y));
		ctx.lineTo(Math.round(ipts[1].x), Math.round(ipts[1].y));
	}
}

function drawLines() { this.eachItem(line => drawLine(line)) }
function drawPoints() { this.eachItem(point => drawPoint(point)) }

const pts = createList({getClosest: getClosestPoint, draw: drawPoints});
// var pts = [];

const mouse = {x: 0, y: 0, button: false, which: 0, drag: false, dragStart: false, dragEnd: false, dragStartX: 0, dragStartY: 0}
function mouseEvents(e) {
	mouse.x = e.pageX - canvas.offsetLeft;
	mouse.y = e.pageY - canvas.offsetTop;
	const lb = mouse.button;
	mouse.button = e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouse.button;
	if (lb !== mouse.button) {
		if (mouse.button) {
			mouse.which = [1, 0, 2][e.button];
			mouse.drag = true;
			mouse.dragStart = true;
			mouse.dragStartX = mouse.x;
			mouse.dragStartY = mouse.y;
		} else {
			mouse.drag = false;
			mouse.dragEnd = true;
		}
	}
}

["down", "up", "move"].forEach(name => document.addEventListener("mouse" + name, mouseEvents));

const inf = 1e9;
var minX = inf;
var maxX = -inf;
var minY = inf;
var maxY = -inf;

function calcScore() {
	//
}

var w = canvas.width;
var h = canvas.height;
var closestPoint;
var dragOffsetX;
var dragOffsetY;
var cursor;

const minDist = 20;

const lineStyle = {
	lineWidth: 2,
	strokeStyle: "black",
}
const circleStyle = {
	lineWidth: 1,
	strokeStyle: "red",
}
const pointStyle = {
	lineWidth: 1,
	strokeStyle: "blue",
}
const highlightStyle = {
	lineWidth: 3,
	strokeStyle: "red",
}

function update(timer) {
	cursor = "crosshair";
	globalTime = timer;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = 1;
	ctx.clearRect(0, 0, w, h);

	// ctx.fillStyle = "#aaa";
	ctx.fillStyle = "#fff";
	ctx.rect(0, 0, w, h);
	ctx.fill();

	if (mouse.drag === false) {
		closestPoint = pts.getClosest(mouse, minDist);
	}
	if (mouse.dragStart) {
		if (closestPoint) {
			dragOffsetX = closestPoint.x - mouse.x;
			dragOffsetY = closestPoint.y - mouse.y;
			cursor = "move";
		} else {
			mouse.drag = false;
		}
		mouse.dragStart = false;
	} else if (mouse.drag) {
		closestPoint.x = mouse.x + dragOffsetX;
		closestPoint.y = mouse.y + dragOffsetY;
		cursor = "move";
	} else if (mouse.dragEnd) {
		if (mouse.dragStartX === mouse.x && mouse.dragStartY === mouse.y) {
			if (closestPoint && mouse.which == 0) {
				pts.items.splice(pts.items.indexOf(closestPoint), 1);
			} else if (!closestPoint && mouse.which == 1) {
				pts.add(new Point(mouse.x, mouse.y));
			}
		}
		mouse.dragEnd = false;
		mouse.which = 0;
	}

	var circles = [];
	pts.eachItem(p => {
		var md = 1e9;
		pts.eachItem(q => {
			if (p.x === q.x && p.y === q.y) {
				return;
			}
			md = Math.min(md, dist(p, q));
		});
		circles.push(Circle(p, md));
	});
	var regions = [];
	circles.forEach(c1 => {
		var lines = [];
		circles.forEach(c2 => {
			if (c1.p.x === c2.p.x && c1.p.y === c2.p.y) {
				return;
			}
			lines.push(radicalAxis(c1, c2));
		});
		if (lines.length == 0) {
			regions.push([]);
			return;
		}
		for (i = 0; i < 4; ++i) {
			lines.push(sides[i]);
		}
		regions.push(halfplanesIntersection(lines));
	});

	setStyle(circleStyle);
	circles.forEach(c => {
		if (c.r < 1e8) {
			ctx.beginPath();
			ctx.arc(c.p.x, c.p.y, c.r, 0, 2 * Math.PI);
			ctx.stroke();
		}
	});

	setStyle(lineStyle);
	ctx.beginPath();
	var totalVertices = pts.items.length;
	var totalEdges = 0;
	var totalScore = 0;
	for (i = 0; i < circles.length; ++i) {
		for (j = 0; j < i; ++j) {
			const p = pts.items[i];
			const q = pts.items[j];
			const d = Math.round(dist(p, q) * dist(p, q));
			const r1 = Math.round(circles[i].r * circles[i].r);
			const r2 = Math.round(circles[j].r * circles[j].r);
			if (d <= r1 + r2 || (d - r1 - r2) * (d - r1 - r2) <= 4 * r1 * r2) {
				totalScore += 1;
			}
		}
	}
	regions.forEach(lines => {
		if (lines.length == 0) {
			return;
		}
		const first = lines[0];
		const last = lines[lines.length - 1];
		const unbounded = cross(first, last) >= 0;
		const n = lines.length;
		for (i = 0; i < n; ++i) {
			const line = lines[i];
			var is_side = false;
			for (j = 0; j < 4; ++j) {
				const side = sides[j];
				// if (parallel(line, side) && cross(side.v, vec(side.p, line.p)) === 0 && false) {
				if (line === side) {
					is_side = true;
				}
			}
			if (is_side) {
				continue;
			}
			++totalEdges;
			const from = intersect(line, lines[(i + n - 1) % n]);
			const to = intersect(line, lines[(i + 1) % n]);
			ctx.moveTo(Math.round(from.x), Math.round(from.y));
			ctx.lineTo(Math.round(to.x), Math.round(to.y));
		}
	});
	ctx.stroke();

	document.getElementById("stats").innerHTML = 'Vertices: ' + totalVertices + '<br>Edges: ' + Math.round(totalEdges / 2) + '<br>Score: '  + totalScore;

	pts.eachItem(p => {
		if (p === closestPoint) {
			setStyle(highlightStyle);
		} else {
			setStyle(pointStyle);
		}
		ctx.beginPath();
		drawPoint(p);
		ctx.stroke();
	});

	requestAnimationFrame(update);
}

requestAnimationFrame(update);
