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

@router.get("/", response_model=List[schemas.Maid])
def read_maids(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    maids = db.query(models.Maid).offset(skip).limit(limit).all()

    return maids


@router.post("/", response_model=schemas.Maid)
def create_maid(maid: schemas.MaidCreate, db: Session = Depends(get_db)):    
    db_maid = models.Maid(**maid.dict())
    db.add(db_maid)
    db.commit()
    db.refresh(db_maid)

    return db_maid


@router.put("/{maid_id}", response_model=schemas.Maid)
def update_maid(maid_id: int, maid: schemas.MaidCreate, db: Session = Depends(get_db)):
    db_maid = db.query(models.Maid).filter(models.Maid.MaidID == maid_id).first()
    if db_maid is None:
        raise HTTPException(status_code=404, detail="Maid not found")
    
    for key, value in maid.dict().items():
        setattr(db_maid, key, value)
    
    db.commit()
    db.refresh(db_maid)

    return db_maid


@router.delete("/{maid_id}") 
def delete_maid(maid_id: int, db: Session = Depends(get_db)):
    db_maid = db.query(models.Maid).filter(models.Maid.MaidID == maid_id).first()
    if db_maid is None:
        raise HTTPException(status_code=404, detail="Maid not found")
    
    db.execute(text("CALL del_maid(:maid_id)", {"maid_id": maid_id}))
    #db.delete(db_maid)
    db.commit()

    return db_maid
