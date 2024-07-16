import ast

types = {}
categories = {}

with open('static/data/info.txt', 'r') as file: 
    for line in file:
        data = ast.literal_eval(line.strip())

        if data["type"] in types:
            types[data["type"]] += 1
        else:
            types[data["type"]] = 1

        if data["category"] in categories:
            categories[data["category"]] += 1
        else:
            categories[data["category"]] = 1

print(types)
print(categories)