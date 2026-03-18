import sys
import os
sys.path.append(os.getcwd())
from app.database import SessionLocal
from app import crud, models, schemas
from datetime import datetime

db = SessionLocal()
try:
    # 1. Create a company
    company = crud.create_company(db, schemas.CompanyCreate(
        name="Bug Corp", type="internal", city="Mumbai", contact_person="Bug", phone="123"
    ))
    
    # 2. Create driver and vehicle
    driver = crud.create_driver(db, schemas.DriverMasterCreate(
        name="Bug Driver", phone="999", license_number="L1", company_id=company.id
    ))
    vehicle = crud.create_vehicle(db, schemas.VehicleMasterCreate(
        number="V1", type="Truck", load_capacity=10, company_id=company.id
    ))
    
    # 3. Create a trip (which will reference driver/vehicle)
    trip = crud.create_trip(db, schemas.TripCreate(
        origin_city="Mumbai", destination_city="Surat", 
        driver_id=driver.id, vehicle_id=vehicle.id, shipment_weight=5
    ))
    
    # 4. Create a THC for the trip
    thc = crud.create_thc(db, schemas.THCCreate(
        trip_id=trip.id, driver_name=driver.name, vehicle_number=vehicle.number,
        origin_city="Mumbai", destination_city="Surat", shipment_weight=5,
        distance_km=280, freight_cost=5000
    ))
    
    print(f"Created Company({company.id}), Driver({driver.id}), Vehicle({vehicle.id}), Trip({trip.id}), THC({thc.id})")
    
    # 5. Try to delete the company
    print("Attempting to delete company...")
    crud.delete_company(db, company.id)
    print("Deletion successful! Cascades worked.")
    
    # 6. Verify they are gone
    assert db.query(models.DriverMaster).filter(models.DriverMaster.id == driver.id).first() is None
    assert db.query(models.VehicleMaster).filter(models.VehicleMaster.id == vehicle.id).first() is None
    assert db.query(models.Trip).filter(models.Trip.id == trip.id).first() is None
    assert db.query(models.THC).filter(models.THC.id == thc.id).first() is None
    print("All records successfully removed via cascade.")

except Exception as e:
    print(f"FAILED: {type(e).__name__}: {str(e)}")
finally:
    db.close()
