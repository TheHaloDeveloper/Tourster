old = open('static/data/hotels.txt', 'r')
main = open('static/data/info.txt', 'a+')

for line in old:
    if line in main:
        continue

    main.write(f'{line}\n')

main.close()
old.close()