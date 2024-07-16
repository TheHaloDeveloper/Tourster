from apify_client import ApifyClient
import os

client = ApifyClient(os.getenv('apify'))
file = open('static/data/info.txt', 'a')

run_input = {
    "locationFullName": "Los Angeles",
    "maxItemsPerQuery": 500,
    "includeTags": True,
    "includeNearbyResults": False,
    "includeAttractions": True,
    "includeRestaurants": True,
    "includeHotels": True,
    "includeVacationRentals": False,
    "checkInDate": "",
    "checkOutDate": "",
    "includePriceOffers": False,
    "includeAiReviewsSummary": True,
    "language": "en",
    "currency": "USD",
}

run = client.actor("dbEyMBriog95Fv8CW").call(run_input=run_input)

for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    file.write(f'{item}\n')

print('Done')
file.close()