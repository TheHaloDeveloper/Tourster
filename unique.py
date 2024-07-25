def delete_duplicates_and_sync(file_paths):
    attractions_file, filters_file, people_file = file_paths

    with open(attractions_file, 'r') as file:
        attractions_lines = file.readlines()

    seen = set()
    lines_to_remove = set()
    updated_lines = []

    for index, line in enumerate(attractions_lines):
        if line in seen:
            lines_to_remove.add(index)
        else:
            seen.add(line)
            updated_lines.append(line)

    with open(attractions_file, 'w') as file:
        file.writelines(updated_lines)

    def delete_lines_from_file(file_path, indices_to_remove):
        with open(file_path, 'r') as file:
            lines = file.readlines()

        with open(file_path, 'w') as file:
            for index, line in enumerate(lines):
                if index not in indices_to_remove:
                    file.write(line)

    delete_lines_from_file(filters_file, lines_to_remove)
    delete_lines_from_file(people_file, lines_to_remove)

attractions_file = 'static/data/attractions.txt'
filters_file = 'static/data/attraction-filters.txt'
people_file = 'static/data/attraction-people.txt'

delete_duplicates_and_sync([attractions_file, filters_file, people_file])