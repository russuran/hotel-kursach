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
def create_settled_client(settled_client: schemas.SettledClientCreate, db: Session = Depends(get_db)):
    try:
        if type(int(settled_client.ClientRate)) != int:
            return {'error': 'Оценка клиента должна быть числом'}
        
        if int(settled_client.ClientRate) < 0 or int(settled_client.ClientRate) > 10:
                return {'error': 'Оценка клиента должна быть от 0 до 10'}
    except:
        return {'error': 'Оценка клиента должна быть числом'}

    db_settled_client = models.SettledClient(**settled_client.dict())
    db.add(db_settled_client)
    db.commit()
    db.refresh(db_settled_client)
    return db_settled_client

@router.get("/", response_model=List[schemas.SettledClient])
def read_settled_clients(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    settled_clients = db.query(models.SettledClient).offset(skip).limit(limit).all()
    return settled_clients

@router.get("/{settled_client_id}", response_model=schemas.SettledClient)
def read_settled_client(settled_client_id: int, db: Session = Depends(get_db)):
    settled_client = db.query(models.SettledClient).filter(models.SettledClient.ClientID == settled_client_id).first()
    if settled_client is None:
        raise HTTPException(status_code=404, detail="Settled client not found")
    return settled_client

@router.put("/{ClientID}/{SettlingID}")
def update_settled_client(ClientID: int, SettlingID: int, settled_client: schemas.SettledClientCreate, db: Session = Depends(get_db)):
    db_settled_client = db.query(models.SettledClient).filter(models.SettledClient.ClientID == ClientID, models.SettledClient.SettlingID == SettlingID).first()
    if db_settled_client is None:
        raise HTTPException(status_code=404, detail="Settled client not found")
    
    try:
        if type(int(settled_client.ClientRate)) != int:
            return {'error': 'Оценка клиента должна быть числом'}
        
        if int(settled_client.ClientRate) < 0 or int(settled_client.ClientRate) > 10:
                return {'error': 'Оценка клиента должна быть от 0 до 10'}
    except:
        return {'error': 'Оценка клиента должна быть числом'}

    for key, value in settled_client.dict().items():
        setattr(db_settled_client, key, value)
    
    db.commit()
    db.refresh(db_settled_client)
    return db_settled_client


@router.delete("/{ClientID}/{SettlingID}")
def delete_settled_client(ClientID: int, SettlingID: int, db: Session = Depends(get_db)):
    db_settled_client = db.query(models.SettledClient).filter(models.SettledClient.ClientID == ClientID, models.SettledClient.SettlingID == SettlingID).first()
    if db_settled_client is None:
        raise HTTPException(status_code=404, detail="Settled client not found")
    
    try:
        db.execute(text("CALL del_settled_client(:ClientID, :SettlingID)"), {"ClientID": ClientID, "SettlingID": SettlingID})
    except Exception as e:
        pass
    db.delete(db_settled_client)
    db.commit()
    
    return db_settled_client
