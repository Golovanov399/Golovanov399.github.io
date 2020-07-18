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
				cells[current_color].add([last_x, -last_y]);
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

function drawField() {
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	var min_x, max_x, min_y, max_y;
	var total_count = 0;

	for (var color in cells) {
		cells[color].forEach(function(cell){
			if (isNaN(min_x)) {
				min_x = cell[0];
				max_x = cell[0];
				min_y = cell[1];
				max_y = cell[1];
			} else {
				min_x = Math.min(min_x, cell[0]);
				max_x = Math.max(max_x, cell[0]);
				min_y = Math.min(min_y, cell[1]);
				max_y = Math.max(max_y, cell[1]);
			}
			total_count += 1;
		});
	}

	var offset = 3;

	var len_x = max_x - min_x + 2 * offset + 1;
	var len_y = max_y - min_y + 2 * offset + 1;

	var size = Math.floor(Math.min(width / len_x, height / len_y));
	if (size == 0) {
		size = 1;
	}
	var cnt_x = Math.floor(width / size);
	var cnt_y = Math.floor(height / size);

	if (cnt_x + cnt_y > 3000) {
		ctx.clearRect(0, 0, width, height);
		ctx.font = "24px sans-serif";
		ctx.textAlign = "center";
		ctx.fillText("The bounding rectangle is", Math.floor(width / 3), Math.floor(height / 3), Math.floor(width / 3));
		ctx.fillText("so fukcing big", Math.floor(width / 3), Math.floor(height / 3) + 24, Math.floor(width / 3));
		return;
	}

	if (total_count > 5000) {
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

	ctx.font = Math.floor(size * 0.7).toString() + "px sans-serif";
	ctx.textAlign = "center";
	ctx.fillStyle = "#5f5f5f";

	ctx.fillText("x", size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);
	ctx.fillText("=", 2 * size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);
	ctx.fillText((min_x - offset + 3).toString(), 3 * size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);
	ctx.fillText((min_x - offset + 4).toString(), 4 * size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);
	ctx.fillText((min_x - offset + 5).toString(), 5 * size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);

	ctx.fillText("y", Math.floor(size / 2), cnt_y * size - size - Math.floor(size / 3), size);
	ctx.fillText("=", Math.floor(size / 2), cnt_y * size - 2 * size - Math.floor(size / 3), size);
	ctx.fillText((-min_y - cnt_y + offset + 4).toString(), Math.floor(size / 2), cnt_y * size - 3 * size - Math.floor(size / 3), size);
	ctx.fillText((-min_y - cnt_y + offset + 5).toString(), Math.floor(size / 2), cnt_y * size - 4 * size - Math.floor(size / 3), size);
	ctx.fillText((-min_y - cnt_y + offset + 6).toString(), Math.floor(size / 2), cnt_y * size - 5 * size - Math.floor(size / 3), size);

	if (mouse_table_x == 6) {
		ctx.fillText((min_x - offset + 6).toString(), 6 * size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);
	} else {
		ctx.fillText("...", 6 * size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);
	}
	if (mouse_table_x > 6) {
		ctx.fillText((min_x - offset + mouse_table_x).toString(), (mouse_table_x) * size + Math.floor(size / 2), cnt_y * size - Math.floor(size / 3), size);
	}
	if (mouse_table_y == cnt_y - 7) {
		ctx.fillText((-min_y - mouse_table_y + offset).toString(), Math.floor(size / 2), mouse_table_y * size + Math.floor(size * 2 / 3), size);
	} else {
		ctx.fillText("...", Math.floor(size / 2), cnt_y * size - 6 * size - Math.floor(size / 3), size);
	}
	if (mouse_table_y < cnt_y - 7) {
		ctx.fillText((-min_y - mouse_table_y + offset).toString(), Math.floor(size / 2), mouse_table_y * size + Math.floor(size * 2 / 3), size);
	}

	ctx.globalAlpha = 0.6;

	for (var color in cells) {
		ctx.fillStyle = color;
		cells[color].forEach(function(cell) {
			var i = cell[0] - min_x + offset;
			var j = cell[1] - min_y + offset;
			ctx.fillRect(i * size, j * size, size, size);
		});
	}

	ctx.globalAlpha = 1.0;

	ctx.restore();
}

function checkMouseChange() {
	var new_mouse_pos_x, new_mouse_pos_y;

	// copy-pasted from above

	var min_x, max_x, min_y, max_y;
	for (var color in cells) {
		cells[color].forEach(function(cell){
			if (isNaN(min_x)) {
				min_x = cell[0];
				max_x = cell[0];
				min_y = cell[1];
				max_y = cell[1];
			} else {
				min_x = Math.min(min_x, cell[0]);
				max_x = Math.max(max_x, cell[0]);
				min_y = Math.min(min_y, cell[1]);
				max_y = Math.max(max_y, cell[1]);
			}
		});
	}

	var offset = 3;

	var len_x = max_x - min_x + 2 * offset + 1;
	var len_y = max_y - min_y + 2 * offset + 1;

	var size = Math.floor(Math.min(width / len_x, height / len_y));
	if (size == 0) {
		size = 1;
	}

	// end
	// TODO: make a special function for it

	new_mouse_pos_x = Math.floor((last_mouse_x - bounding_rect_x) / size);
	new_mouse_pos_y = Math.floor((last_mouse_y - bounding_rect_y) / size);

	if (new_mouse_pos_x != mouse_table_x || new_mouse_pos_y != mouse_table_y) {
		mouse_table_x = new_mouse_pos_x;
		mouse_table_y = new_mouse_pos_y;
		return true;
	} else {
		return false;
	}
}

function mouseMove(e) {
	last_mouse_x = e.clientX;
	last_mouse_y = e.clientY;
	if (checkMouseChange()) {
		refreshField();
	}
}

bounding_rect_x = document.getElementById("myCanvas").getBoundingClientRect().left;
bounding_rect_y = document.getElementById("myCanvas").getBoundingClientRect().top;
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
