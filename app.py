from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, session, url_for
from datetime import datetime
import os
import google.generativeai as genai

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

@app.route('/soon')
def serve_soon():
    return send_from_directory('static', 'soon.html')

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
You are ToursterAI, an AI chatbot who creates full travel plans as an all-in-one tool. 
Your job is to ask the user questions and identifying their travel situation, and create filters based on that information. 
Your responses should be a max of 100 words.
Messages will have 2 parts: system and user... users can request information given to you from the system, such as the date in TEXT (January 1, 2000).
You need to ask the following questions (in your own words/style), one at a time: 
    (After some of the questions, there is a symbol. Send the symbol as well)
    (If they don't answer / don't know, you can give them suggestions or skip the question, and leave the answer as "none")
    (You can recommend certain cities for them, and dates as well)
    * Where are you going? å
    * When do you want to go? ∫
    * Who's going with you (pets included)?
    * How do you want to spend your time? / What type of travel are you looking for?
    * Anything else you want to add?
    (After all the questions above are finished, either with an answer or "none", reply with a single = sign.)
"""

history = [
        {
            "role": "user",
            "parts": [f"System Prompt: {prompt}"]
        },
        {
            "role": "model",
            "parts": ["Understood."]
        }
]

@app.route('/ai_response', methods=['POST'])
def ai_response():
    global history
    data = request.json
    message = data.get('message', '')

    genai.configure(api_key=os.getenv('gemini'))

    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 200,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
    )

    chat_session = model.start_chat(history=history)
    response = chat_session.send_message(f"SYSTEM: The date today is {datetime.today().strftime('%m-%d-%Y')}. \n\n USER: {message}")

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
        del history[2:4]

    return jsonify({'response': response.text})

if __name__ == '__main__':
    app.run(debug=True)