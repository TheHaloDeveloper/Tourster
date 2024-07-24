f = open('static/data/formatted.txt', 'a')

with open('static/data/attractions.txt', 'r') as file:
    for line in file:
        f.write(line.replace('"', "'"))
    
f.close()