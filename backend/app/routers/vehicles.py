from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.post("/", response_model=schemas.VehicleMaster)
def create_vehicle(vehicle: schemas.VehicleMasterCreate, db: Session = Depends(get_db)):
    return crud.create_vehicle(db=db, vehicle=vehicle)

@router.put("/{vehicle_id}", response_model=schemas.VehicleMaster)
def update_vehicle(vehicle_id: int, vehicle: schemas.VehicleMasterUpdate, db: Session = Depends(get_db)):
    db_vehicle = crud.update_vehicle(db=db, vehicle_id=vehicle_id, vehicle=vehicle)
    if db_vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return db_vehicle

@router.get("/", response_model=schemas.PaginatedVehicles)
def read_vehicles(skip: int = 0, limit: int = 100, status: str = None, city: str = None, db: Session = Depends(get_db)):
    return crud.get_vehicles(db, skip=skip, limit=limit, status=status, city=city)

@router.get("/{vehicle_id}", response_model=schemas.VehicleMaster)
def read_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    db_vehicle = crud.get_vehicle(db, vehicle_id=vehicle_id)
    if db_vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return db_vehicle

@router.post("/{vehicle_id}/status", response_model=schemas.VehicleStatus)
def update_vehicle_status(vehicle_id: int, status_update: schemas.VehicleStatusUpdate, db: Session = Depends(get_db)):
    return crud.update_vehicle_status(db=db, vehicle_id=vehicle_id, status_update=status_update)

@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    db_vehicle = crud.delete_vehicle(db, vehicle_id=vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted successfully"}
