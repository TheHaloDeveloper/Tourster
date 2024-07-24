with open("static/data/formatted.txt", "w") as output_file:
    with open("static/data/attractions.txt", "r") as input_file:
        for line in input_file:
            a = ""
            line_length = len(line)

            for i in range(line_length):
                char = line[i]
                next_char = line[i+1] if i + 1 < line_length else None
                second_char = line[i+2] if i + 2 < line_length else None

                if char == "'" and not (next_char == 's' and second_char == ' '):
                    a += '"'
                else:
                    a += char
                    
            b = '"description": '
            c = ', "image": '

            start_index = a.find(b) + len(b)
            end_index = a.find(c)
            description = a[start_index:end_index]

            description = description.strip().strip('"').strip(',')
            description = f'`{description}`'

            new_string = a[:start_index] + description + a[end_index:]
            output_file.write(new_string)