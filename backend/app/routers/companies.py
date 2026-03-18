from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/companies", tags=["companies"])

@router.post("/", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    return crud.create_company(db=db, company=company)

@router.put("/{company_id}", response_model=schemas.Company)
def update_company(company_id: int, company: schemas.CompanyUpdate, db: Session = Depends(get_db)):
    db_company = crud.update_company(db=db, company_id=company_id, company=company)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company

@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = crud.delete_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"status": "success", "message": "Company deleted"}

@router.get("/", response_model=schemas.PaginatedCompanies)
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_companies(db, skip=skip, limit=limit)

@router.get("/{company_id}", response_model=schemas.Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    db_company = crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company
