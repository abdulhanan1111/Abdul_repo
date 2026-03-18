import sys
import os
sys.path.append(os.getcwd())
from app.database import SessionLocal
from app import crud, models

db = SessionLocal()
try:
    # Try to delete the first company found
    company = db.query(models.Company).first()
    if company:
        print(f"Attempting to delete company: {company.name} (ID: {company.id})")
        crud.delete_company(db, company.id)
        print("Deletion successful!")
    else:
        print("No companies found to delete.")
except Exception as e:
    print(f"Caught error: {type(e).__name__}: {str(e)}")
finally:
    db.close()
