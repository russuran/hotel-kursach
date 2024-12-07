from pydantic import BaseModel
from datetime import date
from typing import List, Optional, Any


class LoginSchema(BaseModel):
    login: str
    password: str

# Схема для клиента
class ClientBase(BaseModel):
    FullName: Any
    Birthday: Any
    Sex: Optional[Any] = None
    Passport: Optional[Any] = None
    Phone: Optional[Any] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    ClientID: int

    class Config:
        orm_mode = True

# Схема для комнаты
class RoomBase(BaseModel):
    Type: Any
    Size: Optional[Any] = None
    Price: Optional[Any] = None
    State: Optional[Any] = 'Свободен'
    Floor: Optional[Any] = 1

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    RoomID: int

    class Config:
        orm_mode = True

# Схема для бронирования
class BookingBase(BaseModel):
    RoomID: Any
    FullName: Any
    Phone: Any
    DateStart: Any
    DateEnd: Any

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    BookingID: int

    class Config:
        orm_mode = True

# Схема для заселения
class SettlingBase(BaseModel):
    RoomID: Any
    SettlingDate: Any
    OutDate: Any

class SettlingCreate(SettlingBase):
    pass

class Settling(SettlingBase):
    BookingNumber: Any
    SettlingDate: Optional[Any] = None

    class Config:
        orm_mode = True

# Схема для услуги
class ServiceBase(BaseModel):
    name: Any
    Description: Optional[Any] = None
    Price: Optional[Any] = None

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    class Config:
        orm_mode = True

# Схема для графика уборки
class CleaningScheduleBase(BaseModel):
    CleaningState: Optional[Any] = 'Не убрано'
    DateTime: Any
    RoomID: Any
    MaidID: Any

class CleaningScheduleCreate(CleaningScheduleBase):
    pass

class CleaningSchedule(CleaningScheduleBase):
    CleaningID: Any

    class Config:
        orm_mode = True

# Схема для settled_client
class SettledClientBase(BaseModel):
    ClientID: Any
    SettlingID: Any
    ClientRate: Optional[Any] = None

class SettledClientCreate(SettledClientBase):
    pass

class SettledClient(SettledClientBase):
    class Config:
        orm_mode = True

# Схема для Settling_service
class SettlingServiceBase(BaseModel):
    Name: Any
    SettlingID: Any
    Amount: Optional[Any] = 1

class SettlingServiceCreate(SettlingServiceBase):
    pass

class SettlingService(SettlingServiceBase):
    class Config:
        orm_mode = True

# Схема для работника (Employee)
class EmployeeBase(BaseModel):
    FullName: Any
    Position: Any
    Birthday: Any
    Login: Optional[Any] = None
    Password: Optional[Any] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    WorkerID: int

    class Config:
        orm_mode = True


class Maid(BaseModel):
    WorkerID: Any


class MaidCreate(Maid):
    pass