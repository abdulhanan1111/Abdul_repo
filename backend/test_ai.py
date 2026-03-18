import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

if not api_key:
    print("API Key not found")
else:
    print(f"Testing Gemini API with model: {model_name}")
    client = genai.Client(api_key=api_key)
    try:
        # Simple test message
        response = client.models.generate_content(
            model=model_name,
            contents="Hello, just a test. Respond with 'OK'."
        )
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
