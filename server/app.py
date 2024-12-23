from fastapi import FastAPI, Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
import models, schemas
from typing import List, Annotated, Any

import time
from datetime import datetime, timedelta
import jwt
from apscheduler.schedulers.background import BackgroundScheduler



from crud.employee import router as employee_router
from crud.maid import router as maids_router
from crud.settling import router as settling_router
from crud.settling_service import router as set_ser_router
from crud.settled_clients import router as settled_clients_router
from crud.service import router as service_router
from crud.room import router as room_router
from crud.booking import router as booking_router
from crud.cleaning_schedule import router as cleaning_schedule_router
from crud.client import router as client_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(employee_router, prefix="/employees", tags=["employees"])
app.include_router(maids_router, prefix="/maids", tags=["maids"])
app.include_router(settling_router, prefix="/settling", tags=["settlings"])
app.include_router(set_ser_router, prefix="/settling-services", tags=["settling_services"])
app.include_router(settled_clients_router, prefix="/settled-clients", tags=["settled_clients"])
app.include_router(service_router, prefix="/services", tags=["services"])
app.include_router(room_router, prefix="/rooms", tags=["rooms"])
app.include_router(booking_router, prefix="/bookings", tags=["bookings"])
app.include_router(cleaning_schedule_router, prefix="/cleaning-schedules", tags=["cleaning_schedule"])
app.include_router(client_router, prefix="/clients", tags=["clients"])

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

#-------------Проверка состояния комнаты------------------
def scheduled_task():
    print(f"Задача выполнена в {datetime.now()}")
    db = SessionLocal()  # Создаем сессию базы данных
    try:
        print(f"Задача выполнена в {datetime.now()}")
        bookings = db.query(models.Booking).all()
        rooms = db.query(models.Room).all()
        for room in rooms:
            for booking in bookings:
                if booking.RoomID == room.RoomID:
                    if booking.DateEnd <= datetime.now().date():
                        room.State = 'Свободен'
                    else:
                        room.State = 'Занят'
        
        settling_rooms = [settling.RoomID for settling in db.query(models.Settling).all()]

        for booking in bookings:
            if booking.RoomID not in settling_rooms:
                if abs((booking.DateStart - datetime.now().date()).days) >= 1:
                    print(booking.RoomID, booking.DateStart, datetime.now().date(), abs((booking.DateStart - datetime.now().date()).days))
                    db.delete(booking)
                    db.query(models.Room).filter(models.Room.RoomID == booking.RoomID).update({'State': 'Свободен'})
                        
        


        db.commit()
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_task, 'cron', hour=00, minute=00)  # Запуск каждый день в полночь
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()


#---------------------login---------------------

SECRET_KEY = "otel-eleon"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


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


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta if expires_delta else datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



@app.post("/login")
async def login(data: schemas.LoginSchema, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.Employee).filter(models.Employee.Login == data.login).first()
    if user is not None:
        if user.Password == data.password:
            print(123)
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(data={"sub": str(user.WorkerID)}, expires_delta=access_token_expires)
            
            response.status_code = 200
            return {"access_token": access_token, "token_type": "bearer", "role": user.Position, "name": user.FullName}

    response.status_code = 401
    return {"error": "Неверный логин или пароль"}

@app.get("/me")
async def read_users_me(current_user: models.Employee = Depends(get_current_user)):
    return current_user



@app.get("/list_of_rooms")
def list_of_rooms(db: Session = Depends(get_db)):
    rooms = db.query(models.Room).all()
    ret_list = []
    for room in rooms:
        ret = {}
        if room is not None:
            ret['label'] = f'{room.Type} | {room.Size}мкв | {room.Floor}эт | {room.RoomID}'
            ret['value'] = room.RoomID
        ret_list.append(ret)

    return ret_list


@app.get("/sc_list")
def sc_list(db: Session = Depends(get_db)):
    settlings = db.query(models.Settling).all()
    ret_list = []
    
    for settling in settlings:
        ret = {}
        room = db.query(models.Room).filter(models.Room.RoomID == settling.RoomID).first()
        if room is not None:
            ret['label'] = f'#{settling.BookingNumber} | {room.Type} | {room.Size}мкв | {room.Floor}эт | {room.RoomID}'
            ret['value'] = settling.BookingNumber
            ret['RoomID'] = int(room.RoomID)

        ret_list.append(ret)


    ret_list = sorted(ret_list, key=lambda x: x.get('RoomID'))

    return ret_list

@app.get("/list_of_clients")
def list_of_clients(db: Session = Depends(get_db)): 
    clients = db.query(models.Client).all()
    ret_list = []
    for client in clients:
        ret = {}
        if client is not None:
            ret['label'] = client.FullName
            ret['value'] = client.ClientID
        ret_list.append(ret)

    return ret_list

@app.get("/services_list")
def service_list(db: Session = Depends(get_db)):
    services = db.query(models.Service).all()
    ret_list = []
    for service in services:
        ret = {}
        if service is not None:
            ret['label'] = service.name
            ret['value'] = service.name
        ret_list.append(ret)

    return ret_list


@app.get("/list_of_maids")
def list_of_maid(db: Session = Depends(get_db)):
    maids = db.query(models.Maid).all()
    ret_list = []
    for maid in maids:
        ret = {}
        name = db.query(models.Employee).filter(models.Employee.WorkerID == maid.WorkerID).first()
        if name is not None:
            ret['label'] = name.FullName
            ret['value'] = maid.MaidID
        ret_list.append(ret)

    return ret_list

@app.get("/user_data")
def user_data(db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    return { 'name': current_user.FullName, 'role': current_user.Position }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

