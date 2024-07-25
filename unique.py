def remove_duplicates(file_path):
    seen = set()
    unique_lines = []

    with open(file_path, 'r') as file:
        for line in file:
            if line not in seen:
                seen.add(line)
                unique_lines.append(line)
    
    with open(file_path, 'w') as file:
        file.writelines(unique_lines)

file_path = 'static/data/rentals.txt'

remove_duplicates(file_path)