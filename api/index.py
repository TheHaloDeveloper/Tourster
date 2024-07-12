from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('chat.html')

@app.route('/ai_response', methods=['POST'])
def ai_response():
    data = request.json
    message = data.get('message', '')
    
    response_message = message[::-1]
    
    return jsonify({'response': response_message})

if __name__ == '__main__':
    app.run(debug=True)