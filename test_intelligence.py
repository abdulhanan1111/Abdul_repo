import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from backend.app.services import ai_service
from backend.app import models

# Load .env
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

# Setup DB
SQLALCHEMY_DATABASE_URL = "sqlite:///backend/trip_management.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def test_ai(query):
    print(f"\nUser: {query}")
    response = ai_service.process_query(query, db)
    print(f"AI: {response}")

try:
    # Test 1: Architecture Knowledge
    test_ai("What is the tech stack used in this project?")
    
    # Test 2: Analytical Summary
    test_ai("Give me a high-level summary of our logistics operations and fleet health.")
    
    # Test 3: Strategic Advice
    test_ai("How can I improve my operations based on current data?")
finally:
    db.close()
