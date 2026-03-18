import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from sqlalchemy import create_mock_engine
from sqlalchemy.orm import sessionmaker
from app.database import SessionLocal
from app import crud, models, schemas

def test_pagination():
    db = SessionLocal()
    try:
        print("Testing Drivers Pagination...")
        res = crud.get_drivers(db, skip=0, limit=2)
        print(f"Total Drivers: {res['total']}, Items in page: {len(res['items'])}")
        
        print("\nTesting Vehicles Pagination...")
        res = crud.get_vehicles(db, skip=0, limit=2)
        print(f"Total Vehicles: {res['total']}, Items in page: {len(res['items'])}")
        
        print("\nTesting Companies Pagination...")
        res = crud.get_companies(db, skip=0, limit=2)
        print(f"Total Companies: {res['total']}, Items in page: {len(res['items'])}")
        
        print("\nTesting Trips Pagination...")
        res = crud.get_trips(db, skip=0, limit=2)
        print(f"Total Trips: {res['total']}, Items in page: {len(res['items'])}")

        print("\nTesting Drivers Filtering (Status: available)...")
        res = crud.get_drivers(db, skip=0, limit=10, status='available')
        print(f"Available Drivers Total: {res['total']}")
        for d in res['items']:
            print(f" - Driver: {d.name}, Status: {d.status.availability_status}")

    finally:
        db.close()

if __name__ == "__main__":
    test_pagination()
