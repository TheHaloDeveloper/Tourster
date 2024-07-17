import requests
from bs4 import BeautifulSoup

f = open('static/data/info.txt', 'a')

url = 'https://www.momondo.com/flight-search/SFO-LAX/2024-07-18/2024-07-23'

response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# main = soup.find("div", {"id": "listWrapper"})

f.write(f'{soup}')
f.close()