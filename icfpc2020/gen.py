#!/usr/bin/python3

from PIL import Image, ImageDraw

def draw_grid(grid, filename):
	sz = 50
	h = len(grid)
	w = len(grid[0])
	image = Image.new("RGB", (sz * w + 1, sz * h + 1), (0, 0, 0))
	draw = ImageDraw.Draw(image)
	for i in range(len(grid)):
		for j in range(len(grid[i])):
			if grid[i][j] == '#':
				draw.rectangle([j * sz, i * sz, (j + 1) * sz, (i + 1) * sz], fill='white', outline='black')
	image.save(filename)
	print("{} saved".format(filename))

draw_grid("""
	.#
	#.
""".strip().replace("\t", "").split("\n"), "imgs/0.png")
draw_grid("""
	.#
	##
""".strip().replace("\t", "").split("\n"), "imgs/1.png")
draw_grid("""
	.##
	#.#
	#..
""".strip().replace("\t", "").split("\n"), "imgs/2.png")
draw_grid("""
	.##
	###
	#..
""".strip().replace("\t", "").split("\n"), "imgs/3.png")

draw_grid("""
	.#
	##
	#.
""".strip().replace("\t", "").split("\n"), "imgs/-1.png")
draw_grid("""
	.##
	#.#
	#..
	#..
""".strip().replace("\t", "").split("\n"), "imgs/-2.png")
draw_grid("""
	.##
	###
	#..
	#..
""".strip().replace("\t", "").split("\n"), "imgs/-3.png")

draw_grid("""
	##
	#.
""".strip().replace("\t", "").split("\n"), "imgs/lambda.png")

draw_grid("""
	##.####
	#..##..
	...#..#
	...#.##
""".strip().replace("\t", "").split("\n"), "imgs/succ.png")
draw_grid("""
	##.####
	#..##..
	...#.#.
	...#.##
""".strip().replace("\t", "").split("\n"), "imgs/pred.png")
draw_grid("""
	##.##.####
	#..#..##.#
	......##.#
	......##.#
""".strip().replace("\t", "").split("\n"), "imgs/sum.png")
draw_grid("""
	##.##.####
	#..#..#.#.
	......#.#.
	......#.#.
""".strip().replace("\t", "").split("\n"), "imgs/prod.png")
draw_grid("""
	##.##.####
	#..#..#...
	......##.#
	......#...
""".strip().replace("\t", "").split("\n"), "imgs/div.png")
draw_grid("""
	##.##.####
	#..#..#...
	......#...
	......####
""".strip().replace("\t", "").split("\n"), "imgs/eq.png")
draw_grid("""
	##.##.####
	#..#..#...
	......#..#
	......#.##
""".strip().replace("\t", "").split("\n"), "imgs/lt.png")
draw_grid("""
	##.####
	#..#.#.
	...##.#
	...#.#.
""".strip().replace("\t", "").split("\n"), "imgs/modulate.png")
draw_grid("""
	##.####
	#..##.#
	...#.#.
	...##.#
""".strip().replace("\t", "").split("\n"), "imgs/demodulate.png")

draw_grid("""
	###
	#.#
	#..
""".strip().replace("\t", "").split("\n"), "imgs/true.png")
draw_grid("""
	###
	#..
	#.#
""".strip().replace("\t", "").split("\n"), "imgs/false.png")
