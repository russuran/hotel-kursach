from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from typing import List
from database import SessionLocal, engine
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()
        
@router.post("/")
def create_settled_client(settled_client: schemas.SettledClientCreate, db: Session = Depends(get_db)):
    settled_client.ClientRate = 5
    sclients = db.query(models.SettledClient).filter(models.SettledClient.SettlingID == settled_client.SettlingID).all()
    print(sclients)
    if len(sclients) >= 4:
        return {'error': 'Превышено количество клиентов (максимум 4 на один номер)'}

    try:
        db_settled_client = models.SettledClient(**settled_client.dict())
        db.add(db_settled_client)
        db.commit()
        db.refresh(db_settled_client)
    except IntegrityError:
        return {'error': 'Такой клиент уже заселен'}
    
    return db_settled_client

@router.get("/", response_model=List[schemas.SettledClient])
def read_settled_clients(db: Session = Depends(get_db)):
    settled_clients = db.query(models.SettledClient).all()
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
    
    # sclients = db.query(models.SettledClient).filter(models.SettledClient.SettlingID == SettlingID).all()
    # print(sclients)
    # if len(sclients) >= 4:
    #     return {'error': 'Превышено количество клиентов (максимум 4 на один номер)'}

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
