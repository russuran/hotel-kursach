from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# Схема для клиента
class ClientBase(BaseModel):
    FullName: str
    Birthday: datetime
    Sex: Optional[str] = None
    Passport: Optional[int] = None
    Phone: Optional[int] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    ClientID: int

    class Config:
        orm_mode = True

# Схема для комнаты
class RoomBase(BaseModel):
    Type: str
    Size: Optional[int] = None
    Price: Optional[float] = None
    State: Optional[str] = 'Свободен'
    Floor: Optional[int] = 1

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    RoomID: int

    class Config:
        orm_mode = True

# Схема для бронирования
class BookingBase(BaseModel):
    RoomID: int
    FullName: str
    Phone: str
    DateStart: datetime
    DateEnd: datetime

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    BookingID: int

    class Config:
        orm_mode = True

# Схема для заселения
class SettlingBase(BaseModel):
    RoomID: int
    ServiceName: str
    OutDate: datetime

class SettlingCreate(SettlingBase):
    pass

class Settling(SettlingBase):
    BookingNumber: int
    SettlingDate: Optional[datetime] = None

    class Config:
        orm_mode = True

# Схема для услуги
class ServiceBase(BaseModel):
    name: str
    Description: Optional[str] = None
    Price: Optional[float] = None

class ServiceCreate(ServiceBase):
    pass

class Service(ServiceBase):
    class Config:
        orm_mode = True

# Схема для графика уборки
class CleaningScheduleBase(BaseModel):
    CleaningState: Optional[str] = 'Не убрано'
    DateTime: datetime
    RoomID: int
    MaidID: int

class CleaningScheduleCreate(CleaningScheduleBase):
    pass

class CleaningSchedule(CleaningScheduleBase):
    CleaningID: int

    class Config:
        orm_mode = True

# Схема для settled_client
class SettledClientBase(BaseModel):
    ClientID: int
    SettlingID: int
    ClientRate: Optional[int] = None

class SettledClientCreate(SettledClientBase):
    pass

class SettledClient(SettledClientBase):
    class Config:
        orm_mode = True

# Схема для Settling_service
class SettlingServiceBase(BaseModel):
    Name: str
    SettlingID: int
    Amount: Optional[int] = 1

class SettlingServiceCreate(SettlingServiceBase):
    pass

class SettlingService(SettlingServiceBase):
    class Config:
        orm_mode = True

# Схема для работника (Employee)
class EmployeeBase(BaseModel):
    FullName: str
    Position: str
    Birthday: datetime
    Login: Optional[str] = None
    Password: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    WorkerID: int

    class Config:
        orm_mode = True
