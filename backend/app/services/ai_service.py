import os
import json
try:
    from dotenv import load_dotenv
    # Load from the backend directory specifically
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
    load_dotenv(env_path)
except ImportError:
    pass
from google import genai
from google.genai import types
from sqlalchemy.orm import Session
from app import crud, models
from typing import List, Optional

class LogisticsTools:
    """Encapsulates database tools for the AI Assistant."""
    
    def __init__(self, db: Session):
        self.db = db

    def get_drivers_in_city(self, city: str) -> str:
        """Returns a JSON string of drivers available in a specific city."""
        result = crud.get_drivers(self.db, skip=0, limit=1000)
        drivers = result.get("items", []) if isinstance(result, dict) else result
        available = []
        for d in drivers:
            if d.status and d.status.availability_status == "available" and d.status.current_city.strip().lower() == city.lower():
                available.append({"name": d.name, "id": d.id, "phone": d.phone})
        return json.dumps(available)

    def get_trips_by_status(self, status: str) -> str:
        """Returns a JSON string of trips currently matching the specified status (e.g., 'In Transit', 'Completed')."""
        result = crud.get_trips(self.db, skip=0, limit=1000)
        trips = result.get("items", []) if isinstance(result, dict) else result
        matching = []
        for t in trips:
            if t.status.lower() == status.lower():
                matching.append({
                    "trip_id": t.id,
                    "origin": t.origin_city,
                    "destination": t.destination_city, 
                    "vehicle": t.vehicle.number if t.vehicle else "N/A", 
                    "driver": t.driver.name if t.driver else "N/A"
                })
        return json.dumps(matching)

    def get_vehicles_in_city(self, city: str) -> str:
        """Returns a JSON string of vehicles available in a specific city."""
        result = crud.get_vehicles(self.db, skip=0, limit=1000)
        vehicles = result.get("items", []) if isinstance(result, dict) else result
        available = []
        for v in vehicles:
            if v.status and v.status.availability_status == "available" and v.status.current_city.strip().lower() == city.lower():
                available.append({"number": v.number, "type": v.type, "id": v.id})
        return json.dumps(available)

    def get_route_distance(self, origin: str, destination: str) -> str:
        """Gets the driving distance between two cities from the database."""
        dist = self.db.query(models.Distance).filter(
            models.Distance.origin_city.ilike(origin),
            models.Distance.destination_city.ilike(destination)
        ).first()
        if dist:
            return f"{dist.distance_km} km"
        return "Distance not found."

    def get_total_drivers(self) -> str:
        """Returns the total number of drivers registered in the system."""
        return str(self.db.query(models.DriverMaster).count())

    def get_total_vehicles(self) -> str:
        """Returns the total number of vehicles registered in the system."""
        return str(self.db.query(models.VehicleMaster).count())

    def get_total_trips(self) -> str:
        """Returns the total number of trips created in the system."""
        return str(self.db.query(models.Trip).count())

    def get_driver_status(self, name: str) -> str:
        """Returns the current status (availability, location) of a specific driver."""
        driver = self.db.query(models.DriverMaster).filter(models.DriverMaster.name.ilike(f"%{name}%")).first()
        if not driver:
            return "Driver not found."
        status = driver.status
        return json.dumps({
            "name": driver.name,
            "status": status.availability_status if status else "Unknown",
            "current_city": status.current_city if status else "Unknown"
        })

    def get_vehicle_status(self, number: str) -> str:
        """Returns the current status (availability, location) of a specific vehicle."""
        vehicle = self.db.query(models.VehicleMaster).filter(models.VehicleMaster.number.ilike(f"%{number}%")).first()
        if not vehicle:
            return "Vehicle not found."
        status = vehicle.status
        return json.dumps({
            "number": vehicle.number,
            "status": status.availability_status if status else "Unknown",
            "current_city": status.current_city if status else "Unknown"
        })

    def get_trips_by_driver(self, name: str) -> str:
        """Returns a list of trips assigned to a driver matching the given name."""
        driver = self.db.query(models.DriverMaster).filter(models.DriverMaster.name.ilike(f"%{name}%")).first()
        if not driver:
            return "Driver not found."
        trips = self.db.query(models.Trip).filter(models.Trip.driver_id == driver.id).all()
        return json.dumps([{"id": t.id, "origin": t.origin_city, "destination": t.destination_city, "status": t.status} for t in trips])

    def get_trips_by_vehicle(self, number: str) -> str:
        """Returns a list of trips assigned to a vehicle matching the given number."""
        vehicle = self.db.query(models.VehicleMaster).filter(models.VehicleMaster.number.ilike(f"%{number}%")).first()
        if not vehicle:
            return "Vehicle not found."
        trips = self.db.query(models.Trip).filter(models.Trip.vehicle_id == vehicle.id).all()
        return json.dumps([{"id": t.id, "origin": t.origin_city, "destination": t.destination_city, "status": t.status} for t in trips])

    def get_company_info(self, name: str) -> str:
        """Returns contact details for a specific company."""
        company = self.db.query(models.Company).filter(models.Company.name.ilike(f"%{name}%")).first()
        if not company:
            return "Company not found."
        return json.dumps({
            "name": company.name,
            "type": company.type,
            "contact_person": company.contact_person,
            "phone": company.phone,
            "city": company.city
        })

    def get_drivers_by_company(self, company_name: str) -> str:
        """Returns a list of drivers working for a specific company."""
        company = self.db.query(models.Company).filter(models.Company.name.ilike(f"%{company_name}%")).first()
        if not company:
            return "Company not found."
        drivers = self.db.query(models.DriverMaster).filter(models.DriverMaster.company_id == company.id).all()
        return json.dumps([d.name for d in drivers])

    def get_vehicles_by_type(self, vehicle_type: str) -> str:
        """Returns a list of vehicles of a specific type (e.g., Truck, Van)."""
        vehicles = self.db.query(models.VehicleMaster).filter(models.VehicleMaster.type.ilike(f"%{vehicle_type}%")).all()
        return json.dumps([v.number for v in vehicles])

    def get_recent_trips(self, limit: int = 5) -> str:
        """Returns the most recent trips (default 5)."""
        trips = self.db.query(models.Trip).order_by(models.Trip.created_at.desc()).limit(limit).all()
        return json.dumps([{
            "id": t.id,
            "origin": t.origin_city,
            "destination": t.destination_city,
            "status": t.status,
            "date": str(t.created_at)
        } for t in trips])

    def get_trip_details(self, trip_id: int) -> str:
        """Returns full details for a specific trip ID."""
        trip = self.db.query(models.Trip).filter(models.Trip.id == trip_id).first()
        if not trip:
            return "Trip not found."
        return json.dumps({
            "id": trip.id,
            "origin": trip.origin_city,
            "destination": trip.destination_city,
            "weight": trip.shipment_weight,
            "status": trip.status,
            "driver": trip.driver.name if trip.driver else "N/A",
            "vehicle": trip.vehicle.number if trip.vehicle else "N/A"
        })

    def get_total_revenue(self) -> str:
        """Calculates and returns the total revenue from all generated THCs."""
        thcs = self.db.query(models.THC).all()
        total = sum(t.freight_cost for t in thcs if t.freight_cost)
        return f"{total} INR"

    def get_average_shipment_weight(self) -> str:
        """Calculates the average shipment weight of all trips."""
        trips = self.db.query(models.Trip).all()
        if not trips:
            return "0"
        avg = sum(t.shipment_weight for t in trips if t.shipment_weight) / len(trips)
        return f"{avg:.2f} kg"

    def get_pending_trips_count(self) -> str:
        """Returns the count of trips that are not yet completed."""
        count = self.db.query(models.Trip).filter(models.Trip.status != "Completed").count()
        return str(count)

    def get_city_distances(self, city: str) -> str:
        """Returns a list of available destinations and distances from a specific city."""
        dists = self.db.query(models.Distance).filter(models.Distance.origin_city.ilike(city)).all()
        return json.dumps({d.destination_city: f"{d.distance_km} km" for d in dists})

    def get_project_knowledge(self) -> str:
        """
        Returns high-level technical knowledge about the project's architecture, 
        tech stack, and workflows. Use this to answer meta-questions about the app itself.
        """
        doc_path = os.path.join(os.path.dirname(__file__), "docs", "architecture_overview.md")
        try:
            with open(doc_path, "r") as f:
                return f.read()
        except:
            return "Project uses FastAPI (Backend), React (Frontend), and SQLite (Database). It manages Companies, Drivers, Vehicles, Trips, and THCs."

    def get_logistics_summary(self) -> str:
        """Provides a high-level analytical summary of the entire logistics operation."""
        drivers_count = self.db.query(models.DriverMaster).count()
        vehicles_count = self.db.query(models.VehicleMaster).count()
        trips_count = self.db.query(models.Trip).count()
        revenue = self.get_total_revenue()
        pending = self.get_pending_trips_count()
        
        return json.dumps({
            "total_drivers": drivers_count,
            "total_vehicles": vehicles_count,
            "total_trips": trips_count,
            "total_revenue": revenue,
            "pending_trips": pending,
            "system_status": "All systems operational",
            "fleet_utilization": f"{(int(pending)/int(vehicles_count)*100 if vehicles_count else 0):.1f}%"
        })


def process_query(query: str, db: Session, history: Optional[List] = None):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Warning: GEMINI_API_KEY environment variable not set. Please check your .env file."
    
    client = genai.Client(api_key=api_key)
    
    # Initialize tools with database session
    tools = LogisticsTools(db)

    # 2. Build the tool configuration
    config = types.GenerateContentConfig(
        tools=[
            tools.get_company_info, tools.get_drivers_by_company, 
            tools.get_vehicles_by_type, tools.get_recent_trips, 
            tools.get_trip_details, tools.get_total_revenue,
            tools.get_average_shipment_weight, tools.get_pending_trips_count, 
            tools.get_city_distances, tools.get_project_knowledge, 
            tools.get_logistics_summary, tools.get_drivers_in_city,
            tools.get_trips_by_status, tools.get_vehicles_in_city,
            tools.get_route_distance, tools.get_total_drivers,
            tools.get_total_vehicles, tools.get_total_trips,
            tools.get_driver_status, tools.get_vehicle_status,
            tools.get_trips_by_driver, tools.get_trips_by_vehicle
        ],
        temperature=0.2,
        system_instruction=(
            "You are the 'Lead Systems & Logistics Architect' for the Trip & THC Management System. "
            "You are not a simple bot; you are a highly intelligent consultant who understands both the "
            "technical codebase and the business logic of logistics.\n\n"
            
            "KNOWLEDGE GUIDELINES:\n"
            "1. Use 'get_project_knowledge' to answer questions about the app's tech stack, architecture, or features.\n"
            "2. Use 'get_logistics_summary' to provide high-level business snapshots.\n"
            "3. When asked for advice, combine data from multiple tools to provide strategic suggestions (e.g., suggesting vehicle distribution based on pending trips).\n"
            "4. Be creative, professional, and proactive. If you see an issue in the data (like low fleet utilization), mention it.\n"
            "5. Always be polite and helpful. If you don't have enough data, ask clarifying questions."
        )
    )
    
    # 3. Format history for Gemini
    formatted_history = []
    if history:
        for msg in history:
            role = "user" if msg.role == "user" else "model"
            formatted_history.append(types.Content(role=role, parts=[types.Part(text=msg.text)]))
    
    # 4. Create a chat session with the client 
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    print(f"DEBUG: Using model '{model_name}' (API Key prefix: {api_key[:8]})")
    chat = client.chats.create(model=model_name, config=config, history=formatted_history)
    
    try:
        response = chat.send_message(query)
        return response.text
    except Exception as e:
        return f"Error interacting with AI: {str(e)}"
