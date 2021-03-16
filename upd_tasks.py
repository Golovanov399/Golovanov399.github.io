#!/usr/bin/python3

from bs4 import BeautifulSoup
import requests
import os

def scrap_problem(pid):
	url = f"https://projecteuler.net/problem={pid}"
	t = requests.get(url).text
	soup = BeautifulSoup(t, "html.parser")
	pname = soup.find("h2").text
	statement = "".join(map(str, soup.find("div", {"class": "problem_content"}).contents)).strip()
	stats = soup.find("span", {"class": "tooltiptext_right"}).text.split(";")
	if len(stats) == 2:
		when_published, cnt_solved = map(lambda x: x.strip(), stats)
		difficulty = "unknown"
	else:
		when_published, cnt_solved, difficulty = map(lambda x: x.strip(), stats)
		assert difficulty.startswith("Difficulty rating: "), difficulty
		difficulty = difficulty[len("Difficulty rating: "):]
	statement = f"""
<div class="all_problems">
<div class="tooltip"><h3><a href="problem={pid}">Problem {pid}: {pname}<span class="tooltiptext">{when_published}<br>{cnt_solved}<br>Difficulty rating: {difficulty}</span></a></h3></div>
<div class="problem_content">

{statement}

</div>
</div>
<br>
<div style='page-break-after:always'></div>
"""
	with open(f"pe_html_sources/{pid}.htm", "w") as f:
		print(statement, file=f)


def main():
	url = "https://projecteuler.net/recent"
	t = requests.get(url).text
	soup = BeautifulSoup(t, "html.parser")
	cnt = int(soup.find("table", id="problems_table").find_all("tr")[1].find("td").text)
	print(f"{cnt} problems in total")
	files = os.listdir("pe_html_sources")
	for i in range(1, cnt + 1):
		fname = f"{i}.htm"
		if fname in files:
			continue
		print(f"Downloading problem {i}...")
		scrap_problem(i)

	page = ["""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="author" content="Colin Hughes" />
<meta name="description" content="A website dedicated to the fascinating world of mathematics and programming" />
<meta name="keywords" content="programming,mathematics,problems,puzzles" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>All Project Euler problems</title>
<base href="https://projecteuler.net">
<link rel="shortcut icon" href="favicon.ico">
<link rel="stylesheet" type="text/css" href="themes/20210213/style_main.css">
<link rel="stylesheet" type="text/css" href="themes/20210213/style_default.css">
<script src="js/mathjax_config.js"></script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async
   src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
</script></head>

<body>

<div id="container">

<div id="content">
"""]
	for i in range(1, cnt + 1):
		page.append(open(f"pe_html_sources/{i}.htm").read())
	page.append("""</div> <!--end_content-->
</div> <!--end_container-->

<div id="footer" class="noprint">
Project Euler: <a href="copyright">Copyright Information</a> | <a href="privacy">Privacy Policy</a>
</div> <!--end_footer-->
<div id="modal_window">
   <div id="modal_content" class="message_body">
   <p>The page has been left unattended for too long and that link/button is no longer active. Please refresh the page.</p>
   </div>
</div> <!--end_modal_window-->
<script src="js/general.js"></script>

</body>
</html>
""")
	with open("whole_pe.htm", "w") as f:
		print(*page, sep='\n', file=f)


if __name__ == "__main__":
	main()
