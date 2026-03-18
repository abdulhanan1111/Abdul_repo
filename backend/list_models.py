import os
import json
from dotenv import load_dotenv
from google import genai

# Load env from the backend directory
load_dotenv(os.path.join(os.getcwd(), ".env"))
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API Key not found in .env")
else:
    print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")
    client = genai.Client(api_key=api_key)
    print("Listing available models:")
    try:
        models = list(client.models.list())
        for model in models:
            print(f" - {model.name} (supports: {model.supported_actions})")
    except Exception as e:
        print(f"Error listing models: {e}")
