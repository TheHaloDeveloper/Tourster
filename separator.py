import ast

restaurants = open('static/data/restaurants.txt', 'a')
attractions = open('static/data/attractions.txt', 'a')

with open('static/data/info.txt', 'r') as file: 
    for line in file:
        data = ast.literal_eval(line.strip())

        if data["type"] == 'RESTAURANT':
            restaurants.write(f'{line}')
        elif data["type"] == 'ATTRACTION':
            attractions.write(f'{line}')