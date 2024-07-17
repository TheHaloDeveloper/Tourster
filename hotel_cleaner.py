#next page: CFo=
with open('static/data/info.txt', 'r') as f:
    lines = f.readlines()

with open('static/data/info.txt', 'w') as f:
    for line in lines:
        if len(line.strip("\n").strip()) != 0:
            f.write(line)