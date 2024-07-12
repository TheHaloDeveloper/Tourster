from flask import Flask, render_template, request, jsonify
import os
import google.generativeai as genai

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('chat.html')

apiKey = "AIzaSyAGzYp0VuOWfs44r1sRHOn3y55H7dv4jIs"

@app.route('/ai_response', methods=['POST'])
def ai_response():
    data = request.json
    message = data.get('message', '')

    # genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    genai.configure(api_key=apiKey)

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

    history = [
        {
            "role": "user",
            "parts": ["System Prompt: You are ToursterAI, an AI chatbot who creates full travel plans as an all-in-one tool. Your job is to ask the user questions and identifying their travel situation, and create filters based on that information. Your responses should be a max of 100 words. YOU WILL NOT GO OFF TRACK, AND YOUR RESPONSES WILL BE STRICTLY RESTRICTED TO TRAVEL."]
        },
        {
            "role": "model",
            "parts": ["Understood."]
        }
    ]

    chat_session = model.start_chat(history=history)
    response = chat_session.send_message(message)
    
    return jsonify({'response': response.text})

if __name__ == '__main__':
    app.run(debug=True)