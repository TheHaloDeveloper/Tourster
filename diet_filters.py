import re
import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv
import itertools

load_dotenv()

api_keys = [os.getenv(f'gemini{i}') for i in range(1, 6)]
key_iterator = itertools.cycle(api_keys)

def get_chat_session(api_key):
    genai.configure(api_key=api_key)
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
    return model.start_chat(history=history)

history = [
    {
        "role": "user",
        "parts": [f"""You will be given a list of foods, and your job is to categorize them with the following filters.
                  nut-allergy, gluten-free, vegan, vegetarian, kosher, halal.
                  DO NOT CREATE YOUR OWN FILTERS, ONLY USE WHAT IS ABOVE BASED ON SOME EXAMPLE FOODS.
                  Basically the foods given are some items on a menu of a restaurants, and you need to use these filters to categorize the restaurants.
                  Do not use formatting. Example:
                  
                  Input:
                  "Burger", "Salad", "Veggie Burger", "Beef"
                  
                  Output:
                  ["nut-allergy", "gluten-free", "vegetarian", "kosher", "halal"]
                  """]
    },
    {
        "role": "model",
        "parts": ["Understood."]
    }
]

def get_next_api_key():
    current_key = next(key_iterator)
    print(f"Using API key: {current_key}")  # Debug: Print API key
    return current_key

chat_session = get_chat_session(get_next_api_key())

count = 0
f = open('static/data/restaurant-filters.txt', 'a')
with open('static/data/restaurants.txt', 'r') as file:
    for line in file:
        match = re.search(r'"dishes": \[(.*?)\]', line)
        
        if match:
            dishes = match.group(1)
            if not dishes.strip():  # Debug: Check if dishes is empty
                print("Empty dishes content")
                continue

            response = chat_session.send_message(dishes)
            if not response.text.strip():  # Debug: Check if response is empty
                print("Empty response content")
                continue

            f.write(response.text)
        else:
            print('no dishes found!!')
            
        count += 1
        print(count)
            
f.close()
