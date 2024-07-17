from requests_html import HTMLSession
import pyppdf.patch_pyppeteer
from bs4 import BeautifulSoup

f = open('static/data/info.txt', 'a')

url = 'https://www.opodo.com/travel/?locale=en_GB#/results/type=R;buyPath=1006;from=SFO;to=LAX;dep=2024-07-21;adults=1;direct=false;children=0;infants=0;internalSearch=false;collectionmethod=false;ret=2024-07-27'
session = HTMLSession()
resp = session.get(url)
resp.html.render()
html = resp.html.html

soup = BeautifulSoup(html, 'html.parser')

# main = soup.find_all("ul", {"class": "uitk-typelist"})[0]
# children = main.findChildren('li')
# children.pop(0)

# for card in children:
#     print(card.findChildren())
#     break

f.write(html)
f.close()