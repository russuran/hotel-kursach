from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

@router.post("/")
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):

    booking.DateEnd = datetime.strptime(booking.DateEnd.split('T')[0], '%Y-%m-%d') + timedelta(days=1)
    booking.DateStart = datetime.strptime(booking.DateStart.split('T')[0], '%Y-%m-%d') + timedelta(days=1)

    if booking.DateEnd < booking.DateStart:
        return {'error': 'Дата начала бронирования не может быть больше даты окончания бронирования'}
    
    if booking.DateStart.date() < datetime.now().date():
        return {'error': 'Дата начала бронирования не может быть меньше текущей даты'}
    
    
    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/", response_model=List[schemas.Booking])
def read_bookings(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).offset(skip).limit(limit).all()
    return bookings

@router.get("/{booking_id}", response_model=schemas.Booking)
def read_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.put("/{booking_id}")
def update_booking(booking_id: int, booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    booking.DateEnd = datetime.strptime(booking.DateEnd.split('T')[0], '%Y-%m-%d') + timedelta(days=1)
    booking.DateStart = datetime.strptime(booking.DateStart.split('T')[0], '%Y-%m-%d') + timedelta(days=1)

    if booking.DateEnd - timedelta(days=1) <= booking.DateStart:
        return {'error': 'Дата начала бронирования не может быть больше даты окончания бронирования'}
    
    if booking.DateStart.date() < datetime.now().date():
        return {'error': 'Дата начала бронирования не может быть меньше текущей даты'}

    db_booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    for key, value in booking.dict().items():
        setattr(db_booking, key, value)
    
    db.commit()
    db.refresh(db_booking)
    return {'status': 'ok'}

@router.delete("/{booking_id}", response_model=schemas.Booking)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(db_booking)
    db.commit()
    return db_booking