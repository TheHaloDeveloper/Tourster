new = open('static/data/search-airports.txt', 'a')

with open('static/data/usa-airports.txt', 'r') as file:
    for line in file:
        arr = line.split()
        if len(arr) == 5:
            arr[0:2] = [' '.join(arr[0:2])]
        
        new.write(f'{arr[0]}, {arr[1]} ({arr[3]})\n')

new.close()