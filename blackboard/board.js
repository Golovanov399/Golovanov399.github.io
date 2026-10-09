const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const bgColor = "#001100";

ctx.fillStyle = bgColor;
ctx.fillRect(0, 0, width, height);

const drawRadius = 3;
const eraseRadius = 10 * drawRadius;

var pts = []; // TODO(perf): make it a better structure than just array, so that erasing is faster
var lastPts = [];
const mouse = {x: 0, y: 0, button: false, which: 0};

function renderSegment(s) {
	ctx.beginPath();
	ctx.moveTo(s.p[0], s.p[1]);
	if (s.type === "point") {
		ctx.lineTo(s.p[0], s.p[1]);
	} else {
		ctx.lineTo(s.q[0], s.q[1]);
	}
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = drawRadius;
	ctx.stroke();
}

function addPoint(x, y) {
	lastPts.push(makePoint(x, y));
}

function addSegment(px, py, qx, qy) {
	lastPts.push(makeSegmentFromCoords(px, py, qx, qy));
}

function eraseAtPoint(x, y) {
	pts = pts.flatMap(s => segmentMinusCircle(s, [x, y], eraseRadius));
}

function mouseDown(e) {
	if (!mouse.button) {
		mouse.button = true;
		mouse.which = e.button + 1;
	}
	const x = e.pageX - canvas.offsetLeft;
	const y = e.pageY - canvas.offsetTop;
	if (mouse.which === 1) {
		addPoint(x, y);
	} else if (mouse.which > 1) {
		eraseAtPoint(x, y);
	}
	mouse.x = x;
	mouse.y = y;
}

function mouseUp(e) {
	mouse.button = false;
	mouse.which = 0;
	mouse.x = 0;
	mouse.y = 0;
	if (lastPts.length > 0) {
		pts = pts.concat(lastPts);
		lastPts = [];
	}
}

function mouseMove(e) {
	if (mouse.button) {
		const x = e.pageX - canvas.offsetLeft;
		const y = e.pageY - canvas.offsetTop;
		if (mouse.which === 1) {
			addSegment(mouse.x, mouse.y, x, y);
		} else if (mouse.which > 1) {
			eraseAtPoint(x, y);
		}
		mouse.x = x;
		mouse.y = y;
	}
}

document.addEventListener("mousedown", mouseDown);
document.addEventListener("mouseup", mouseUp);
document.addEventListener("mousemove", mouseMove);

function update(timer) {
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = 1;
	ctx.clearRect(0, 0, width, height);

	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, width, height);
	ctx.fill();

	if (mouse.button && mouse.which > 1) {
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, eraseRadius, 0, 2 * Math.PI);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#aaaaaa";
		ctx.stroke();
	}

	pts.forEach(renderSegment);
	lastPts.forEach(renderSegment);

	requestAnimationFrame(update);
}
requestAnimationFrame(update);
