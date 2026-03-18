from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

# --- Company ---
def get_company(db: Session, company_id: int):
    return db.query(models.Company).filter(models.Company.id == company_id).first()

def get_companies(db: Session, skip: int = 0, limit: int = 100):
    query = db.query(models.Company)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

def update_company(db: Session, company_id: int, company: schemas.CompanyUpdate):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if db_company:
        for key, value in company.model_dump(exclude_unset=True).items():
            setattr(db_company, key, value)
        db.commit()
        db.refresh(db_company)
    return db_company

def delete_company(db: Session, company_id: int):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if db_company:
        db.delete(db_company)
        db.commit()
    return db_company

# --- Driver ---
def get_driver(db: Session, driver_id: int):
    return db.query(models.DriverMaster).filter(models.DriverMaster.id == driver_id).first()

def get_drivers(db: Session, skip: int = 0, limit: int = 100, status: str = None, city: str = None):
    query = db.query(models.DriverMaster).join(models.DriverStatus)
    if status:
        query = query.filter(models.DriverStatus.availability_status == status)
    if city:
        query = query.filter(models.DriverStatus.current_city.ilike(f"%{city}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_driver(db: Session, driver: schemas.DriverMasterCreate):
    db_driver = models.DriverMaster(**driver.model_dump())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    
    # Create initial status - fetch company to get default city if possible
    company = get_company(db, driver.company_id)
    initial_city = company.city if company else "Unknown"
    
    db_status = models.DriverStatus(
        driver_id=db_driver.id, 
        current_city=initial_city, 
        availability_status="available"
    )
    db.add(db_status)
    db.commit()
    return db_driver

def update_driver(db: Session, driver_id: int, driver: schemas.DriverMasterUpdate):
    db_driver = db.query(models.DriverMaster).filter(models.DriverMaster.id == driver_id).first()
    if db_driver:
        for key, value in driver.model_dump(exclude_unset=True).items():
            setattr(db_driver, key, value)
        db.commit()
        db.refresh(db_driver)
    return db_driver

def update_driver_status(db: Session, driver_id: int, status_update: schemas.DriverStatusUpdate):
    db_status = db.query(models.DriverStatus).filter(models.DriverStatus.driver_id == driver_id).first()
    if db_status:
        update_data = status_update.model_dump(exclude_unset=True)
        # handle explicitly setting current_trip_id to None
        if "current_trip_id" in update_data and update_data["current_trip_id"] is None:
             db_status.current_trip_id = None
             
        for key, value in update_data.items():
            if value is not None or key == "current_trip_id":
                setattr(db_status, key, value)
        
        db_status.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(db_status)
    return db_status

def delete_driver(db: Session, driver_id: int):
    db_driver = db.query(models.DriverMaster).filter(models.DriverMaster.id == driver_id).first()
    if db_driver:
        # Also delete associated status record
        db_status = db.query(models.DriverStatus).filter(models.DriverStatus.driver_id == driver_id).first()
        if db_status:
            db.delete(db_status)
        db.delete(db_driver)
        db.commit()
    return db_driver

# --- Vehicle ---
def get_vehicle(db: Session, vehicle_id: int):
    return db.query(models.VehicleMaster).filter(models.VehicleMaster.id == vehicle_id).first()

def get_vehicles(db: Session, skip: int = 0, limit: int = 100, status: str = None, city: str = None):
    query = db.query(models.VehicleMaster).join(models.VehicleStatus)
    if status:
        query = query.filter(models.VehicleStatus.availability_status == status)
    if city:
        query = query.filter(models.VehicleStatus.current_city.ilike(f"%{city}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_vehicle(db: Session, vehicle: schemas.VehicleMasterCreate):
    db_vehicle = models.VehicleMaster(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    
    # Create initial status
    company = get_company(db, vehicle.company_id)
    initial_city = company.city if company else "Unknown"
    
    db_status = models.VehicleStatus(
        vehicle_id=db_vehicle.id, 
        current_city=initial_city, 
        availability_status="available"
    )
    db.add(db_status)
    db.commit()
    return db_vehicle

def update_vehicle(db: Session, vehicle_id: int, vehicle: schemas.VehicleMasterUpdate):
    db_vehicle = db.query(models.VehicleMaster).filter(models.VehicleMaster.id == vehicle_id).first()
    if db_vehicle:
        for key, value in vehicle.model_dump(exclude_unset=True).items():
            setattr(db_vehicle, key, value)
        db.commit()
        db.refresh(db_vehicle)
    return db_vehicle

def update_vehicle_status(db: Session, vehicle_id: int, status_update: schemas.VehicleStatusUpdate):
    db_status = db.query(models.VehicleStatus).filter(models.VehicleStatus.vehicle_id == vehicle_id).first()
    if db_status:
        update_data = status_update.model_dump(exclude_unset=True)
        if "current_trip_id" in update_data and update_data["current_trip_id"] is None:
             db_status.current_trip_id = None
             
        for key, value in update_data.items():
            if value is not None or key == "current_trip_id":
                setattr(db_status, key, value)
                
        db_status.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(db_status)
    return db_status

def delete_vehicle(db: Session, vehicle_id: int):
    db_vehicle = db.query(models.VehicleMaster).filter(models.VehicleMaster.id == vehicle_id).first()
    if db_vehicle:
        db_status = db.query(models.VehicleStatus).filter(models.VehicleStatus.vehicle_id == vehicle_id).first()
        if db_status:
            db.delete(db_status)
        db.delete(db_vehicle)
        db.commit()
    return db_vehicle

# --- Trip ---
def get_trip(db: Session, trip_id: int):
    return db.query(models.Trip).filter(models.Trip.id == trip_id).first()

def get_trips(db: Session, skip: int = 0, limit: int = 100, status: str = None, search: str = None):
    query = db.query(models.Trip)
    if status:
        query = query.filter(models.Trip.status == status)
    if search:
        query = query.filter(
            (models.Trip.origin_city.ilike(f"%{search}%")) |
            (models.Trip.destination_city.ilike(f"%{search}%"))
        )
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_trip(db: Session, trip: schemas.TripCreate):
    db_trip = models.Trip(**trip.model_dump(), status="Created")
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    
    # Update Driver & Vehicle Status
    update_driver_status(db, db_trip.driver_id, schemas.DriverStatusUpdate(
        current_city=trip.origin_city, 
        availability_status="on_trip", 
        current_trip_id=db_trip.id
    ))
    update_vehicle_status(db, db_trip.vehicle_id, schemas.VehicleStatusUpdate(
        current_city=trip.origin_city, 
        availability_status="on_trip", 
        current_trip_id=db_trip.id
    ))
    
    return db_trip

def update_trip_status(db: Session, trip_id: int, status: str):
    db_trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if db_trip:
        db_trip.status = status
        
        if status == "In Transit" and not db_trip.trip_start_time:
            db_trip.trip_start_time = datetime.utcnow()
            
        if status == "Completed":
            # Update driver & vehicle dynamically
            update_driver_status(db, db_trip.driver_id, schemas.DriverStatusUpdate(
                current_city=db_trip.destination_city, 
                availability_status="available", 
                current_trip_id=None
            ))
            update_vehicle_status(db, db_trip.vehicle_id, schemas.VehicleStatusUpdate(
                current_city=db_trip.destination_city, 
                availability_status="available", 
                current_trip_id=None
            ))
            
        db.commit()
        db.refresh(db_trip)
    return db_trip
    
# --- Distance ---
def get_distance(db: Session, origin: str, dest: str):
    return db.query(models.Distance).filter(
        models.Distance.origin_city == origin,
        models.Distance.destination_city == dest
    ).first()

def get_distances(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Distance).offset(skip).limit(limit).all()

def create_distance(db: Session, distance: schemas.DistanceCreate):
    db_dist = models.Distance(**distance.model_dump())
    db.add(db_dist)
    db.commit()
    db.refresh(db_dist)
    return db_dist

# --- THC ---
def get_thcs(db: Session, skip: int = 0, limit: int = 100):
    query = db.query(models.THC)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

def create_thc(db: Session, thc: schemas.THCCreate):
    db_thc = models.THC(**thc.model_dump())
    db.add(db_thc)
    db.commit()
    db.refresh(db_thc)
    return db_thc
