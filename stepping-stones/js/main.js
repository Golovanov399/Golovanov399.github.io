var width = document.getElementById("myCanvas").width;
var height = document.getElementById("myCanvas").height;

const Entry = (x, y) => ({x, y});
const LabeledEntry = (e, l) => ({e, l});

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

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const setStyle = (style) => eachOf(Object.keys(style), key => { ctx[key] = style[key] });
const eachOf = (array, callback) => {var i = 0; while (i < array.length && callback(array[i], i++) !== true); };

const mouse = {x: 0, y: 0, button: false, which: 0, drag: false, dragStart: false, dragEnd: false, dragStartX: 0, dragStartY: 0};
const kbd = {action: ""};
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

document.addEventListener("keyup", function(event) {
	if (event.key === 'z') {
		kbd.action = "undo";
	} else if (event.key === 'e') {
		kbd.action = "zoomin";
	} else if (event.key === 'q') {
		kbd.action = "zoomout";
	}
});

["down", "up", "move"].forEach(name => document.addEventListener("mouse" + name, mouseEvents));

var sz = 40;
var offX = 0.5, offY = 0.5;

function closestGrid(x) {
	const low = x - x % sz;
	if (x - low < low + sz - x) {
		return low;
	} else {
		return low + sz;
	}
}

function firstAfter(x) {
	return Math.ceil(x / sz) * sz;
}

var w = canvas.width;
var h = canvas.height;
var dragOffX;
var dragOffY;
var cursor;
var chosenX, chosenY;

var ones = [];
var nonOnes = [];
var hist = [];

const shortLineStyle = {
	lineWidth: 2,
	strokeStyle: "cyan",
}
const lineStyle = {
	lineWidth: 2,
	strokeStyle: "black",
}
const longLineStyle = {
	lineWidth: 2,
	strokeStyle: "red",
}
const pointStyle = {
	lineWidth: 1,
	strokeStyle: "blue",
}
const fixedPointStyle = {
	lineWidth: 3,
	strokeStyle: "blue",
}
const outsidePointStyle = {
	lineWidth: 2,
	strokeStyle: "magenta",
}
const outsideFixedPointStyle = {
	lineWidth: 4,
	strokeStyle: "cyan",
}
const highlightStyle = {
	lineWidth: 3,
	strokeStyle: "red",
}
const gridStyle = {
	lineWidth: 1,
	strokeStyle: "#bbb",
}

Number.prototype.clamp = function(min, max) {
	return Math.min(max, Math.max(min, this));
}

function CellMap() {
	this.placed = [];
	this.evaluated = [];
	this.place = function(cell, val) {
		this.placed.push(LabeledEntry(cell, val));
	};
	this.getPlaced = function(x, y) {
		for (var i = 0; i < this.placed.length; i += 1) {
			if (this.placed[i].e.x === x && this.placed[i].e.y === y) {
				return this.placed[i].l;
			}
		}
		return undefined;
	};
	this.getEvaluated = function(x, y) {
		for (var i = 0; i < this.evaluated.length; i += 1) {
			if (this.evaluated[i].e.x === x && this.evaluated[i].e.y === y) {
				return this.evaluated[i].l;
			}
		}
		return undefined;
	};
	this.getSum = function(x, y) {
		var res = 0;
		for (var dx = -1; dx <= 1; dx += 1) {
			for (var dy = -1; dy <= 1; dy += 1) {
				let nx = x + dx;
				let ny = y + dy;
				if (this.getPlaced(nx, ny) !== undefined && (dx != 0 || dy != 0)) {
					res += this.getPlaced(nx, ny);
				}
			}
		}
		return res;
	};
	this.hasLargeNeighbors = function(x, y) {
		var res = false;
		this.placed.forEach(el => {
			if (Math.abs(el.e.x - x) <= 1 && Math.abs(el.e.y - y) <= 1 && el.l > 1) {
				res = true;
			}
		});
		return res;
	};
	this.evaluate = function() {
		this.placed.forEach(el => {
			let x = el.e.x;
			let y = el.e.y;
			for (var dx = -1; dx <= 1; dx += 1) {
				for (var dy = -1; dy <= 1; dy += 1) {
					let nx = x + dx;
					let ny = y + dy;
					if (this.getPlaced(nx, ny) !== undefined || this.getEvaluated(nx, ny) !== undefined) {
						continue;
					}
					this.evaluated.push(LabeledEntry(Entry(nx, ny), this.getSum(nx, ny)));
				}
			}
		});
	};
	this.reevaluate = function() {
		this.evaluated = [];
		this.evaluate();
	};
}

function update(timer) {
	cursor = "crosshair";
	globalTime = timer;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.globalAlpha = 1;
	if (w == 0 || h == 0) {
		w = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		h = canvas.height = (window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight) - 50;
	} else {
		ctx.clearRect(0, 0, w, h);
	}

	if (kbd.action === "undo") {
		if (hist.length > 0) {
			if (hist.pop() == 1) {
				ones.pop();
			} else {
				nonOnes.pop();
			}
		}
	} else if (kbd.action === "zoomin") {
		const nsz = sz < 100 ? sz + 5 : sz;
		offX += mouse.x / sz - mouse.x / nsz;
		offY += mouse.y / sz - mouse.y / nsz;
		sz = nsz;
	} else if (kbd.action === "zoomout") {
		const nsz = sz > 10 ? sz - 5 : sz;
		offX += mouse.x / sz - mouse.x / nsz;
		offY += mouse.y / sz - mouse.y / nsz;
		sz = nsz;
	}
	kbd.action = "";

	const cm = new CellMap();
	for (var i = 0; i < ones.length; i += 1) {
		cm.place(ones[i], 1);
	}
	for (var i = 0; i < nonOnes.length; i += 1) {
		cm.place(nonOnes[i], i + 2);
	}
	cm.evaluate();

	if (mouse.drag === false) {
		chosenX = Math.floor(mouse.x / sz + offX);
		chosenY = Math.floor(mouse.y / sz + offY);
	}
	if (mouse.dragStart) {
		dragOffX = mouse.x / sz + offX;
		dragOffY = mouse.y / sz + offY;
		mouse.dragStart = false;
	} else if (mouse.drag) {
		offX = dragOffX - mouse.x / sz;
		offY = dragOffY - mouse.y / sz;
		cursor = "move";
	} else if (mouse.dragEnd) {
		if (mouse.dragStartX === mouse.x && mouse.dragStartY === mouse.y) {
			if (mouse.which === 1) {
				const num = nonOnes.length + 2;
				if (cm.getEvaluated(chosenX, chosenY) === num) {
					nonOnes.push(Entry(chosenX, chosenY));
					cm.place(Entry(chosenX, chosenY), num);
					hist.push(num);
					cm.reevaluate();
				}
			} else if (mouse.which === 0) {
				const num = 1;
				if (cm.getPlaced(chosenX, chosenY) === undefined && !cm.hasLargeNeighbors(chosenX, chosenY)) {
					ones.push(Entry(chosenX, chosenY));
					cm.place(Entry(chosenX, chosenY), num);
					hist.push(1);
					cm.reevaluate();
				}
			}
		}
		mouse.dragEnd = false;
	}

	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, w, h);

	ctx.fillStyle = "#ffa";
	ctx.fillRect((chosenX - offX) * sz, (chosenY - offY) * sz, sz, sz);

	setStyle(gridStyle);
	for (var x = firstAfter(offX * sz); x < offX * sz + w; x += sz) {
		ctx.beginPath();
		ctx.moveTo(x - offX * sz, 0);
		ctx.lineTo(x - offX * sz, h);
		ctx.stroke();
	}
	for (var y = firstAfter(offY * sz); y < offY * sz + h; y += sz) {
		ctx.beginPath();
		ctx.moveTo(0, y - offY * sz);
		ctx.lineTo(w, y - offY * sz);
		ctx.stroke();
	}

	setStyle(lineStyle);
	ctx.font = Math.floor(sz * 0.7) + "px serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	cm.placed.forEach(el => {
		ctx.strokeStyle = el.l === 1 ? "brown" : "black";
		ctx.strokeText(el.l, (el.e.x - offX + 0.5) * sz, (el.e.y - offY + 0.5) * sz);
	});
	cm.evaluated.forEach(el => {
		ctx.strokeStyle = el.l === nonOnes.length + 2 ? "blue" : "#aaa";
		ctx.strokeText(el.l, (el.e.x - offX + 0.5) * sz, (el.e.y - offY + 0.5) * sz);
	});

	if (cm.placed.length > 0) {
		var minX = cm.placed[0].e.x;
		var minY = cm.placed[0].e.y;
		var maxY = cm.placed[0].e.y;
		cm.placed.forEach(el => {
			minX = Math.min(minX, el.e.x);
			minY = Math.min(minY, el.e.y);
			maxY = Math.max(maxY, el.e.y);
		});
		const cntRows = maxY - minY + 1;
		rows = [];
		for (var i = minY; i <= maxY; i += 1) {
			rows.push([]);
		}
		cm.placed.forEach(el => {
			rows[el.e.y - minY].push({x: el.e.x - minX, v: el.l});
		});
		for (var i = 0; i < cntRows; i += 1) {
			rows[i].sort((fst, snd) => fst.x - snd.x);
		}
		document.getElementById("result").value = rows.map(row => {
			var last = -1;
			blocks = [];
			row.forEach(xv => {
				if (last === -1 || xv.x > last + 1) {
					blocks.push({off: xv.x - last - 1, vals: []});
					last = xv.x - 1;
				}
				blocks[blocks.length - 1].vals.push(xv.v);
				last += 1;
			});
			return "(" + blocks.map(block => block.off + ": " + block.vals.join(", ")).join(" / ") + ")";
		}).join(", ");
	}

	requestAnimationFrame(update);
}

requestAnimationFrame(update);

function copyToBuffer() {
	var text = document.getElementById("result");
	text.select();
	text.setSelectionRange(0, 99999);
	document.execCommand("copy");
	text.selectionStart = text.selectionEnd = 0;
}

// function loadFromField() {
// 	var old = document.getElementById("oldResult");
// 	const verts = JSON.parse(old.value)
// 	pts.items = [];
// 	verts["vertices"].forEach(pt => { pts.add(Point((pt[0] - minX) * sz, (pt[1] - minY) * sz, false)) });
// }