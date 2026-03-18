from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends
from app.database import engine, Base, get_db
from app.routers import companies, drivers, vehicles, trips, ai_assistant, auth, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trip & THC Management API")

# Setup CORS
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)
app.include_router(drivers.router)
app.include_router(vehicles.router)
app.include_router(trips.router)
app.include_router(ai_assistant.router)
app.include_router(auth.router)
app.include_router(dashboard.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Trip & THC Management System API"}
