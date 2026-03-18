from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import datetime
from .database import Base

# Helper for non-deprecated UTC time that is still compatible with SQLite naive storage
def utcnow():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # internal or partner
    contact_person = Column(String)
    phone = Column(String)
    city = Column(String)

    drivers = relationship("DriverMaster", back_populates="company", cascade="all, delete-orphan")
    vehicles = relationship("VehicleMaster", back_populates="company", cascade="all, delete-orphan")

class DriverMaster(Base):
    __tablename__ = "driver_master"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, unique=True, index=True)
    license_number = Column(String, unique=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime, default=utcnow)

    company = relationship("Company", back_populates="drivers")
    status = relationship("DriverStatus", back_populates="driver", uselist=False, cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="driver", cascade="all, delete-orphan")

class DriverStatus(Base):
    __tablename__ = "driver_status"

    driver_id = Column(Integer, ForeignKey("driver_master.id"), primary_key=True)
    current_city = Column(String)
    availability_status = Column(String) # available, on_trip, inactive
    current_trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    last_updated = Column(DateTime, default=utcnow, onupdate=utcnow)

    driver = relationship("DriverMaster", back_populates="status")
    current_trip = relationship("Trip", foreign_keys=[current_trip_id])

class VehicleMaster(Base):
    __tablename__ = "vehicle_master"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True)
    type = Column(String)
    load_capacity = Column(Float)
    company_id = Column(Integer, ForeignKey("companies.id"))
    created_at = Column(DateTime, default=utcnow)

    company = relationship("Company", back_populates="vehicles")
    status = relationship("VehicleStatus", back_populates="vehicle", uselist=False, cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="vehicle", cascade="all, delete-orphan")

class VehicleStatus(Base):
    __tablename__ = "vehicle_status"

    vehicle_id = Column(Integer, ForeignKey("vehicle_master.id"), primary_key=True)
    current_city = Column(String)
    availability_status = Column(String) # available, on_trip, maintenance
    current_trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    last_updated = Column(DateTime, default=utcnow, onupdate=utcnow)

    vehicle = relationship("VehicleMaster", back_populates="status")
    current_trip = relationship("Trip", foreign_keys=[current_trip_id])

class Distance(Base):
    __tablename__ = "distances"

    id = Column(Integer, primary_key=True, index=True)
    origin_city = Column(String, index=True)
    destination_city = Column(String, index=True)
    distance_km = Column(Float)

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    origin_city = Column(String)
    destination_city = Column(String)
    driver_id = Column(Integer, ForeignKey("driver_master.id", ondelete="CASCADE"))
    vehicle_id = Column(Integer, ForeignKey("vehicle_master.id", ondelete="CASCADE"))
    shipment_weight = Column(Float)
    trip_start_time = Column(DateTime, nullable=True)
    pickup_time = Column(DateTime, nullable=True)
    delivery_time = Column(DateTime, nullable=True)
    status = Column(String) # Created, Pickup Confirmed, In Transit, Delivered, Completed
    created_at = Column(DateTime, default=utcnow)

    driver = relationship("DriverMaster", back_populates="trips")
    vehicle = relationship("VehicleMaster", back_populates="trips")
    thc = relationship("THC", back_populates="trip", uselist=False, cascade="all, delete-orphan")

class THC(Base):
    __tablename__ = "thc"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"))
    driver_name = Column(String)
    vehicle_number = Column(String)
    origin_city = Column(String)
    destination_city = Column(String)
    shipment_weight = Column(Float)
    distance_km = Column(Float)
    freight_cost = Column(Float)
    generated_at = Column(DateTime, default=utcnow)

    trip = relationship("Trip", back_populates="thc")
