from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.database import get_db
import random

router = APIRouter(prefix="/trips", tags=["trips"])

@router.post("/", response_model=schemas.Trip)
def create_trip(trip: schemas.TripCreate, db: Session = Depends(get_db)):
    # 1. Check Driver & Vehicle availability
    driver = crud.get_driver(db, trip.driver_id)
    vehicle = crud.get_vehicle(db, trip.vehicle_id)
    
    if not driver or not vehicle:
         raise HTTPException(status_code=400, detail="Driver or Vehicle not found")
         
    if driver.status.availability_status != "available" or driver.status.current_city.strip().lower() != trip.origin_city.lower():
         raise HTTPException(status_code=400, detail=f"Driver not available or not in {trip.origin_city}")
         
    if vehicle.status.availability_status != "available" or vehicle.status.current_city.strip().lower() != trip.origin_city.lower():
         raise HTTPException(status_code=400, detail=f"Vehicle not available or not in {trip.origin_city}")
         
    # 2. Check or create distance
    distance_record = crud.get_distance(db, trip.origin_city, trip.destination_city)
    if not distance_record:
         distance = 150.0 + random.randint(0, 500) # Mock distance
         crud.create_distance(db, schemas.DistanceCreate(origin_city=trip.origin_city, destination_city=trip.destination_city, distance_km=distance))
    else:
         distance = distance_record.distance_km
         
    # 3. Create Trip
    db_trip = crud.create_trip(db=db, trip=trip)
    
    # 4. Generate THC
    # New Formula: (Weight in tons) * distance * rate per ton-km + base charge
    freight_cost = (trip.shipment_weight / 1000.0) * distance * 2.5 + 500
    thc_data = schemas.THCCreate(
        trip_id=db_trip.id,
        driver_name=driver.name,
        vehicle_number=vehicle.number,
        origin_city=trip.origin_city,
        destination_city=trip.destination_city,
        shipment_weight=trip.shipment_weight,
        distance_km=distance,
        freight_cost=freight_cost
    )
    crud.create_thc(db, thc_data)
    
    db.refresh(db_trip) # retrieve the automatically nested THC from DB
    return db_trip

@router.get("/", response_model=schemas.PaginatedTrips)
def read_trips(skip: int = 0, limit: int = 100, status: str = None, search: str = None, db: Session = Depends(get_db)):
    return crud.get_trips(db, skip=skip, limit=limit, status=status, search=search)

@router.post("/{trip_id}/status", response_model=schemas.Trip)
def update_trip_status(trip_id: int, status: str, db: Session = Depends(get_db)):
    trip = crud.update_trip_status(db, trip_id, status)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.get("/thc", response_model=schemas.PaginatedTHCs)
def read_thcs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_thcs(db, skip=skip, limit=limit)
    
@router.get("/distances", response_model=List[schemas.Distance])
def read_distances(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_distances(db, skip=skip, limit=limit)
