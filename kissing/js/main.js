var width = document.getElementById("myCanvas").width;
var height = document.getElementById("myCanvas").height;


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

// function getClosestPoint(from, minDist) {
// 	var closestPoint;
// 	this.eachItem(point => {
// 		const dist = Math.hypot(from.x - point.x, from.y - point.y);
// 		if (dist < minDist) {
// 			closestPoint = point;
// 			minDist = dist;
// 		}
// 	});
// 	return closestPoint;
// }

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const setStyle = (style) => eachOf(Object.keys(style), key => { ctx[key] = style[key] });
const eachOf = (array, callback) => {var i = 0; while (i < array.length && callback(array[i], i++) !== true); };

// function drawPoint(point) {
// 	ctx.moveTo(point.x, point.y);
// 	ctx.rect(point.x - 2, point.y - 2, 4, 4);
// }

// function drawLine(line) {
// 	var ipts = [];
// 	sides.forEach((side) => {
// 		if (!parallel(side, line)) {
// 			p = intersect(side, line);
// 			if (clamp(p.x, 0, width) === p.x && clamp(p.y, 0, height) === p.y) {
// 				ipts.push(p);
// 			}
// 		}
// 	});
// 	if (ipts.length == 2) {
// 		ctx.moveTo(Math.round(ipts[0].x), Math.round(ipts[0].y));
// 		ctx.lineTo(Math.round(ipts[1].x), Math.round(ipts[1].y));
// 	}
// }

// function drawLines() { this.eachItem(line => drawLine(line)) }
// function drawPoints() { this.eachItem(point => drawPoint(point)) }

// const pts = createList({getClosest: getClosestPoint, draw: drawPoints});
var pts = [];

const mouse = {x: 0, y: 0, button: false, handled: false};
const kbd = {action: ""};
function mouseEvents(e) {
	mouse.x = e.pageX - canvas.offsetLeft;
	mouse.y = e.pageY - canvas.offsetTop;
	mouse.button = e.type === "mousedown" && e.button === 0;
	if (e.type === "mouseup") {
		mouse.handled = false;
	}
}

document.addEventListener("keyup", function(event) {
	if (event.key === 'z') {
		kbd.action = "undo";
	}
});

["down", "up", "move"].forEach(name => document.addEventListener("mouse" + name, mouseEvents));

const diam = 100;

function isValid(p) {
	var res = true;
	pts.forEach(q => {
		if (dist(p, q) < diam - eps) {
			res = false;
		}
	});
	return res;
}

var w = canvas.width;
var h = canvas.height;
var cursor;

const minDist = 20;

const circleStyle = {
	lineWidth: 2,
	strokeStyle: "black",
};
const mainCircleStyle = {
	lineWidth: 2,
	fillStyle: "#aaaaaa",
};
const imaginaryCircleStyle = {
	lineWidth: 2,
	strokeStyle: "gray",
};
const pointStyle = {
	lineWidth: 1,
	strokeStyle: "black",
};
const borderStyle = {
	lineWidth: 4,
	strokeStyle: "gray",
};
const textStyle = {
	font: diam * 0.7 + "px serif",
	textAlign: "center",
	textBaseline: "middle",
	lineWidth: 2,
	strokeStyle: "black",
};

function update(timer) {
	cursor = "crosshair";
	globalTime = timer;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = 1;
	if (w == 0 || h == 0) {
		w = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		h = canvas.height = (window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight);
		pts.push(new Point(w / 2, h / 2));
		pts[0].layer = 0;
	} else {
		ctx.clearRect(0, 0, w, h);
	}

	var circles = [];
	pts.forEach(p => {
		circles.push(Circle(p, diam));
	});

	var arcs = [];
	circles.forEach(c1 => {
		var cands = [];
		circles.forEach(c2 => {
			if (c1.p.x !== c2.p.x || c1.p.y !== c2.p.y) {
				cands.push(...intersect(c1, c2));
			}
		});
		cands.sort((s, t) => {
			return Math.sign(ang(s.sub(c1.p)) - ang(t.sub(c1.p)));
		});
		if (cands.length === 0) {
			arcs.push(Arc(c1, 0, 2 * Math.PI));
		} else {
			for (var i = 0; i < cands.length; ++i) {
				const from = ang(cands[i].sub(c1.p));
				const to = i + 1 === cands.length ? ang(cands[0].sub(c1.p)) + 2 * Math.PI : ang(cands[i + 1].sub(c1.p));
				if (from + eps < to && !isValid(c1.p.add(dir((from + to) / 2).scale(c1.r)))) {
					continue;
				}
				arcs.push(Arc(c1, from, to));
			}
		}
	});

	var currentCand = undefined;
	const mouseP = new Point(mouse.x, mouse.y);
	arcs.forEach(arc => {
		const q = closest(arc, mouseP);
		if (isValid(q) && (currentCand === undefined || dist(currentCand, mouseP) > dist(q, mouseP))) {
			currentCand = q;
		}
	});

	setStyle(mainCircleStyle);
	ctx.beginPath();
	ctx.arc(pts[0].x, pts[0].y, diam / 2, 0, 2 * Math.PI);
	ctx.fill();
	setStyle(circleStyle);
	pts.forEach(p => {
		ctx.beginPath();
		ctx.arc(p.x, p.y, diam / 2, 0, 2 * Math.PI);
		ctx.stroke();
	});
	setStyle(textStyle);
	pts.forEach(p => {
		ctx.beginPath();
		ctx.strokeText(p.layer, p.x, p.y + diam * 0.05);
		ctx.stroke();
	});
	setStyle(borderStyle);
	arcs.forEach(arc => {
		ctx.beginPath();
		ctx.arc(arc.c.p.x, arc.c.p.y, arc.c.r, arc.f, arc.t, false);
		ctx.stroke();
	});
	setStyle(pointStyle);
	ctx.beginPath();
	ctx.arc(currentCand.x, currentCand.y, 3, 0, 2 * Math.PI);
	ctx.stroke();
	setStyle(imaginaryCircleStyle);
	ctx.beginPath();
	ctx.setLineDash([5, 5]);
	ctx.arc(currentCand.x, currentCand.y, diam / 2, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.setLineDash([]);

	if (mouse.button && !mouse.handled) {
		var layer = undefined;
		pts.forEach(p => {
			if (dist(p, currentCand) < diam + eps) {
				if (layer === undefined || layer > p.layer + 1) {
					layer = p.layer + 1;
				}
			}
		});
		pts.push(currentCand);
		pts[pts.length - 1].layer = layer;
		mouse.handled = true;
	} else if (kbd.action === "undo" && pts.length > 1) {
		pts.pop();
	}
	kbd.action = "";

	document.getElementById("score").innerHTML = "Current number of disks: " + pts.length;

	requestAnimationFrame(update);
}

requestAnimationFrame(update);
