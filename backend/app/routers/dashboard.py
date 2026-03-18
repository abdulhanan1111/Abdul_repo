from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.database import get_db
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Provides basic counts for the main entities."""
    drivers = db.query(models.DriverMaster).count()
    vehicles = db.query(models.VehicleMaster).count()
    companies = db.query(models.Company).count()
    trips = db.query(models.Trip).count()
    return {"drivers": drivers, "vehicles": vehicles, "companies": companies, "trips": trips}

@router.get("/analytics")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    """Provides aggregated data for dashboard charts and analytics."""
    # 1. Trips by status
    status_counts = db.query(
        models.Trip.status,
        func.count(models.Trip.id)
    ).group_by(models.Trip.status).all()
    trips_by_status = [{"name": status, "count": count} for status, count in status_counts]

    # 2. Revenue over the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_revenue = db.query(
        func.date(models.THC.generated_at).label('date'),
        func.sum(models.THC.freight_cost).label('revenue')
    ).filter(models.THC.generated_at >= thirty_days_ago).group_by(func.date(models.THC.generated_at)).order_by('date').all()
    revenue_over_time = [{"date": str(date), "revenue": revenue or 0} for date, revenue in daily_revenue]

    # 3. Trips by origin city (Top 10)
    city_counts = db.query(
        models.Trip.origin_city,
        func.count(models.Trip.id).label('count')
    ).group_by(models.Trip.origin_city).order_by(func.count(models.Trip.id).desc()).limit(10).all()
    trips_by_city = [{"name": city, "count": count} for city, count in city_counts]

    # 4. Overall stats
    total_revenue = db.query(func.sum(models.THC.freight_cost)).scalar() or 0
    completed_trips = db.query(models.Trip).filter(models.Trip.status == 'Completed').count()

    return {
        "trips_by_status": trips_by_status,
        "revenue_over_time": revenue_over_time,
        "trips_by_city": trips_by_city,
        "total_revenue": total_revenue,
        "completed_trips": completed_trips,
        "total_trips": db.query(models.Trip).count(),
        "total_vehicles": db.query(models.VehicleMaster).count(),
        "total_drivers": db.query(models.DriverMaster).count(),
        "total_companies": db.query(models.Company).count(),
    }
