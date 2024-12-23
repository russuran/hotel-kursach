from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from typing import List
from database import SessionLocal, engine
from sqlalchemy import text
import jwt
from datetime import datetime, timedelta


router = APIRouter()

SECRET_KEY = "otel-eleon"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()


async def get_current_user(db: Session = Depends(get_db), authorization: str = Header(...)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = authorization.split(" ")[1] if " " in authorization else None

    if token is None:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user = db.query(models.Employee).filter(models.Employee.WorkerID == int(user_id)).first()
        return user 
    except:
        raise credentials_exception

@router.post("/")
def create_cleaning_schedule(schedule: schemas.CleaningScheduleCreate, db: Session = Depends(get_db)):
    date = schedule.DateTime.split('T')[0]
    schedule.DateTime = datetime.strptime(date, '%Y-%m-%d')
    if (schedule.DateTime.date() + timedelta(days=1)) < datetime.now().date():
        return {'error': 'Дата не может быть меньше текущей даты'}

    db_schedule = models.CleaningSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@router.get("/")
def read_cleaning_schedules(current_user: models.Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    maid_id = db.query(models.Maid).filter(models.Maid.WorkerID == current_user.WorkerID).first()
    if maid_id is None:
        return db.query(models.CleaningSchedule).all()
    maid_id = maid_id.MaidID 
    schedules = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.MaidID == maid_id).all()
    
    return schedules

@router.get("/{cleaning_id}", response_model=schemas.CleaningSchedule)
def read_cleaning_schedule(cleaning_id: int, db: Session = Depends(get_db)):
    schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    return schedule

@router.put("/{cleaning_id}")
def update_cleaning_schedule(cleaning_id: int, schedule: schemas.CleaningScheduleCreate, сurrent_user: models.Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    db_schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    schedule.DateTime = datetime.strptime(schedule.DateTime.split('T')[0], '%Y-%m-%d').date()

    if schedule.DateTime < datetime.now().date() and сurrent_user.Position != 'Горничная':
        return {'error': 'Дата не может быть меньше текущей даты'}

    for key, value in schedule.dict().items():
        setattr(db_schedule, key, value)
    
    db.commit()
    db.refresh(db_schedule)

    print(schedule.DateTime, datetime.now().date(), schedule.DateTime < datetime.now().date() and сurrent_user.Position == 'Горничная')

    if schedule.DateTime + timedelta(days=1) < datetime.now().date() and сurrent_user.Position == 'Горничная':
        return {'msg': 'Уборка выполнена не в срок!'}

    return db_schedule

@router.delete("/{cleaning_id}", response_model=schemas.CleaningSchedule)
def delete_cleaning_schedule(cleaning_id: int, db: Session = Depends(get_db)):
    db_schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    try:
        db.execute(text("CALL del_cl_sh(:cleaning_id)"), {"cleaning_id": cleaning_id})
    except Exception as e:
        pass
    db.delete(db_schedule)
    db.commit()

    return db_schedule
