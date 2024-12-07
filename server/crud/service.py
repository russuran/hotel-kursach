from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from typing import List, Any
from database import SessionLocal, engine

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()


@router.post("/")
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    if service.Price == None or service.Price == '':
        service.Price = 1
    try:
        if float(service.Price) <= 0:
            return {'error': 'Стоимость услуги должна быть больше 0'}
    except:
        return {'error': 'Стоимость услуги должна быть числом'}

    db_service = models.Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@router.get("/", response_model=List[schemas.Service])
def read_services(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    services = db.query(models.Service).offset(skip).limit(limit).all()
    return services

@router.get("/{service_name}", response_model=schemas.Service)
def read_service(service_name: str, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.name == service_name).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.put("/{service_id}")
def update_service(service_id: str, service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    if service.Price == None or service.Price == '':
        service.Price = 1
    try:
        if float(service.Price) <= 0:
            return {'error': 'Стоимость услуги должна быть больше 0'}
    except:
        return {'error': 'Стоимость услуги должна быть числом'}
        
    db_service = db.query(models.Service).filter(models.Service.name == service_id).first()
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    for key, value in service.dict().items():
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@router.delete("/{service_id}", response_model=schemas.Service)
def delete_service(service_id: Any, db: Session = Depends(get_db)):
    db_service = db.query(models.Service).filter(models.Service.name == service_id).first()
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(db_service)
    db.commit()
    return db_service