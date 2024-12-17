from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from typing import List
from database import SessionLocal, engine
from sqlalchemy import text
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

@router.post("/")
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    if room.Price is None or room == '':
        return {'error': 'Поле "Цена" не заполнено'}
    
    try:
        if float(room.Price) <= 0:
            return {'error': 'Цена должна быть больше 0'}
    except:
        return {'error': 'Цена должна быть числом'}
    
    try:
        if not(1 <= int(room.Floor) <= 8):
            return {'error': 'Этаж должен быть от 1 до 8'}
    except:
        return {'error': 'Этаж должен быть числом'}
    
    try:
        if int(room.Size) <= 0:
            return {'error': 'Площадь должна быть больше 0'}
    except:
        return {'error': 'Площадь должна быть числом'}
    finally:
        db_room = models.Room(**room.dict())
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        
        return db_room

@router.get("/", response_model=List[schemas.Room])
def read_rooms(db: Session = Depends(get_db)):
    rooms = db.query(models.Room).all()
    return rooms

@router.get("/{room_id}", response_model=schemas.Room)
def read_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.RoomID == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.put("/{room_id}")
def update_room(room_id: int, room: schemas.RoomCreate, db: Session = Depends(get_db)):
    
    if room.Price is None or room == '':
        return {'error': 'Поле "Цена" не заполнено'}
    
    try:
        if float(room.Price) <= 0:
            return {'error': 'Цена должна быть больше 0'}
    except:
        return {'error': 'Цена должна быть числом'}
    
    try:
        if not(1 <= int(room.Floor) <= 8):
            return {'error': 'Этаж должен быть от 1 до 8'}
    except:
        return {'error': 'Этаж должен быть числом'}
    
    try:
        if int(room.Size) <= 0:
            return {'error': 'Площадь должна быть больше 0'}
    except:
        return {'error': 'Площадь должна быть числом'}

    db_room = db.query(models.Room).filter(models.Room.RoomID == room_id).first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    for key, value in room.dict().items():
        setattr(db_room, key, value)
    
    db.commit()
    db.refresh(db_room)
    return db_room

@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    db_room = db.query(models.Room).filter(models.Room.RoomID == room_id).first()
    if db_room is None:
                raise HTTPException(status_code=404, detail="Room not found")
    

    db.execute(text("CALL del_room(:r_id)"), {"r_id": room_id})

    db.commit()
    return {'status': 'ok'}