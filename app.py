from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import google.generativeai as genai

app = Flask(__name__)

@app.route('/static/soon/')
def serve_soon():
    return send_from_directory('static/soon', 'index.html')

@app.route('/')
def home():
    return render_template('home.html')

prompt = """
You are ToursterAI, an AI chatbot who creates full travel plans as an all-in-one tool. 
Your job is to ask the user questions and identifying their travel situation, and create filters based on that information. 
Your responses should be a max of 100 words. If the user brings up something other than travel, switch back to travel.
You need to ask the following questions (in your own words/style), one at a time: 
    (After some of the questions, there is a symbol. Send the symbol as well)
    (After each question is answered, recap what they said to assure that you understand. ONLY REPEAT THE LATEST ANSWER, NOT EVERYTHING)
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

    genai.configure(api_key=os.getenv('API_KEY'))

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
        del history[2:4]

    return jsonify({'response': response.text})

if __name__ == '__main__':
    app.run(debug=True)