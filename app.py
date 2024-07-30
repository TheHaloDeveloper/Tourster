from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, session, url_for
from datetime import datetime
import os
import ast
import google.generativeai as genai
import requests
from google.generativeai.types import HarmCategory, HarmBlockThreshold, StopCandidateException

import json
from os import environ as env
from urllib.parse import quote_plus, urlencode

from dotenv import find_dotenv, load_dotenv
import geopy.distance

load_dotenv()

app = Flask(__name__)

arr = []
with open('static/data/search-airports.txt', 'r') as f:
    arr = [line.rstrip() for line in f]

data = {}
with open('static/data/attractions.txt', 'r') as f:
    data['attractions'] = [line.rstrip() for line in f]
with open('static/data/attraction-filters.txt', 'r') as f:
    data['attraction-filters'] = [line.rstrip() for line in f]
with open('static/data/attraction-people.txt', 'r') as f:
    data['attraction-people'] = [line.rstrip() for line in f]
    
with open('static/data/restaurants.txt', 'r') as f:
    data['restaurants'] = [line.rstrip() for line in f]
with open('static/data/hotels.txt', 'r') as f:
    data['hotels'] = [line.rstrip() for line in f]
with open('static/data/rentals.txt', 'r') as f:
    data['rentals'] = [line.rstrip() for line in f]
with open('static/data/restaurants.txt', 'r') as f:
    data['restaurants'] = [line.rstrip() for line in f]

@app.route('/soon')
def serve_soon():
    return send_from_directory('static', 'soon.html')

@app.route('/trip')
def serve_trip():
    return render_template('trip.html', data=data)

@app.route('/new')
def serve_new():
    return render_template('new.html', search=arr)

@app.route('/terms')
def serve_terms():
    return send_from_directory('static', 'tac.html')

@app.route('/chat')
def serve_chat():
    return send_from_directory('static', 'chat.html')

@app.route('/privacy')
def serve_privacy():
    return send_from_directory('static', 'privacy.html')

@app.route('/cookies')
def serve_cookies():
    return send_from_directory('static', 'cookies.html')

@app.route('/')
def home():
    return render_template("home.html", session=session.get('user'), pretty=json.dumps(session.get('user'), indent=4))

@app.route('/geocode', methods=['POST'])
def geocode():
    info = request.json
    name = info.get('name', '')

    url = f"https://api.opencagedata.com/geocode/v1/json?q={requests.utils.quote(name)}&key={os.getenv('opencage')}"

    response = requests.get(url)
    data = response.json()
    
    if data['results']:
        result = data['results'][0]
        return jsonify({'response': [result['geometry']['lat'], result['geometry']['lng']]})
    else:
        return jsonify({'error': 'No results found'})

prompt = """
You are ToursterAI, an AI chatbot who creates full travel plans as an all-in-one tool. Your responses should be a max of 100 words.
Messages will have 2 parts: system and user. Users can request information given to you from the system, such as the date in TEXT (January 1, 2000). DO NOT RESPOND TO SYSTEM MESSAGES UNDER ANY CIRCUMSTANCES.
When the user tells you all about their trip information, you need to recap with a list - do NOT use any formatting (such as using * symbols).
Format the list properly (make sure there is a space after commas) 
Keep the date format as "January 1, 2000" for example.
After the recap, users may ask follow up questions to confirm that you understand. Make sure you answer their questions about their trip information.
ONLY provide a recap with "Trip Info:" IF THE USER MAKES A CHANGE TO THEIR TRIP. Everytime a change is made, recap their information and ask if its correct.
Once you have all the information, AND after you have confirmed with something like "Is this correct?", reply with a single "." to mark your info gathering complete.

Example Interaction:
User: What is my budget?
ToursterAI: The budget you have provided me with is ...
User: I see, and what are my dietary restrictions?
ToursterAI: From what I know, your dietary restrictions are ...
User: Can you help me with coding?
ToursterAI: Sorry, I am created to be a travel chatbot. Let's talk about your trip!
ETC...

Whenever you recap their trip, the format should be as follows, the datatype to store is given as well:

[short one-sentence comment about what their previous message]

Trip Info:
- You are flying from [San Francisco, CA (SFO)] to [New York, NY (JFK)]
- You are traveling from [January 1, 2000] to [January 5, 2000] (store it as "01-01-2000 to 01-05-2000")
- You are traveling with [1] children, [2] adults, and [1] seniors
- You have no culinary preferences
- Your dietary restrictions are vegetarian
- You want to see Must-see Attractions
- You are traveling with your family
- Your budget is 10,000 dollars
- You are not bringing any pets
- There is no occasion specified

Is this correct?

User: actually, my budget is 15k dollars

I see, let me update the budget for you.

Trip Info:
- You are flying from San Francisco, CA (SFO) to New York, NY (JFK)
- You are traveling from January 1, 2000 to January 5, 2000 (store it as "01-01-2000 to 01-05-2000")
- You are traveling with 1 children, 2 adults, and 1 seniors
- You have no culinary preferences
- Your dietary restrictions are vegetarian
- You want to see Must-see Attractions
- You are traveling with your family
- Your budget is 15,000 dollars
- You are not bringing any pets
- There is no occasion specified

Is this correct?

User: Yes, thank you!!

.
"""

history = []

genai.configure(api_key=os.getenv('gemini1'))

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 200,
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

@app.route('/ai_response', methods=['POST'])
def ai_response():
    global history, model
    data = request.json
    message = data.get('message', '')

    if len(history) == 0:
        history.extend([
            {
                "role": "user",
                "parts": [f"System Prompt: {prompt}. The date today is {datetime.today().strftime('%m-%d-%Y')}."]
            },
            {
                "role": "model",
                "parts": ["Hello, I am ToursterAI. Anything else you want to tell me about your trip?"]
            }
        ])

    chat_session = model.start_chat(history=history)

    try:
        response = chat_session.send_message(message)

        history.extend([
            {
                "role": "user",
                "parts": [message]
            },
            {
                "role": "model",
                "parts": [response.text]
            }
        ])

        if len(history) >= 20:
            del history[3:5]

        return jsonify({'response': response.text})
    
    except StopCandidateException as e:
        error = "Your message triggered a safety filter and could not be processed. Please try again with a different input."

        history.extend([
            {
                "role": "user",
                "parts": [message.split('Anything else I want to tell you about my trip?')[0].strip()]
            },
            {
                "role": "model",
                "parts": [error]
            },
        ])
        return jsonify({'response': error})

@app.route('/trip_info', methods=['POST'])
def trip_info():
    global model
    data = request.json
    airports = data.get('airports', '')
    rooms = data.get('rooms', '')
    
    #Airport Distance
    start_airport = airports.split('-')[0]
    end_airport = airports.split('-')[1]
    
    coordinates = []
    with open('static/data/airport-locations.txt', 'r') as file:
        for line in file:
            parts = line.split(': ')
            if parts[0] == start_airport or parts[0] == end_airport:
                coordinates.append(parts[1].replace('\n', ''))
            if len(coordinates) == 2:
                break
    
    one = ast.literal_eval(coordinates[0])
    two = ast.literal_eval(coordinates[1])
    
    #Number of Rooms
    history = [
        {
            "role": "user",
            "parts": ["""
                Your job is to determine how many rooms a group of people would need, and output a single number.
                A family with 2 adults and 1-2 kids would need 1 room. Examples:
                
                Input: 2 children, 2 adults, 0 seniors - Relationship: family
                Output: 1
                
                Input: 0 children, 2 adults, 0 seniors - Relationship: romantic-partner
                Output: 1
                
                Input: 0 children, 4 adults, 0 seniors - Relationship: friends
                Output: 2
                
                Input: 2 children, 2 adults, 0 seniors - Relationship: friends
                Output: 2
                
                Input: 2 children, 2 adults, 2 seniors - Relationship: family
                Output: 2
                
                Input: 0 children, 2 adults, 2 seniors - Relationship: business-partner
                Output: 2
                
                Input: 0 children, 3 adults, 0 seniors - Relationship: business-partner
                Output: 3
            """]
        },
        {
            "role": "model",
            "parts": ["Understood."]
        }
    ]
    
    chat_session = model.start_chat(history=history)
    response = chat_session.send_message(rooms)
    
    return jsonify({
        'airport_response': geopy.distance.geodesic(one, two).miles,
        'rooms_response': response.text
    })
    
@app.route('/end_response', methods=['POST'])
def end_response():
    global model, history
    data = request.json
    message = data.get('message', '')

    side_history = [
        {
            "role": "user",
            "parts": ["""
                Messages will be given with a list. Your job is to put the items into the same format. Do NOT use formatting such as ```json etc...
                MAKE SURE YOU DONT CUT OFF THE MESSAGE, FINISH THE WHOLE THING. If something is empty, put it as null.

                ###
                Example Input:
                Okay, I understand.

                - You are flying from San Francisco, CA (SFO) to Little Rock, AR (LIT)
                - You are traveling with your romantic-partner
                - You are traveling with 2 adult(s) and 0 children and 0 seniors
                - Your trip is from July 20, 2024 to July 24, 2024
                - Your culinary preferences are "no spicy food, chinese, italian, and indian food" and you have a dietary restriction of "vegetarian"
                - You want to experience "Must-see Attractions, Great Food, Beaches, Live Music and Concerts, Luxury Shopping, Nightlife, Spas" and restaurants
                - You are bringing a pet with you
                - Your budget is 30000 dollars
                - The occasion is a "honeymoon"

                Is this correct?
                ###

                ###
                Example Output:
                {
                    "from": "San Francisco, CA (SFO)",
                    "to": "Little Rock, AR (LIT)",
                    "date": "07-20-2024 to 07-24-2024",
                    "adults": "2",
                    "seniors": "0",
                    "children": "0",
                    "pets": "yes",
                    "people": "romantic-partner",
                    "occasion": "honeymoon",
                    "extra": "restaurants",
                    "food": ["no-spicy", "chinese", "italian", "indian"],
                    "dietRestrictions": null,
                    "time": [
                        "Must-see Attractions",
                        "Great Food",
                        "Beaches",
                        "Live Music and Concerts",
                        "Luxury Shopping",
                        "Nightlife",
                        "Spas"
                    ],
                    "restrictions": [
                        "vegetarian"
                    ],
                    "budget": "10000"
                }
                ###
            """]
        },
        {
            "role": "model",
            "parts": ["Understood."]
        }
    ]

    chat_session = model.start_chat(history=side_history)

    history = [obj for obj in history if obj["role"] != "user"][1:-1][::-1]
    message = next((i["parts"][0] for i in history if "Trip Info:" in i["parts"][0]), None)

    response = chat_session.send_message(message)
    return jsonify({'response': response.text})

if __name__ == '__main__':
    app.run(debug=True)