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
	print("<img src='imgs/%s.png'> \\( = %s \\)</img><br><br>" % (pic, meaning), file=f)

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
	print(footer, file=f)
