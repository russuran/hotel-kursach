from fastapi import APIRouter 
from fastapi import Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine
from datetime import datetime, timedelta
from sqlalchemy import text
import jwt


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


@router.get('/')
def get_employees(current_user: models.Employee = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.Position == 'Управляющий':
        employees = db.query(models.Employee).filter(models.Employee.Position == 'Горничная').all()
    
    elif current_user.Position == 'Менеджер':
        employees = db.query(models.Employee).filter(models.Employee.Position == 'Горничная').all()
    else:
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

    if employee.Position == 'Горничная':
        
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
    
    if employee.Position == 'Горничная':
        
        db_maid = db.query(models.Maid).filter(models.Maid.WorkerID == db_employee.WorkerID).first()
        if db_maid is not None:
            return {'error': 'Такая запись уже существует?'}
        else:
            maid = schemas.MaidCreate(WorkerID=db_employee.WorkerID)
            db_maid = models.Maid(**maid.dict())
            db.add(db_maid)
            db.commit()
            db.refresh(db_maid)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.delete("/{employee_id}") 
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.WorkerID == employee_id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    if db_employee.Position == 'Горничная':
        db_maid = db.query(models.Maid).filter(models.Maid.WorkerID == db_employee.WorkerID).first()
        if db_maid == None:
            return {'error': 'Такая запись уже не существует?'}
        else:
            db.delete(db_maid)

    try:
        db.execute(text("CALL del_employee(:employee_id)"), {"employee_id": employee_id})
    except Exception as e:
        pass
    
    db.delete(db_employee)

    db.commit()

    return db_employee