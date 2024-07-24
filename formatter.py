with open("static/data/formatted.txt", "w") as output_file:
    with open("static/data/attractions.txt", "r") as input_file:
        for line in input_file:
            modified_line = ""
            line_length = len(line)
            
            for i in range(line_length):
                char = line[i]
                next_char = line[i+1] if i + 1 < line_length else None
                second_char = line[i+2] if i + 2 < line_length else None
                
                if char == "'" and not (next_char == 's' and second_char == ' '):
                    modified_line += '"'
                else:
                    modified_line += char
            
            output_file.write(modified_line)