import re
import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold, StopCandidateException
from os import environ as env
from dotenv import find_dotenv, load_dotenv
load_dotenv()

pattern = r'"dietaryRestrictions": \[(.*?)\]'

f = open('static/data/restaurant-filters.txt', 'a')
with open('static/data/restaurants.txt', 'r') as file:
    for line in file:
        match = re.search(pattern, line)
        f.write(f"[{match.group(1)}]\n")
        
f.close()