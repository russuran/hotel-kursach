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
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    client.Birthday = datetime.strptime(client.Birthday.split('T')[0], '%Y-%m-%d').date() + timedelta(days=1)
    if client.Birthday > datetime.now().date():
        return {'error': 'Дата рождения не может быть больше текущей даты'}
    
    if db_client := db.query(models.Client).filter(models.Client.Passport == client.Passport).first():
        return {'error': 'Такой паспорт уже существует'}
    
    if db_client := db.query(models.Client).filter(models.Client.Phone == client.Phone).first():
        return {'error': 'Такой телефон уже существует'}

    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@router.get("/", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    clients = db.query(models.Client).offset(skip).limit(limit).all()
    return clients

@router.get("/{client_id}", response_model=schemas.Client)
def read_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.ClientID == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@router.put("/{client_id}")
def update_client(client_id: int, client: schemas.ClientCreate, db: Session = Depends(get_db)):
    client.Birthday = datetime.strptime(client.Birthday.split('T')[0], '%Y-%m-%d').date()

    db_client_main = db.query(models.Client).filter(models.Client.ClientID == client_id).first()
    if db_client_main is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_client = db.query(models.Client).filter(models.Client.ClientID == client_id).first()
    if client.Birthday > datetime.now().date():
        return {'error': 'Дата рождения не может быть больше текущей даты'}
    
    if db_client.ClientID != db_client_main.ClientID and db_client.Passport == db_client_main.Passport:
        return {'error': 'Такой паспорт уже существует'}
    
    if db_client.ClientID != db_client_main.ClientID and db_client.Phone == db_client_main.Phone:
        return {'error': 'Такой телефон уже существует'}

    
    
    for key, value in client.dict().items():
        setattr(db_client, key, value)
    
    db.commit()
    db.refresh(db_client)
    return db_client

@router.delete("/{client_id}", response_model=schemas.Client)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.ClientID == client_id).first()
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.execute(text("CALL del_client(:client_id)", {"client_id": client_id}))

    #db.delete(db_client)
    db.commit()
    return db_client