import requests
from bs4 import BeautifulSoup

f = open('static/data/info.txt', 'a')

url = 'https://vacation.hotwire.com/Flights-Search?tmid=34297673263&trip=RoundTrip&leg1=from%3ASFO%2Cto%3ALAX%2Cdeparture%3A07%2F20%2F2024TANYT&leg2=from%3ALAX%2Cto%3ASFO%2Cdeparture%3A07%2F23%2F2024TANYT&passengers=children%3A0%2Cadults%3A1%2Cseniors%3A0%2Cinfantinlap%3AY&options=sortby%3Aprice&mode=search&paandi=true&pwaDialog=clientSideErrorDialog'

response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# main = soup.find("div", {"id": "listWrapper"})
# list = soup.find("ul")

f.write(f'{soup}')
f.close()