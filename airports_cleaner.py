f = open("static/data/airports.txt", "a")

with open("static/data/all_airports.txt", "r") as file:
    for line in file:
        parts = line.split(',')
        if len(parts) != 14:
            continue
        if parts[3] == '"United States"':
            code = parts[4]
            if code == "\\N":
                code = parts[5]
            
            f.write(f"""{code.replace('"', '')}: [{parts[6]}, {parts[7]}]\n""")
f.close()