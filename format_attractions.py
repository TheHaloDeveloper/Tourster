f = open("static/data/attractions_formatted.txt", "a")

with open("static/data/attractions.txt", "r") as main:
    for line in main:
        f.write(line.replace("'", '"').replace("None", "null"))
    
f.close()