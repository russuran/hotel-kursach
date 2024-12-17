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

@router.post("/", response_model=schemas.CleaningSchedule)
def create_cleaning_schedule(schedule: schemas.CleaningScheduleCreate, db: Session = Depends(get_db)):
    db_schedule = models.CleaningSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.get("/", response_model=List[schemas.CleaningSchedule])
def read_cleaning_schedules(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    schedules = db.query(models.CleaningSchedule).offset(skip).limit(limit).all()
    return schedules

@router.get("/{cleaning_id}", response_model=schemas.CleaningSchedule)
def read_cleaning_schedule(cleaning_id: int, db: Session = Depends(get_db)):
    schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    return schedule

@router.put("/{cleaning_id}", response_model=schemas.CleaningSchedule)
def update_cleaning_schedule(cleaning_id: int, schedule: schemas.CleaningScheduleCreate, db: Session = Depends(get_db)):
    db_schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    
    for key, value in schedule.dict().items():
        setattr(db_schedule, key, value)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.delete("/{cleaning_id}", response_model=schemas.CleaningSchedule)
def delete_cleaning_schedule(cleaning_id: int, db: Session = Depends(get_db)):
    db_schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    
    db.execute(text("CALL del_cleaning_schedule(:cleaning_id)", {"cleaning_id": cleaning_id}))

    #db.delete(db_schedule)
    db.commit()
    return db_schedule
