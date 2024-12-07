from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from typing import List
from database import SessionLocal, engine
from typing import Any

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()


@router.post("/")
def create_settling_service(settling_service: schemas.SettlingServiceCreate, db: Session = Depends(get_db)):
    if settling_service.Amount is None or settling_service.Amount == '':
        settling_service.Amount = 1

    try:
        if int(settling_service.Amount) < 0:
            return {"error": "Количество должно быть больше 0"} 
    except:
        return {"error": "Количество должно быть числом"}
    
    db_settling_service = models.SettlingService(**settling_service.dict())
    db.add(db_settling_service)
    db.commit()
    db.refresh(db_settling_service)
    return db_settling_service

@router.get("/", response_model=List[schemas.SettlingService])
def read_settling_services(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    settling_services = db.query(models.SettlingService).offset(skip).limit(limit).all()
    return settling_services

@router.get("/{settling_service_id}", response_model=schemas.SettlingService)
def read_settling_service(settling_service_id: int, db: Session = Depends(get_db)):
    settling_service = db.query(models.SettlingService).filter(models.SettlingService.SettlingID == settling_service_id).first()
    if settling_service is None:
        raise HTTPException(status_code=404, detail="Settling service not found")
    return settling_service

@router.put("/{Name}/{SettlingID}")
def update_settling_service(Name: str, SettlingID: int, settling_service: schemas.SettlingServiceCreate, db: Session = Depends(get_db)):
    db_settling_service = db.query(models.SettlingService).filter(models.SettlingService.SettlingID == SettlingID and models.SettlingService.Name == Name).first()
    try:
        if int(settling_service.Amount) < 0:
            return {"error": "Количество должно быть больше 0"} 
    except:
        return {"error": "Количество должно быть числом"}

    if db_settling_service is None:
        raise HTTPException(status_code=404, detail="Settling service not found")
    
    for key, value in settling_service.dict().items():
        setattr(db_settling_service, key, value)
    
    db.commit()
    db.refresh(db_settling_service)
    return db_settling_service

@router.delete("/{settling_service_id}", response_model=schemas.SettlingService)
def delete_settling_service(settling_service_id: int, db: Session = Depends(get_db)):
    db_settling_service = db.query(models.SettlingService).filter(models.SettlingService.SettlingID == settling_service_id).first()
    if db_settling_service is None:
        raise HTTPException(status_code=404, detail="Settling service not found")
    
    db.delete(db_settling_service)
    db.commit()
    return db_settling_service
