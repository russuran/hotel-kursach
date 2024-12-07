from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine
from datetime import datetime, timedelta

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

@router.get('/')
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
    return employees

@router.post("/")
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    employee.Birthday = datetime.strptime(employee.Birthday.split('T')[0], "%Y-%m-%d").date() + timedelta(days=1)
    if (datetime.now().date() - employee.Birthday).days < 18 * 365:
        return {'error': 'Сотрудник должен быть старше 18 лет'}
    
    db_emp = db.query(models.Employee).filter(models.Employee.Login == employee.Login).first()
    if db_emp is not None:
        return {'error': 'Такой логин уже существует'}
    

    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    if employee.Position == 'maid':
        
        db_maid = db.query(models.Maid).filter(models.Maid.WorkerID == db_employee.WorkerID).first()
        if db_maid is not None:
            return {'error': 'Такая запись уже существует?'}
        else:
            maid = schemas.MaidCreate(WorkerID=db_employee.WorkerID)
            db_maid = models.Maid(**maid.dict())
            db.add(db_maid)
            db.commit()
            db.refresh(db_maid)

    return {'status': 'ok'}

@router.put("/{employee_id}")
def update_employee(employee_id: int, employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.WorkerID == employee_id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db_emp = db.query(models.Employee).filter(models.Employee.Login == employee.Login).first()
    if db_emp is not None and db_emp.WorkerID != employee_id:
        return {'error': 'Такой логин уже существует'}

    for key, value in employee.dict().items():
        setattr(db_employee, key, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.delete("/{employee_id}") 
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.WorkerID == employee_id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    if db_employee.Position == 'maid':
        db_maid = db.query(models.Maid).filter(models.Maid.WorkerID == db_employee.WorkerID).first()
        if db_maid == None:
            return {'error': 'Такая запись уже не существует?'}
        else:
            db.delete(db_maid)
            db.commit()

    db.delete(db_employee)
    db.commit()

    return db_employee