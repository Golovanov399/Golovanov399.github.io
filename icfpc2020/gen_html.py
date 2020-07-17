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
td {padding: 15px;}
table td:nth-of-type(1) {width: 20%;}
</style>
</head>
<body bgcolor='black'>
<font size=36 color='white'>
"""

footer = """
</font></body></html>
"""

def add(short, pic, meaning, f):
	if short == ".":
		print("<img src='imgs/%s.png'/> \\( = %s \\)<br><br>" % (pic, meaning), file=f)
	else:
		print("<tr><td>%s</td><td><img src='imgs/%s.png'/> \\( = %s \\)</td></tr>" % (short, pic, meaning), file=f)

def add_text(short, pic, meaning, f):
	if short == ".":
		print("<img src='imgs/%s.png'/> = %s<br><br>" % (pic, meaning), file=f)
	else:
		print("<tr><td>%s</td><td><img src='imgs/%s.png'/> D= %s</td></tr>" % (short, pic, meaning), file=f)

with open("page.html", "w") as f:
	print(header, file=f)
	print("<table align='center'>", file=f)
	add("0", "0", 0, f)
	add("1", "1", 1, f)
	add("2", "2", 2, f)
	add("3", "3", 3, f)
	add("-1", "-1", -1, f)
	add("-2", "-2", -2, f)
	add("-3", "-3", -3, f)
	add("ap", "lambda", "\\lambda x/y/z", f)
	add("inc", "succ", "\\lambda x.(x + 1)", f)
	add("dec", "pred", "\\lambda x.(x - 1)", f)
	add("add", "sum", "\\lambda x.\\lambda y.(x + y)", f)
	add("mul", "prod", "\\lambda x.\\lambda y.(x \\cdot y)", f)
	add("div", "div", "\\lambda x.\\lambda y.(x\\text{ div }y)", f)
	add("eq", "eq", "\\lambda x.\\lambda y.(x = y)", f)
	add("lt", "lt", "\\lambda x.\\lambda y.(x < y)", f)
	add("true", "true", "\\text{true}", f)
	add("false", "false", "\\text{false}", f)
	add("", "modulate", "\\lambda x.\\text{modulate}(x)", f)
	add("", "demodulate", "\\lambda x.\\text{demodulate}(x)", f)
	add("neg", "negate", "\\lambda x.(-x)", f)
	add("s", "S", "\\lambda xyz.xz(yz)", f)
	add("c", "C", "\\lambda xyz.xzy", f)
	add("b", "B", "\\lambda xyz.x(yz)", f)
	add("t", "K", "\\lambda xy.x", f)
	add("f", "False", "\\lambda xy.y", f)
	add("", "pow2", "\\lambda x.2^x", f)
	add("i", "I", "\\lambda x.x", f)
	add("cons", "Cons", "\\lambda xyz.zxy", f)
	add("car", "Car", "\\lambda z.z(\\lambda xy.x)", f)
	add("cdr", "Cdr", "\\lambda z.z(\\lambda xy.y)", f)
	print("</table><center>", file=f)
	print("========================<br>", file=f)
	add_text(".", "nil", "nil = [] = empty list", f)
	print("<img src='imgs/left_bracket.png'/> \\(x_1\\) <img src='imgs/delim.png'/> \\(x_2\\) <img src='imgs/delim.png'/> \\(\\dots\\) <img src='imgs/delim.png'/> \\(x_n\\) <img src='imgs/right_bracket.png'/> = List\\((x_1, x_2, \\dots, x_n)\\)<br><br>", file=f)
	print("List\\((x_1, x_2, \\dots, x_n)\\) = Pair(\\(x_1\\), Pair(\\(x_2\\), Pair(\\(\\dots\\), Pair(\\(x_n\\), nil))))<br><br>", file=f)
	add_text(".", "point", "\\(\\lambda xy.\\)Point(x, y) = Pair(x, y)", f)
	add_text(".", "draw", "Draw", f)
	print("Draw\\([(x_1, y_1), (x_2, y_2), \\dots, (x_n, y_n)]\\) draws corresponding pixels", file=f)
	print("</center>", file=f)
	print(footer, file=f)
