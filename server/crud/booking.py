from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine
from typing import List
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
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):

    booking.DateEnd = datetime.strptime(booking.DateEnd.split('T')[0], '%Y-%m-%d') + timedelta(days=1)
    booking.DateStart = datetime.strptime(booking.DateStart.split('T')[0], '%Y-%m-%d') + timedelta(days=1)

    if booking.DateEnd < booking.DateStart:
        return {'error': 'Дата начала бронирования не может быть больше даты окончания бронирования'}
    
    if booking.DateStart.date() < datetime.now().date():
        return {'error': 'Дата начала бронирования не может быть меньше текущей даты'}
    

    curr_bookings = db.query(models.Booking).filter(models.Booking.RoomID == booking.RoomID).all()

    for booking_in in curr_bookings:
        #print(555, booking_in.DateStart, booking.DateStart.date(), booking_in.DateStart <= booking.DateStart.date(), booking_in.DateEnd >= booking.DateEnd.date())
        if booking_in.DateStart >= booking.DateStart.date() and booking_in.DateEnd <= booking.DateEnd.date():
            return {'error': 'Бронирование данной комнаты пересекается с существующим'}
        
        if booking_in.DateStart <= booking.DateStart.date() and booking_in.DateEnd >= booking.DateStart.date():
            return {'error': 'Бронирование данной комнаты пересекается с существующим'}
        
        if booking_in.DateStart <= booking.DateEnd.date() and booking_in.DateEnd >= booking.DateEnd.date():
            return {'error': 'Бронирование данной комнаты пересекается с существующим'}


    room = db.query(models.Room).filter(models.Room.RoomID == booking.RoomID).first()
    room.State = 'Занят'

    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)

    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/", response_model=List[schemas.Booking])
def read_bookings(db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).all()
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

    curr_bookings = db.query(models.Booking).filter(models.Booking.RoomID == booking.RoomID).all()

    for booking_in in curr_bookings:
        if booking_in.BookingID == booking_id:
            continue
        #print(555, booking_in.DateStart, booking.DateStart.date(), booking_in.DateStart <= booking.DateStart.date(), booking_in.DateEnd >= booking.DateEnd.date())
        if booking_in.DateStart >= booking.DateStart.date() and booking_in.DateEnd <= booking.DateEnd.date():
            return {'error': 'Бронирование данной комнаты пересекается с существующим'}
        
        if booking_in.DateStart <= booking.DateStart.date() and booking_in.DateEnd >= booking.DateStart.date():
            return {'error': 'Бронирование данной комнаты пересекается с существующим'}
        
        if booking_in.DateStart <= booking.DateEnd.date() and booking_in.DateEnd >= booking.DateEnd.date():
            return {'error': 'Бронирование данной комнаты пересекается с существующим'}

    db_booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    for key, value in booking.dict().items():
        setattr(db_booking, key, value)
    
    db.commit()
    db.refresh(db_booking)
    return {'status': 'ok'}

@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()

    if db_booking is None:
        pass #??

    try:
        db.execute(text("CALL del_booking(:booking_id)"), {"booking_id": booking_id})
    except Exception as e:
        db.rollback()


    
    try:
        room = db.query(models.Room).filter(models.Room.RoomID == db_booking.RoomID).first()
        room.State = 'Свободен'
        db.commit()
    except Exception as e:
        pass

    try:
        settling = db.query(models.Settling).filter(models.Settling.BookingNumber == booking_id).first()
        db.delete(settling)
        db.commit()
    except Exception as e:
        print(e)

    return {'status': 'ok'}