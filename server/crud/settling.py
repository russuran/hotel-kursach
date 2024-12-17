from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from typing import List
from database import SessionLocal, engine
from datetime import datetime, timedelta
from sqlalchemy import text

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()
        
@router.post("/")
def create_settling(settling: schemas.SettlingCreate, db: Session = Depends(get_db)):
    settling.OutDate = datetime.strptime(settling.OutDate.split('T')[0], '%Y-%m-%d') + timedelta(days=1)
    settling.SettlingDate = datetime.strptime(settling.SettlingDate.split('T')[0], '%Y-%m-%d') + timedelta(days=1)

    if settling.OutDate < settling.SettlingDate:
        return {'error': 'Дата начала бронирования не может быть больше даты окончания бронирования'}
    
    if settling.SettlingDate.date() < datetime.now().date():
        return {'error': 'Дата начала бронирования не может быть меньше текущей даты'}


    data = settling.dict()
    db_settling = models.Settling(**data)
    db.add(db_settling)
    db.commit()
    db.refresh(db_settling)
    return db_settling

@router.get("/", response_model=List[schemas.Settling])
def read_settlings(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    settlings = db.query(models.Settling).offset(skip).limit(limit).all()
    
        
    return settlings

@router.get("/{settling_id}", response_model=schemas.Settling)
def read_settling(settling_id: int, db: Session = Depends(get_db)):
    settling = db.query(models.Settling).filter(models.Settling.settlingNumber == settling_id).first()
    if settling is None:
        raise HTTPException(status_code=404, detail="Settling not found")
    return settling

@router.put("/{BookingNumber}")
def update_settling(BookingNumber: int, settling: schemas.SettlingCreate, db: Session = Depends(get_db)):
    settling.OutDate = datetime.strptime(settling.OutDate.split('T')[0], '%Y-%m-%d') + timedelta(days=1)
    settling.SettlingDate = datetime.strptime(settling.SettlingDate.split('T')[0], '%Y-%m-%d') + timedelta(days=1)

    if settling.OutDate < settling.SettlingDate:
        return {'error': 'Дата начала бронирования не может быть больше даты окончания бронирования'}
    
    if settling.SettlingDate.date() < datetime.now().date():
        return {'error': 'Дата начала бронирования не может быть меньше текущей даты'}

    db_settling = db.query(models.Settling).filter(models.Settling.BookingNumber == BookingNumber).first()
    if db_settling is None:
        raise HTTPException(status_code=404, detail="Settling not found")
    
    for key, value in settling.dict().items():
        setattr(db_settling, key, value)
    
    db.commit()
    db.refresh(db_settling)
    return db_settling

@router.delete("/{settling_id}", response_model=schemas.Settling)
def delete_settling(settling_id: int, db: Session = Depends(get_db)):
    db_settling = db.query(models.Settling).filter(models.Settling.settlingNumber == settling_id).first()
    if db_settling is None:
        raise HTTPException(status_code=404, detail="Settling not found")
    
    db.execute(text("CALL del_settling(:settling_id)", {"settling_id": settling_id}))
    #db.delete(db_settling)
    db.commit()
    return db_settling