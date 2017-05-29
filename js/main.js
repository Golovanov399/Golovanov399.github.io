var width = document.getElementById("myCanvas").width;
var height = document.getElementById("myCanvas").height;

var cells = [];
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
}

async function refreshField() {
	var c = null;
	while (c == null) {
		c = document.getElementById("textbox");
		await sleep(10);
	}
	var lines = c.value.split("\n");

	// for (var i = 0; i < h; ++i) {
	// 	for (var j = 0; j < w; ++j) {
	// 		map[i][j] = 0;
	// 	}
	// }
	cells = [];

	for (var i in lines) {
		var line = lines[i];
		var pts = line.trimRight().split(" ").map(Number).filter(function(x) { return !isNaN(x); });
		for (var j = 0; j + 1 < pts.length; j += 2) {
			cells.push([pts[j], pts[j + 1]]);
		}
	}

	// drawField();
	// whenToDraw = new Date().getTime() + 300;
	fieldDrawEvent = setTimeout(drawField, 70);
}

function drawField() {
	// if (new Date().getTime() < whenToDraw || whenToDraw == 0) {
	// 	return;
	// }

	// whenToDraw = 0;

	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	var min_x, max_x, min_y, max_y;

	if (cells.length == 0) {
		min_x = 0;
		min_y = 0;
		max_x = 0;
		max_y = 0;
	} else {
		// var tmp = cells.values().next().value;
		// console.log(tmp);
		min_x = cells[0][0];
		max_x = cells[0][0];
		min_y = cells[0][1];
		max_y = cells[0][1];
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

	if (Math.max(len_x, len_y) > 40) {
		ctx.clearRect(0, 0, width, height);
		ctx.font = "24px sans-serif";
		ctx.fillText("The bounding rectangle is", Math.floor(width / 3), Math.floor(height / 3), Math.floor(width / 3));
		ctx.fillText("so fukcing big", Math.floor(width / 3), Math.floor(height / 3) + 24, Math.floor(width / 3));
		return;
	}

	// console.log(min_x, max_x, min_y, max_y);

	var size = Math.floor(Math.min(width / len_x, height / len_y));
	// console.log(map);
	ctx.save();
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	// console.log(cells);
	for (var i = 0; i * size < width; ++i) {
		for (var j = 0; j * size < height; ++j) {
			ctx.fillStyle = "#000000";
			ctx.moveTo(i * size, j * size);
			ctx.lineTo((i + 1) * size, j * size);
			ctx.lineTo((i + 1) * size, (j + 1) * size);
			ctx.lineTo(i * size, (j + 1) * size);
			ctx.lineTo(i * size, j * size);
			ctx.stroke();

			if (!hasList(cells, [i - offset + min_x, j - offset + min_y])) {
				ctx.fillStyle = "#FFFFFF";
			}
			ctx.fillRect(i * size + 1, j * size + 1, size - 2, size - 2);
		}
	}
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
