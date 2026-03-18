import requests

url = "http://127.0.0.1:8000/login"
data = {
    "username": "admin",
    "password": "password123"
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Content: {response.text}")
except Exception as e:
    print(f"Error: {e}")
