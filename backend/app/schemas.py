from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Admin / Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AdminCreate(BaseModel):
    username: str
    password: str

class Admin(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


# --- Company ---
class CompanyBase(BaseModel):
    name: str
    type: str
    contact_person: str
    phone: str
    city: str

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    pass

class Company(CompanyBase):
    id: int

    class Config:
        from_attributes = True

# --- Driver ---
class DriverStatusBase(BaseModel):
    current_city: str
    availability_status: str
    current_trip_id: Optional[int] = None

class DriverStatusUpdate(DriverStatusBase):
    pass

class DriverStatus(DriverStatusBase):
    driver_id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class DriverMasterBase(BaseModel):
    name: str
    phone: str
    license_number: str
    company_id: int

class DriverMasterCreate(DriverMasterBase):
    pass

class DriverMasterUpdate(DriverMasterBase):
    pass

class DriverMaster(DriverMasterBase):
    id: int
    created_at: datetime
    status: Optional[DriverStatus] = None
    company: Optional[Company] = None

    class Config:
        from_attributes = True

# --- Vehicle ---
class VehicleStatusBase(BaseModel):
    current_city: str
    availability_status: str
    current_trip_id: Optional[int] = None

class VehicleStatusUpdate(VehicleStatusBase):
    pass

class VehicleStatus(VehicleStatusBase):
    vehicle_id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class VehicleMasterBase(BaseModel):
    number: str
    type: str
    load_capacity: float
    company_id: int

class VehicleMasterCreate(VehicleMasterBase):
    pass

class VehicleMasterUpdate(VehicleMasterBase):
    pass

class VehicleMaster(VehicleMasterBase):
    id: int
    created_at: datetime
    status: Optional[VehicleStatus] = None
    company: Optional[Company] = None

    class Config:
        from_attributes = True

# --- Distance ---
class DistanceBase(BaseModel):
    origin_city: str
    destination_city: str
    distance_km: float

class DistanceCreate(DistanceBase):
    pass

class Distance(DistanceBase):
    id: int

    class Config:
        from_attributes = True

# --- THC ---
class THCBase(BaseModel):
    driver_name: str
    vehicle_number: str
    origin_city: str
    destination_city: str
    shipment_weight: float
    distance_km: float
    freight_cost: float

class THCCreate(THCBase):
    trip_id: int

class THC(THCBase):
    id: int
    trip_id: int
    generated_at: datetime

    class Config:
        from_attributes = True

# --- Trip ---
class TripBase(BaseModel):
    origin_city: str
    destination_city: str
    driver_id: int
    vehicle_id: int
    shipment_weight: float
    pickup_time: Optional[datetime] = None
    delivery_time: Optional[datetime] = None

class TripCreate(TripBase):
    pass

class Trip(TripBase):
    id: int
    trip_start_time: Optional[datetime] = None
    status: str
    created_at: datetime
    thc: Optional[THC] = None
    driver: Optional[DriverMaster] = None
    vehicle: Optional[VehicleMaster] = None

    class Config:
        from_attributes = True

# --- AI Assistant ---
class ChatMessage(BaseModel):
    role: str # 'user' or 'ai'
    text: str

class PaginatedAdmins(BaseModel):
    total: int
    items: List[Admin]

class PaginatedCompanies(BaseModel):
    total: int
    items: List[Company]

class PaginatedDrivers(BaseModel):
    total: int
    items: List[DriverMaster]

class PaginatedVehicles(BaseModel):
    total: int
    items: List[VehicleMaster]

class PaginatedTrips(BaseModel):
    total: int
    items: List[Trip]

class PaginatedTHCs(BaseModel):
    total: int
    items: List[THC]
