from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/drivers", tags=["drivers"])

@router.post("/", response_model=schemas.DriverMaster)
def create_driver(driver: schemas.DriverMasterCreate, db: Session = Depends(get_db)):
    return crud.create_driver(db=db, driver=driver)

@router.put("/{driver_id}", response_model=schemas.DriverMaster)
def update_driver(driver_id: int, driver: schemas.DriverMasterUpdate, db: Session = Depends(get_db)):
    db_driver = crud.update_driver(db=db, driver_id=driver_id, driver=driver)
    if db_driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return db_driver

@router.get("/", response_model=schemas.PaginatedDrivers)
def read_drivers(skip: int = 0, limit: int = 100, status: str = None, city: str = None, db: Session = Depends(get_db)):
    return crud.get_drivers(db, skip=skip, limit=limit, status=status, city=city)

@router.get("/{driver_id}", response_model=schemas.DriverMaster)
def read_driver(driver_id: int, db: Session = Depends(get_db)):
    db_driver = crud.get_driver(db, driver_id=driver_id)
    if db_driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return db_driver

@router.post("/{driver_id}/status", response_model=schemas.DriverStatus)
def update_driver_status(driver_id: int, status_update: schemas.DriverStatusUpdate, db: Session = Depends(get_db)):
    return crud.update_driver_status(db=db, driver_id=driver_id, status_update=status_update)

@router.delete("/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    db_driver = crud.delete_driver(db, driver_id=driver_id)
    if not db_driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return {"message": "Driver deleted successfully"}
