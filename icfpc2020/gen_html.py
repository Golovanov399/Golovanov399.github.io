#!/usr/bin/python3

header = """
<!DOCTYPE HTML>
<html>
<head>
<title>Glossary</title>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script type="text/javascript" id="MathJax-script" async
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js">
</script>
<style>
img {
    vertical-align: middle;
}
</style>
</head>
<body bgcolor='black'>
<font size=36 color='white'>
<center>
"""

footer = """
</center></font></body></html>
"""

def add(pic, meaning, f):
	print("<img src='imgs/%s.png'/> \\( = %s \\)<br><br>" % (pic, meaning), file=f)

def add_text(pic, meaning, f):
	print("<img src='imgs/%s.png'/> = %s<br><br>" % (pic, meaning), file=f)

with open("page.html", "w") as f:
	print(header, file=f)
	add("0", 0, f)
	add("1", 1, f)
	add("2", 2, f)
	add("3", 3, f)
	add("-1", -1, f)
	add("-2", -2, f)
	add("-3", -3, f)
	add("lambda", "\\lambda x/y/z", f)
	add("succ", "\\lambda x.(x + 1)", f)
	add("pred", "\\lambda x.(x - 1)", f)
	add("sum", "\\lambda x.\\lambda y.(x + y)", f)
	add("prod", "\\lambda x.\\lambda y.(x \\cdot y)", f)
	add("div", "\\lambda x.\\lambda y.(x\\text{ div }y)", f)
	add("eq", "\\lambda x.\\lambda y.(x = y)", f)
	add("lt", "\\lambda x.\\lambda y.(x < y)", f)
	add("true", "\\text{true}", f)
	add("false", "\\text{false}", f)
	add("modulate", "\\lambda x.\\text{modulate}(x)", f)
	add("demodulate", "\\lambda x.\\text{demodulate}(x)", f)
	add("negate", "\\lambda x.(-x)", f)
	add("S", "\\lambda xyz.xz(yz)", f)
	add("C", "\\lambda xyz.xzy", f)
	add("B", "\\lambda xyz.x(yz)", f)
	add("K", "\\lambda xy.x", f)
	add("False", "\\lambda xy.y", f)
	add("pow2", "\\lambda x.2^x", f)
	add("I", "\\lambda x.x", f)
	add("Cons", "\\lambda xyz.zxy", f)
	add("Car", "\\lambda z.z(\\lambda xy.x)", f)
	add("Cdr", "\\lambda z.z(\\lambda xy.y)", f)
	print("========================<br>", file=f)
	add_text("nil", "nil = [] = empty list", f)
	print("<img src='imgs/left_bracket.png'/> \\(x_1\\) <img src='imgs/delim.png'/> \\(x_2\\) <img src='imgs/delim.png'/> \\(\\dots\\) <img src='imgs/delim.png'/> \\(x_n\\) <img src='imgs/right_bracket.png'/> = List\\((x_1, x_2, \\dots, x_n)\\)<br><br>", file=f)
	print("List\\((x_1, x_2, \\dots, x_n)\\) = Pair(\\(x_1\\), Pair(\\(x_2\\), Pair(\\(\\dots\\), Pair(\\(x_n\\), nil))))<br><br>", file=f)
	add_text("point", "\\(\\lambda xy.\\)Point(x, y)", f)
	add_text("draw", "Draw", f)
	print("Draw\\([(x_1, y_1), (x_2, y_2), \\dots, (x_n, y_n)]\\) draws corresponding pixels", file=f)
	print(footer, file=f)
