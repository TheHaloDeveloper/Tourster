from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, session, url_for
from datetime import datetime
import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold, StopCandidateException

import json
from os import environ as env
from urllib.parse import quote_plus, urlencode

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY")

oauth = OAuth(app)
oauth.register(
    "auth0",
    client_id=env.get("AUTH0_CLIENT_ID"),
    client_secret=env.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f'https://{env.get("AUTH0_DOMAIN")}/.well-known/openid-configuration'
)

arr = []
with open('static/data/search-airports.txt', 'r') as f:
    arr = [line.rstrip() for line in f]

@app.route('/soon')
def serve_soon():
    return send_from_directory('static', 'soon.html')

@app.route('/trip')
def serve_trip():
    return send_from_directory('static', 'trip.html')

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

@app.route("/login")
def login():
    return oauth.auth0.authorize_redirect(
        redirect_uri=url_for("callback", _external=True)
    )

@app.route("/callback", methods=["GET", "POST"])
def callback():
    token = oauth.auth0.authorize_access_token()
    session["user"] = token
    return redirect("/")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(
        "https://" + env.get("AUTH0_DOMAIN")
        + "/v2/logout?"
        + urlencode(
            {
                "returnTo": url_for("home", _external=True),
                "client_id": env.get("AUTH0_CLIENT_ID"),
            },
            quote_via=quote_plus,
        )
    )

@app.route('/')
def home():
    return render_template("home.html", session=session.get('user'), pretty=json.dumps(session.get('user'), indent=4))

prompt = """
You are ToursterAI, an AI chatbot who creates full travel plans as an all-in-one tool. Your responses should be a max of 100 words.
Messages will have 2 parts: system and user. Users can request information given to you from the system, such as the date in TEXT (January 1, 2000). DO NOT RESPOND TO SYSTEM MESSAGES UNDER ANY CIRCUMSTANCES.
When the user tells you all about their trip information, you need to recap with a list - do NOT use any formatting (such as using * symbols).
Before the list, you can provide a short 1-sentence comment. MAKE SURE TO TITLE/START YOUR LIST WITH "Trip Info:", THIS IS CRUCIAL FOR THE PROGRAM TO WORK
Each list item should start with "-" and have a new line, and USE YOUR OWN WORDS TO MAKE IT FIT. Format the list properly (make sure there is a space after commas) 
Keep the date format as "January 1, 2000" for example.
After the recap, users may ask follow up questions to confirm that you understand. Make sure you answer their questions about their trip information.
ONLY provide a recap with "Trip Info:" IF THE USER MAKES A CHANGE TO THEIR TRIP. Everytime a change is made, recap their information and ask if its correct.
KEEP YOUR RESPONSES ON TOPIC, AND ONLY TRAVEL RELATED. Do not take user requests if they are not travel related.
Once you have all the information, AND after you have confirmed with something like "Is this correct?", reply with a single "." to mark your info gathering complete.

Example Interaction:
User: What is my budget?
ToursterAI: The budget you have provided me with is ...
User: I see, and what are my dietary restrictions?
ToursterAI: From what I know, your dietary restrictions are ...
User: Can you help me with coding?
ToursterAI: Sorry, I am created to be a travel chatbot. Let's talk about your trip!
ETC...
"""

history = []

genai.configure(api_key=os.getenv('gemini'))

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