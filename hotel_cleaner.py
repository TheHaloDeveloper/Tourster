#next page: CFo=
import json

hotels = open('static/data/hotels.txt', 'a')
rentals = open('static/data/rentals.txt', 'a')

with open('static/data/info.txt', 'r') as f:
    lines = ''.join(f.readlines())

info = {}

for i in lines.split('åå'):
    for prop in json.loads(i)['properties']:
        info = prop

        del info['gps_coordinates']
        del info['property_token']
        del info['serpapi_property_details_link']

        if 'total_rate' in info:
            del info['total_rate']
        if 'rate_per_night' in info:
            info['lowest'] = info['rate_per_night']['lowest']
            del info['rate_per_night']
        if 'check_in_time' in info:
            del info['check_in_time']
        if 'check_out_time' in info:
            del info['check_out_time']
        if 'prices' in info:
            del info['prices']
        if 'deal' in info:
            del info['deal']
        if 'deal_description' in info:
            del info['deal_description']
        if 'hotel_class' in info:
            del info['hotel_class']
        if 'extracted_hotel_class' in info:
            del info['extracted_hotel_class']

        images = []
        for image in info['images']:
            images.append(image['original_image'])

        del info['images']
        info['images'] = images
        
        if info['type'] == 'hotel':
            hotels.write(f'{info}\n')
        elif info['type'] == 'vacation rental':
            rentals.write(f'{info}\n')

hotels.close()
rentals.close()
print('Done')