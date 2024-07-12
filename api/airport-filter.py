import re

with open('api/airports.txt') as file:
    for line in file:
        list = re.sub(r'\s+', '.', line.strip()).split('.')

        if len(list) == 5:
            list[1:3] = [''.join(list[1:3])]

        if list[2] == 'USA':
            f = open("api/usa-airports.txt", "a")
            f.write(line)
            f.close()