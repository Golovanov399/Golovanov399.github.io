var width = document.getElementById("myCanvas").width;
var height = document.getElementById("myCanvas").height;

var cells;
var fieldDrawEvent;

var mouse_table_x;
var mouse_table_y;

var last_mouse_x;
var last_mouse_y;

var bounding_rect_x;
var bounding_rect_y;

var no_mouse = false;

function sleepHelp(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function sleep(ms) {
	sleepHelp(ms).then(() => {});
}

function isSpace(c) {
	return ((c == ' ') || (c == '\t') || (c == '\n'));
}

function divideByTokens(str) {
	var result = [];
	var last = "";
	for (var i in str) {
		var c = str[i];
		if (isSpace(c)) {
			if (last != "") {
				result.push(last);
			}
			last = "";
		} else {
			last += c;
		}
	}
	if (last != "") {
		result.push(last);
	}
	return result;
}

function isColor(str) {
	if (str.length != 7 || str[0] != '#') {
		return false;
	}
	for (var i in str) {
		if (i == 0) {
			continue;
		}
		if ("0123456789abcdefABCDEF".indexOf(str[i]) == -1) {
			return false;
		}
	}
	return true;
}

var colors = {"black": "#000000", "red": "#FF0000", "green": "#007F00", "blue": "#0000FF",
			  "yellow": "#FFFF00", "orange": "#FFA500", "gray": "#7F7F7F", "white": "#FFFFFF"};


function refreshField() {
	var c = null;
	while (c == null) {
		c = document.getElementById("textbox");
		sleep(10);
	}
	var lines = c.value.split("\n");

	var tokens = [];

	for (var i in lines) {
		tokens = tokens.concat(divideByTokens(lines[i]));
	}

	var data = [];
	tokens.forEach(function(token) {
		var tmp = Number(token);
		if (Number.isInteger(tmp)) {
			data.push(tmp);
		} else if (token in colors) {
			data.push(colors[token]);
		} else if (isColor(token)) {
			data.push(token.toUpperCase());
		}
	});

	var last_x, last_y;
	cells = [];
	var current_color = colors["black"];
	for (var x in data) {
		if (Number.isInteger(data[x])) {
			if (isNaN(last_x)) {
				last_x = data[x];
			} else if (isNaN(last_y)) {
				last_y = data[x];
				if (!(current_color in cells)) {
					cells[current_color] = new Cartesian();
				}
				cells[current_color].add([last_x, last_y]);
				last_x = NaN;
				last_y = NaN;
			}
		} else {
			last_x = NaN;
			last_y = NaN;
			current_color = data[x];
		}
	}

	checkMouseChange();

	fieldDrawEvent = setTimeout(drawField, 10);
}

function getL2Dist(c1, c2) {
	return Math.hypot(c1[0] - c2[0], c1[1] - c2[1]);
}

function getCenter(x, y) {
	return [Math.sqrt(3) * (x + y * 0.5), 1.5 * y];
}

function getHexCoords(pt, size, offset) {
	// oh fucking fuck
	// luckily hexagonal grid is the Voronoi diagram of hexagons' centers
	// can we use this?

	x = (pt[0] - offset[0]) / size;
	y = (pt[1] - offset[1]) / size;

	// y in [j * 1.5 - 1, j * 1.5 + 1]
	// j in [(y - 1) / 1.5, (y + 1) / 1.5]

	var opt_dist = 3 * size;
	var opt_cell = [0, 0];

	x /= Math.sqrt(3);
	for (var j = Math.floor((y - 1) / 1.5); j <= Math.ceil((y + 1) / 1.5); ++j) {
		// sqrt(3) * (i + j/2) in [ex_x - sqrt(3) / 2, ex_x + sqrt(3) / 2]
		// (i + j/2) in [x - 1 / 2, x + 1 / 2]
		for (var i = Math.floor(x - 0.5 - j / 2); i <= Math.ceil(x + 0.5 - j / 2); ++i) {
			var c = [i + j * 0.5, j * 1.5];
			c[0] *= Math.sqrt(3);
			var d = getL2Dist(c, [x * Math.sqrt(3), y]);
			if (d < opt_dist) {
				opt_cell = [i, j];
				opt_dist = d;
			}
		}
	}

	return opt_cell;
}

function walkCellPath(ctx, cell, size, offset) {
	c = getCenter(cell[0], cell[1]);
	c[0] *= size;
	c[1] *= size;
	c[0] += offset[0];
	c[1] += offset[1];

	ctx.moveTo(c[0] - size * Math.sqrt(3) / 2, height - (c[1] + size * 0.5));
	ctx.lineTo(c[0], height - (c[1] + size));
	ctx.lineTo(c[0] + size * Math.sqrt(3) / 2, height - (c[1] + size * 0.5));
	ctx.lineTo(c[0] + size * Math.sqrt(3) / 2, height - (c[1] - size * 0.5));
	ctx.lineTo(c[0], height - (c[1] - size));
	ctx.lineTo(c[0] - size * Math.sqrt(3) / 2, height - (c[1] - size * 0.5));
	ctx.lineTo(c[0] - size * Math.sqrt(3) / 2, height - (c[1] + size * 0.5));
}

function drawCellBorder(ctx, cell, size, offset) {
	walkCellPath(ctx, cell, size, offset);
	ctx.stroke();
}

function drawHalfCellBorder(ctx, cell, size, offset) {
	c = getCenter(cell[0], cell[1]);
	c[0] *= size;
	c[1] *= size;
	c[0] += offset[0];
	c[1] += offset[1];

	ctx.moveTo(c[0], height - (c[1] + size));
	ctx.lineTo(c[0] + size * Math.sqrt(3) / 2, height - (c[1] + size * 0.5));
	ctx.lineTo(c[0] + size * Math.sqrt(3) / 2, height - (c[1] - size * 0.5));
	ctx.lineTo(c[0], height - (c[1] - size));

	ctx.stroke();
}

function drawCell(ctx, cell, size, offset) {
	// fill style should be already set!
	ctx.beginPath();
	walkCellPath(ctx, cell, size, offset);
	ctx.fill();
}

function drawText(ctx, cell, size, offset, text) {
	c = getCenter(cell[0], cell[1]);
	c[0] *= size;
	c[1] *= size;
	c[0] += offset[0];
	c[1] += offset[1];

	ctx.fillText(text, c[0], height - c[1] + size * 0.2);
}

function drawField() {
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	var min_x, max_x, min_y, max_y;
	var total_count = 0;

	// move right = increase x; y = const
	// move up = increase y & decrease x; y + 2x = const

	for (var color in cells) {
		cells[color].forEach(function(cell) {
			p = [2 * cell[0] + cell[1], cell[1]];
			if (isNaN(min_x)) {
				min_x = p[0];
				max_x = p[0];
				min_y = p[1];
				max_y = p[1];
			} else {
				min_x = Math.min(min_x, p[0]);
				max_x = Math.max(max_x, p[0]);
				min_y = Math.min(min_y, p[1]);
				max_y = Math.max(max_y, p[1]);
			}
			total_count += 1;
		});
	}

	var offset = 2;

	var len_x = max_x - min_x + 2 * offset;
	var len_y = max_y - min_y + 2 * offset;

	var size = Math.floor(Math.min(width / len_x / Math.sqrt(3), height / len_y / 1.5));
	if (size == 0) {
		size = 1;
	}

	if (len_x * len_y > 1000 && document.getElementById("show_grid_box").checked) {
		no_mouse = true;
		ctx.clearRect(0, 0, width, height);
		ctx.font = "24px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText("The bounding rectangle is", Math.floor(width / 3), Math.floor(height / 3), Math.floor(width / 3));
		ctx.fillText("so fukcing big", Math.floor(width / 3), Math.floor(height / 3) + 24, Math.floor(width / 3));
		return;
	} else if (len_x * len_y > 300 && document.getElementById("show_grid_box").checked) {
		no_mouse = true;
	} else {
		no_mouse = false;
	}
	document.getElementById("no_mouse_icon").hidden = !no_mouse;

	if (total_count > 1000) {
		ctx.clearRect(0, 0, width, height);
		ctx.font = "24px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText("The number of colored cells", Math.floor(width / 3), Math.floor(height / 3), Math.floor(width / 3));
		ctx.fillText("is so fukcing big", Math.floor(width / 3), Math.floor(height / 3) + 24, Math.floor(width / 3));
		return;
	}

	ctx.save();
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();

	/*
		well, so now we are going to make a "bounding box"
		it will be len_x + 2 * offset width
		it will be len_y + 2 * offset height, but
		how are we going to draw these cells?
		actually easy: height makes a constraint on y
		some formulas follow

		(i, j) = (2x + y, y)
		i in [l, r], j in [d, u]
		then
		for y in [d..u]:
			for x in [(l - y) / 2 .. (r - y) / 2]:
				do something

		...

		and, erm, how do we get a coord_offset?
		well if the center of our picture has coords [(min_x + max_x) / 2, ...]
		and it should be [width / 2, height / 2],
		then it's straightforward

		...

		first fors produce an ugly pic btw, so we just fill the whole canvas lol
		soooo here we use a formula for centers
		[sqrt(3) * x + sqrt(3)/2 * y, 3/2 * y]
		3/2 * y * size + size >= -off[1], 3/2 * y * size - size <= -off[1] + height
	*/

	// start drawing everything, starting from borders

	var center_coords = getCenter((min_x + max_x - min_y - max_y) / 4, (min_y + max_y) / 2);
	var coord_offset = [width / 2 - center_coords[0] * size, height / 2 - center_coords[1] * size];

	if (document.getElementById("show_grid_box").checked) {
		ctx.strokeStyle = "#000000";
		for (var y = Math.ceil((-coord_offset[1] - size) * 2 / 3 / size); y <= Math.floor((-coord_offset[1] + height + size) * 2 / 3 / size); ++y) {
			var tmp = Math.sqrt(3) / 2 * y * size;
			for (var x = -1 + Math.ceil((-coord_offset[0] - size * Math.sqrt(3) / 2 - tmp) / Math.sqrt(3) / size); x <= Math.floor((-coord_offset[0] + width + size * Math.sqrt(3) / 2 - tmp) / Math.sqrt(3) / size); ++x) {
				// drawCellBorder(ctx, [x, y], size, coord_offset);
				drawHalfCellBorder(ctx, [x, y], size, coord_offset);
			}
		}
	}

	if (document.getElementById("mouse_box").checked && !no_mouse && !isNaN(mouse_table_x) && !isNaN(mouse_table_y)) {
		ctx.fillStyle = "#CFCFCF";
		drawCell(ctx, [mouse_table_x, mouse_table_y], size, coord_offset);
	}

	ctx.globalAlpha = 0.6;

	for (var color in cells) {
		ctx.fillStyle = color;
		cells[color].forEach(function(cell) {
			drawCell(ctx, cell, size, coord_offset);
		});
	}

	ctx.globalAlpha = 1.0;

	if (document.getElementById("coords_box").checked) {
		ctx.font = Math.floor(size * 0.5).toString() + "px sans-serif";
		ctx.textAlign = "center";
		ctx.fillStyle = "#5f5f5f";
		for (var y = Math.ceil((-coord_offset[1] - size) * 2 / 3 / size); y <= Math.floor((-coord_offset[1] + height + size) * 2 / 3 / size); ++y) {
			var tmp = Math.sqrt(3) / 2 * y * size;
			for (var x = Math.ceil((-coord_offset[0] - size * Math.sqrt(3) / 2 - tmp) / Math.sqrt(3) / size); x <= Math.floor((-coord_offset[0] + width + size * Math.sqrt(3) / 2 - tmp) / Math.sqrt(3) / size); ++x) {
				drawText(ctx, [x, y], size, coord_offset, "(" + x + ", " + y + ")");
			}
		}
	}

	if (document.getElementById("axis_box").checked) {
		ctx.strokeStyle = "#7F7F7F";
		ctx.lineWidth = 3;
		ctx.beginPath();

		// draw arrows like a retard
		ctx.moveTo(0, height / 2);
		ctx.lineTo(width, height / 2);
		ctx.stroke();
		ctx.moveTo(width, height / 2);
		ctx.lineTo(width * 0.95, height * 0.48);
		ctx.stroke();
		ctx.moveTo(width, height / 2);
		ctx.lineTo(width * 0.95, height * 0.52);
		ctx.stroke();

		ctx.moveTo(width / 2 - height / Math.sqrt(3) / 2, height);
		ctx.lineTo(width / 2 + height / Math.sqrt(3) / 2, 0);
		ctx.stroke();
		ctx.moveTo(width / 2 + height / Math.sqrt(3) / 2, 0);
		ctx.lineTo(width / 2 + height / Math.sqrt(3) / 2 - width * 0.02, width * 0.05);
		ctx.stroke();
		ctx.moveTo(width / 2 + height / Math.sqrt(3) / 2, 0);
		ctx.lineTo(width / 2 + height / Math.sqrt(3) / 2 - width * 0.033, width * 0.043);
		ctx.stroke();

		ctx.lineWidth = 1;
	}

	ctx.restore();
}

function checkMouseChange() {
	var new_mouse_pos_x, new_mouse_pos_y;

	// copy-pasted from above

	var min_x, max_x, min_y, max_y;
	var total_count = 0;

	// move right = increase x; y = const
	// move up = increase y & decrease x; y + 2x = const

	for (var color in cells) {
		cells[color].forEach(function(cell) {
			p = [2 * cell[0] + cell[1], cell[1]];
			if (isNaN(min_x)) {
				min_x = p[0];
				max_x = p[0];
				min_y = p[1];
				max_y = p[1];
			} else {
				min_x = Math.min(min_x, p[0]);
				max_x = Math.max(max_x, p[0]);
				min_y = Math.min(min_y, p[1]);
				max_y = Math.max(max_y, p[1]);
			}
		});
	}

	var offset = 2;

	var len_x = max_x - min_x + 2 * offset;
	var len_y = max_y - min_y + 2 * offset;

	var size = Math.floor(Math.min(width / len_x / Math.sqrt(3), height / len_y / 1.5));
	if (size == 0) {
		size = 1;
	}

	var center_coords = getCenter((min_x + max_x - min_y - max_y) / 4, (min_y + max_y) / 2);
	var coord_offset = [width / 2 - center_coords[0] * size, height / 2 - center_coords[1] * size];

	// end
	// TODO: make a special function for it

	new_mouse_pos = getHexCoords([last_mouse_x - bounding_rect_x, height - (last_mouse_y - bounding_rect_y)], size, coord_offset);

	if (new_mouse_pos[0] != mouse_table_x || new_mouse_pos[0] != mouse_table_y) {
		mouse_table_x = new_mouse_pos[0];
		mouse_table_y = new_mouse_pos[1];
		return true;
	} else {
		return false;
	}
}

function mouseMove(e) {
	if (no_mouse) {
		return;
	}
	last_mouse_x = e.clientX;
	last_mouse_y = e.clientY;
	if (checkMouseChange()) {
		refreshField();
	}
}

bounding_rect_x = document.getElementById("myCanvas").getBoundingClientRect().left;
bounding_rect_y = document.getElementById("myCanvas").getBoundingClientRect().top;
refreshField();
