#!/usr/bin/env python3

import sys
from bs4 import BeautifulSoup

"""
Usage:
	Download the contents of
	view-source:https://projecteuler.net/progress=username
	to the opponent.htm file, then run this script
"""

try:
	with open("/home/golovanov/prog/projecteuler/opponent.htm") as f:
		soup = BeautifulSoup(f.read(), "html.parser")
except FileNotFoundError:
	print("need opponent.htm")
	sys.exit(1)

probs = soup.find_all("td", {"class": "tooltip"})
unsolved = []
for prob in probs:
	if "problem_solved" in prob.attrs["class"] or "own_problem_solved" in prob.find("div").attrs["class"]:
		continue
	divs = prob.find_all("div")
	if len(divs) != 6:
		divs = divs[:-2] + [101] + divs[-2:]
	_, idx, solved, difficulty, name, _ = divs
	if difficulty == 101:
		unsolved.append((101, int(idx.text.split()[-1]), name.text.strip('"'), int(solved.text.split()[-1])))
	else:
		unsolved.append((int(difficulty.text.split()[-1][:-1]), int(idx.text.split()[-1]), name.text.strip('"'), int(solved.text.split()[-1])))

print("""<!DOCTYPE html>
<html>
<head>
<!-- Chrome, Firefox OS and Opera -->
<meta name="theme-color" content="#000000">
<!-- Windows Phone -->
<meta name="msapplication-navbutton-color" content="#000000">
<!-- iOS Safari -->
<meta name="apple-mobile-web-app-status-bar-style" content="#000000">
<title>{} problems</title>
</head>
<body bgcolor=black link=orange vlink=orange alink=orange><font color=white size=18>""".format(len(unsolved)))

unsolved.sort()
for difficulty, idx, name, _ in unsolved:
	if difficulty <= 100:
		print("Problem {}. <a href='https://projecteuler.net/problem={}'>{}</a>: {}%<br>".format(idx, idx, name, difficulty))
	else:
		print("Problem {}. <a href='https://projecteuler.net/problem={}'>{}</a>: difficulty not finalized<br>".format(idx, idx, name))

print("</font></body></html>")