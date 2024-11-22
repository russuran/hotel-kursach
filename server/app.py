from fastapi import FastAPI, Depends, HTTPException, Response, Depends, Header
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine
import models, schemas
from typing import List, Annotated

import time
from datetime import datetime, timedelta
import jwt

# Создание базы данных
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Зависимость для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()

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
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(data={"sub": str(user.WorkerID)}, expires_delta=access_token_expires)
            
            response.status_code = 200
            return {"access_token": access_token, "token_type": "bearer", "role": user.Position}

    response.status_code = 401
    return {"error": "Неверный логин или пароль"}

@app.get("/me")
async def read_users_me(current_user: models.Employee = Depends(get_current_user)):
    return current_user

#---------------------login---------------------


#---------------------crud----------------------

# Маршруты для работы с клиентами
@app.post("/clients/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.get("/clients/", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    clients = db.query(models.Client).offset(skip).limit(limit).all()
    return clients

@app.get("/clients/{client_id}", response_model=schemas.Client)
def read_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.ClientID == client_id).first()
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.put("/clients/{client_id}", response_model=schemas.Client)
def update_client(client_id: int, client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.ClientID == client_id).first()
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    for key, value in client.dict().items():
        setattr(db_client, key, value)
    
    db.commit()
    db.refresh(db_client)
    return db_client

@app.delete("/clients/{client_id}", response_model=schemas.Client)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.ClientID == client_id).first()
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(db_client)
    db.commit()
    return db_client

# Аналогично для других сущностей (комнаты, бронирования, услуги и т.д.)

# Маршруты для работы с комнатами
@app.post("/rooms/", response_model=schemas.Room)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    db_room = models.Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@app.get("/rooms/", response_model=List[schemas.Room])
def read_rooms(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    rooms = db.query(models.Room).offset(skip).limit(limit).all()
    return rooms

@app.get("/rooms/{room_id}", response_model=schemas.Room)
def read_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.RoomID == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@app.put("/rooms/{room_id}", response_model=schemas.Room)
def update_room(room_id: int, room: schemas.RoomCreate, db: Session = Depends(get_db)):
    db_room = db.query(models.Room).filter(models.Room.RoomID == room_id).first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    
    for key, value in room.dict().items():
        setattr(db_room, key, value)
    
    db.commit()
    db.refresh(db_room)
    return db_room

@app.delete("/rooms/{room_id}", response_model=schemas.Room)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    db_room = db.query(models.Room).filter(models.Room.RoomID == room_id).first()
    if db_room is None:
                raise HTTPException(status_code=404, detail="Room not found")
    
    db.delete(db_room)
    db.commit()
    return db_room

# Маршруты для работы с бронированиями
@app.post("/bookings/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.get("/bookings/", response_model=List[schemas.Booking])
def read_bookings(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).offset(skip).limit(limit).all()
    return bookings

@app.get("/bookings/{booking_id}", response_model=schemas.Booking)
def read_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@app.put("/bookings/{booking_id}", response_model=schemas.Booking)
def update_booking(booking_id: int, booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    for key, value in booking.dict().items():
        setattr(db_booking, key, value)
    
    db.commit()
    db.refresh(db_booking)
    return db_booking

@app.delete("/bookings/{booking_id}", response_model=schemas.Booking)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.BookingID == booking_id).first()
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    db.delete(db_booking)
    db.commit()
    return db_booking

# Маршруты для работы с заселениями
@app.post("/settlings/", response_model=schemas.Settling)
def create_settling(settling: schemas.SettlingCreate, db: Session = Depends(get_db)):
    db_settling = models.Settling(**settling.dict())
    db.add(db_settling)
    db.commit()
    db.refresh(db_settling)
    return db_settling

@app.get("/settlings/", response_model=List[schemas.Settling])
def read_settlings(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    settlings = db.query(models.Settling).offset(skip).limit(limit).all()
    return settlings

@app.get("/settlings/{settling_id}", response_model=schemas.Settling)
def read_settling(settling_id: int, db: Session = Depends(get_db)):
    settling = db.query(models.Settling).filter(models.Settling.BookingNumber == settling_id).first()
    if settling is None:
        raise HTTPException(status_code=404, detail="Settling not found")
    return settling

@app.put("/settlings/{settling_id}", response_model=schemas.Settling)
def update_settling(settling_id: int, settling: schemas.SettlingCreate, db: Session = Depends(get_db)):
    db_settling = db.query(models.Settling).filter(models.Settling.BookingNumber == settling_id).first()
    if db_settling is None:
        raise HTTPException(status_code=404, detail="Settling not found")
    
    for key, value in settling.dict().items():
        setattr(db_settling, key, value)
    
    db.commit()
    db.refresh(db_settling)
    return db_settling

@app.delete("/settlings/{settling_id}", response_model=schemas.Settling)
def delete_settling(settling_id: int, db: Session = Depends(get_db)):
    db_settling = db.query(models.Settling).filter(models.Settling.BookingNumber == settling_id).first()
    if db_settling is None:
        raise HTTPException(status_code=404, detail="Settling not found")
    
    db.delete(db_settling)
    db.commit()
    return db_settling

# Маршруты для работы с услугами
@app.post("/services/", response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_service = models.Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@app.get("/services/", response_model=List[schemas.Service])
def read_services(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    services = db.query(models.Service).offset(skip).limit(limit).all()
    return services

@app.get("/services/{service_name}", response_model=schemas.Service)
def read_service(service_name: str, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.name == service_name).first()
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@app.put("/services/{service_id}", response_model=schemas.Service)
def update_service(service_id: int, service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    db_service = db.query(models.Service).filter(models.Service.name == service_id).first()
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    for key, value in service.dict().items():
        setattr(db_service, key, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service

@app.delete("/services/{service_id}", response_model=schemas.Service)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    db_service = db.query(models.Service).filter(models.Service.name == service_id).first()
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    db.delete(db_service)
    db.commit()
    return db_service

# Маршруты для работы с графиками уборки
@app.post("/cleaning-schedules/", response_model=schemas.CleaningSchedule)
def create_cleaning_schedule(schedule: schemas.CleaningScheduleCreate, db: Session = Depends(get_db)):
    db_schedule = models.CleaningSchedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@app.get("/cleaning-schedules/", response_model=List[schemas.CleaningSchedule])
def read_cleaning_schedules(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    schedules = db.query(models.CleaningSchedule).offset(skip).limit(limit).all()
    return schedules

@app.get("/cleaning-schedules/{cleaning_id}", response_model=schemas.CleaningSchedule)
def read_cleaning_schedule(cleaning_id: int, db: Session = Depends(get_db)):
    schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    return schedule

@app.put("/cleaning-schedules/{cleaning_id}", response_model=schemas.CleaningSchedule)
def update_cleaning_schedule(cleaning_id: int, schedule: schemas.CleaningScheduleCreate, db: Session = Depends(get_db)):
    db_schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    
    for key, value in schedule.dict().items():
        setattr(db_schedule, key, value)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

@app.delete("/cleaning-schedules/{cleaning_id}", response_model=schemas.CleaningSchedule)
def delete_cleaning_schedule(cleaning_id: int, db: Session = Depends(get_db)):
    db_schedule = db.query(models.CleaningSchedule).filter(models.CleaningSchedule.CleaningID == cleaning_id).first()
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Cleaning schedule not found")
    
    db.delete(db_schedule)
    db.commit()
    return db_schedule

# Маршруты для работы с settled_clients
@app.post("/settled-clients/", response_model=schemas.SettledClient)
def create_settled_client(settled_client: schemas.SettledClientCreate, db: Session = Depends(get_db)):
    db_settled_client = models.SettledClient(**settled_client.dict())
    db.add(db_settled_client)
    db.commit()
    db.refresh(db_settled_client)
    return db_settled_client

@app.get("/settled-clients/", response_model=List[schemas.SettledClient])
def read_settled_clients(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    settled_clients = db.query(models.SettledClient).offset(skip).limit(limit).all()
    return settled_clients

@app.get("/settled-clients/{settled_client_id}", response_model=schemas.SettledClient)
def read_settled_client(settled_client_id: int, db: Session = Depends(get_db)):
    settled_client = db.query(models.SettledClient).filter(models.SettledClient.ClientID == settled_client_id).first()
    if settled_client is None:
        raise HTTPException(status_code=404, detail="Settled client not found")
    return settled_client

@app.put("/settled-clients/{settled_client_id}", response_model=schemas.SettledClient)
def update_settled_client(settled_client_id: int, settled_client: schemas.SettledClientCreate, db: Session = Depends(get_db)):
    db_settled_client = db.query(models.SettledClient).filter(models.SettledClient.ClientID == settled_client_id).first()
    if db_settled_client is None:
        raise HTTPException(status_code=404, detail="Settled client not found")
    
    for key, value in settled_client.dict().items():
        setattr(db_settled_client, key, value)
    
    db.commit()
    db.refresh(db_settled_client)
    return db_settled_client

@app.delete("/settled-clients/{settled_client_id}", response_model=schemas.SettledClient)
def delete_settled_client(settled_client_id: int, db: Session = Depends(get_db)):
    db_settled_client = db.query(models.SettledClient).filter(models.SettledClient.ClientID == settled_client_id).first()
    if db_settled_client is None:
        raise HTTPException(status_code=404, detail="Settled client not found")
    
    db.delete(db_settled_client)
    db.commit()
    return db_settled_client

# Маршруты для работы с settling_services
@app.post("/settling-services/", response_model=schemas.SettlingService)
def create_settling_service(settling_service: schemas.SettlingServiceCreate, db: Session = Depends(get_db)):
    db_settling_service = models.SettlingService(**settling_service.dict())
    db.add(db_settling_service)
    db.commit()
    db.refresh(db_settling_service)
    return db_settling_service

@app.get("/settling-services/", response_model=List[schemas.SettlingService])
def read_settling_services(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    settling_services = db.query(models.SettlingService).offset(skip).limit(limit).all()
    return settling_services

@app.get("/settling-services/{settling_service_id}", response_model=schemas.SettlingService)
def read_settling_service(settling_service_id: int, db: Session = Depends(get_db)):
    settling_service = db.query(models.SettlingService).filter(models.SettlingService.SettlingID == settling_service_id).first()
    if settling_service is None:
        raise HTTPException(status_code=404, detail="Settling service not found")
    return settling_service

@app.put("/settling-services/{settling_service_id}", response_model=schemas.SettlingService)
def update_settling_service(settling_service_id: int, settling_service: schemas.SettlingServiceCreate, db: Session = Depends(get_db)):
    db_settling_service = db.query(models.SettlingService).filter(models.SettlingService.SettlingID == settling_service_id).first()
    if db_settling_service is None:
        raise HTTPException(status_code=404, detail="Settling service not found")
    
    for key, value in settling_service.dict().items():
        setattr(db_settling_service, key, value)
    
    db.commit()
    db.refresh(db_settling_service)
    return db_settling_service

@app.delete("/settling-services/{settling_service_id}", response_model=schemas.SettlingService)
def delete_settling_service(settling_service_id: int, db: Session = Depends(get_db)):
    db_settling_service = db.query(models.SettlingService).filter(models.SettlingService.SettlingID == settling_service_id).first()
    if db_settling_service is None:
        raise HTTPException(status_code=404, detail="Settling service not found")
    
    db.delete(db_settling_service)
    db.commit()
    return db_settling_service


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)




