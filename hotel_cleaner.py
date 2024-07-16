import json

file = open('static/data/info.txt', 'r')
data = json.loads(''.join(file.readlines()))

print(len(data))

file.close()