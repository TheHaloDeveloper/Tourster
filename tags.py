import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold, StopCandidateException
import os
from os import environ as env
from dotenv import find_dotenv, load_dotenv

load_dotenv()

prompt = """
You will be provided with a dictionary, and your job is to "tag" the location dictionary with as many of the following tags that apply:
Must-see Attractions, Great Food, Hidden Gems, Beaches, Museums, Sports, Live Music and Concerts, Luxury Shopping, History, Culture, Wine & Beer, Active outdoors, Festivals and events, Local Markets, Guided tours, Nightlife, Spas, Amusement Parks

You need to output the original dictionary with an added array, called "filter". DO NOT CREATE YOUR OWN FILTERS, STICK TO THE LIST PROVIDED. 
DO NOT USE FORMATTING SUCH AS ```json AND OTHERS. ONLY OUTPUT THE UPDATED DICTIONARY. Example:

Input:
{"reviewTags": [{"text": "mid century", "reviews": 10}, {"text": "iconic view", "reviews": 2}, {"text": "docent", "reviews": 12}, {"text": "architecture", "reviews": 22}, {"text": "tours", "reviews": 10}, {"text": "scott", "reviews": 4}], "id": "4799627", "type": "ATTRACTION", "category": "attraction", "subcategories": ["Sights & Landmarks"], "name": "Stahl House", "locationString": "Los Angeles, California", "description": `All tours are by RESERVATION ONLY. You can make a reservation on our website. Stahl House Tour Tickets can ONLY be purchased on our website. No other website or app has been given permission to sell our tour tickets. Thank you.`, "image": "https://media-cdn.tripadvisor.com/media/photo-m/1280/15/a2/2c/60/an-amazing-house-in-living.jpg", "photoCount": 114, "rankingPosition": 71, "rating": 5, "rawRanking": 3.390739917755127, "phone": "+1 208-429-1058", "address": "1635 Woods Dr, Los Angeles, CA 90069-1633", "addressObj": {"street1": "1635 Woods Dr", "street2": null, "city": "Los Angeles", "state": "CA", "country": "United States", "postalcode": "90069-1633"}, "localName": "Stahl House", "localAddress": "1635 Woods Dr, 90069-1633", "localLangCode": "en-US", "email": null, "latitude": 34.100525, "longitude": -118.37027, "webUrl": "https://www.tripadvisor.com/Attraction_Review-g32655-d4799627-Reviews-Stahl_House-Los_Angeles_California.html", "website": "http://www.stahlhouse.com/", "rankingString": "#71 of 931 things to do in Los Angeles", "rankingDenominator": "931", "neighborhoodLocations": [{"id": "21228796", "name": "Hollywood Hills West"}], "nearestMetroStations": [], "ancestorLocations": [{"id": "32655", "name": "Los Angeles", "abbreviation": null, "subcategory": "City"}, {"id": "28926", "name": "California", "abbreviation": "CA", "subcategory": "State"}, {"id": "191", "name": "United States", "abbreviation": null, "subcategory": "Country"}], "ratingHistogram": {"count1": 2, "count2": 0, "count3": 1, "count4": 8, "count5": 73}, "numberOfReviews": 84, "booking": null, "offerGroup": null, "subtype": ["Points of Interest & Landmarks"], "isNearbyResult": false, "photos": [], "travelerChoiceAward": null}

Output:
{"reviewTags":[{"text":"mid century","reviews":10},{"text":"iconic view","reviews":2},{"text":"docent","reviews":12},{"text":"architecture","reviews":22},{"text":"tours","reviews":10},{"text":"scott","reviews":4}],"id":"4799627","type":"ATTRACTION","category":"attraction","subcategories":["Sights & Landmarks"],"name":"Stahl House","locationString":"Los Angeles, California","description":"All tours are by RESERVATION ONLY. You can make a reservation on our website. Stahl House Tour Tickets can ONLY be purchased on our website. No other website or app has been given permission to sell our tour tickets. Thank you.","image":"https://media-cdn.tripadvisor.com/media/photo-m/1280/15/a2/2c/60/an-amazing-house-in-living.jpg","photoCount":114,"rankingPosition":71,"rating":5,"rawRanking":3.390739917755127,"phone":"+1 208-429-1058","address":"1635 Woods Dr, Los Angeles, CA 90069-1633","addressObj":{"street1":"1635 Woods Dr","street2":null,"city":"Los Angeles","state":"CA","country":"United States","postalcode":"90069-1633"},"localName":"Stahl House","localAddress":"1635 Woods Dr, 90069-1633","localLangCode":"en-US","email":null,"latitude":34.100525,"longitude":-118.37027,"webUrl":"https://www.tripadvisor.com/Attraction_Review-g32655-d4799627-Reviews-Stahl_House-Los_Angeles_California.html","website":"http://www.stahlhouse.com/","rankingString":"#71 of 931 things to do in Los Angeles","rankingDenominator":"931","neighborhoodLocations":[{"id":"21228796","name":"Hollywood Hills West"}],"nearestMetroStations":[],"ancestorLocations":[{"id":"32655","name":"Los Angeles","abbreviation":null,"subcategory":"City"},{"id":"28926","name":"California","abbreviation":"CA","subcategory":"State"},{"id":"191","name":"United States","abbreviation":null,"subcategory":"Country"}],"ratingHistogram":{"count1":2,"count2":0,"count3":1,"count4":8,"count5":73},"numberOfReviews":84,"booking":null,"offerGroup":null,"subtype":["Points of Interest & Landmarks"],"isNearbyResult":false,"photos":[],"travelerChoiceAward":null,"filter":["Must-see Attractions", "Guided tours"]}
"""

history = [
    {
        "role": "user",
        "parts": [f"System Prompt: {prompt}. ."]
    },
    {
        "role": "model",
        "parts": ["Understood."]
    }
]

genai.configure(api_key=os.getenv('gemini'))

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 10000,
    "response_mime_type": "text/plain",
}

safety_settings = {
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    safety_settings=safety_settings
)

f = open('static/data/filters.txt', 'a')
chat_session = model.start_chat(history=history)

with open('static/data/attractions.txt', 'r') as file:
    num = 0
    for line in file:
        num += 1
        
        response = chat_session.send_message(line)
        f.write(f"{response.text}")
        print(num)
        
f.close
    