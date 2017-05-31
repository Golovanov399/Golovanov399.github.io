var width = document.getElementById("myCanvas").width;
var height = document.getElementById("myCanvas").height;

var cells = new Cartesian();
// var whenToDraw = 0;
var fieldDrawEvent;

function equalsList(a, b) {
	if (a.length != b.length) {
		return false;
	}
	for (var i = 0; i < a.length; i += 1) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
}

function hasList(cont, x) {
	for (var i = 0; i < cont.length; i += 1) {
		if (equalsList(cont[i], x)) {
			return true;
		}
	}
	return false;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
};

async function refreshField() {
	var c = null;
	while (c == null) {
		c = document.getElementById("textbox");
		await sleep(10);
	}
	var lines = c.value.split("\n");

	cells = new Cartesian();

	for (var i in lines) {
		var line = lines[i];
		var pts = line.trimRight().split(" ").map(Number).filter(function(x) { return !isNaN(x); });
		for (var j = 0; j + 1 < pts.length; j += 2) {
			cells.add([pts[j], -pts[j + 1]]);
		}
	}

	fieldDrawEvent = setTimeout(drawField, 10);
}

function drawField() {
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	var min_x, max_x, min_y, max_y;

	if (cells.length == 0) {
		min_x = 0;
		min_y = 0;
		max_x = 0;
		max_y = 0;
	} else {
		var cell = cells.nodes[cells.root].key;
		min_x = cell[0];
		max_x = cell[0];
		min_y = cell[1];
		max_y = cell[1];
	}

	cells.forEach(function(cell){
		min_x = Math.min(min_x, cell[0]);
		max_x = Math.max(max_x, cell[0]);
		min_y = Math.min(min_y, cell[1]);
		max_y = Math.max(max_y, cell[1]);
	});

	var offset = 2;

	var len_x = max_x - min_x + 2 * offset + 1;
	var len_y = max_y - min_y + 2 * offset + 1;

	var size = Math.floor(Math.min(width / len_x, height / len_y));
	if (size == 0) {
		size = 1;
	}
	var cnt_x = Math.floor(width / size);
	var cnt_y = Math.floor(height / size);

	if (cnt_x + cnt_y > 200) {
		ctx.clearRect(0, 0, width, height);
		ctx.font = "24px sans-serif";
		ctx.fillText("The bounding rectangle is", Math.floor(width / 3), Math.floor(height / 3), Math.floor(width / 3));
		ctx.fillText("so fukcing big", Math.floor(width / 3), Math.floor(height / 3) + 24, Math.floor(width / 3));
		return;
	}

	if (cells.size() > 1000) {
		ctx.clearRect(0, 0, width, height);
		ctx.font = "24px sans-serif";
		ctx.fillText("The number of black cells", Math.floor(width / 3), Math.floor(height / 3), Math.floor(width / 3));
		ctx.fillText("is so fukcing big", Math.floor(width / 3), Math.floor(height / 3) + 24, Math.floor(width / 3));
		return;
	}

	ctx.save();
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();

	ctx.fillStyle = "#000000";
	for (var i = 0; i * size < width; ++i) {
		ctx.moveTo(i * size, 0);
		ctx.lineTo(i * size, height);
		ctx.stroke();
	}
	for (var j = 0; j * size < height; ++j) {
		ctx.moveTo(0, j * size);
		ctx.lineTo(width, j * size);
		ctx.stroke();
	}

	ctx.globalAlpha = 0.6;
	cells.forEach(function(cell) {
		var i = cell[0] - min_x + offset;
		var j = cell[1] - min_y + offset;
		ctx.fillRect(i * size, j * size, size, size);
	});
	ctx.globalAlpha = 1.0;

	ctx.restore();
}

refreshField();

// setInterval(drawField, 100);

// var ctr = 0;

// function mouseMove(e)
// {
// 	var mouseX, mouseY;

// 	if (e.offsetX) {
// 		mouseX = e.offsetX;
// 		mouseY = e.offsetY;
// 	}
// 	else if (e.layerX) {
// 		mouseX = e.layerX;
// 		mouseY = e.layerY;
// 	}
// 	alert("lol");

// 	ctr = ctr + 1;
// 	lol.value = "lol " + ctr;
// }

// document.addEventListener("mousemove", function(){
// 	ctr = ctr + 1;
// 	lol.value = "lol " + ctr;
// });
