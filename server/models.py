from sqlalchemy import Column, Integer, String, Date, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from database import Base

# Модель Client
class Client(Base):
    __tablename__ = 'client'
    
    ClientID = Column(Integer, primary_key=True, index=True)
    FullName = Column(String, nullable=False)
    Birthday = Column(Date, nullable=False)
    Sex = Column(String(10))
    Passport = Column(Integer, unique=True)
    Phone = Column(Integer, unique=True)

    settled_clients = relationship("SettledClient", back_populates="client")

# Модель Room
class Room(Base):
    __tablename__ = 'Room'
    
    RoomID = Column(Integer, primary_key=True, index=True)
    Type = Column(String(50), nullable=False)
    Size = Column(Integer)
    Price = Column(DECIMAL(10, 2))
    State = Column(String(20), default='Свободен')
    Floor = Column(Integer, default=1)

    bookings = relationship("Booking", back_populates="room")
    settlings = relationship("Settling", back_populates="room")

# Модель Maid
class Maid(Base):
    __tablename__ = 'Maid'
    
    MaidID = Column(Integer, primary_key=True, index=True)
    WorkerID = Column(Integer, nullable=False)

    cleaning_schedules = relationship("CleaningSchedule", back_populates="maid")

# Модель Employee
class Employee(Base):
    __tablename__ = 'Employee'
    
    WorkerID = Column(Integer, primary_key=True, index=True)
    FullName = Column(String, nullable=False)
    Position = Column(String(100), nullable=False)
    Birthday = Column(Date)
    Login = Column(String(50), unique=True)
    Password = Column(String)

# Модель Booking
class Booking(Base):
    __tablename__ = 'Booking'
    
    BookingID = Column(Integer, primary_key=True, index=True)
    RoomID = Column(Integer, ForeignKey('Room.RoomID'), nullable=False)
    FullName = Column(String, nullable=False)
    Phone = Column(String, nullable=False)
    DateStart = Column(Date, nullable=False)
    DateEnd = Column(Date, nullable=False)

    room = relationship("Room", back_populates="bookings")

# Модель Settling
class Settling(Base):
    __tablename__ = 'Settling'
    
    BookingNumber = Column(Integer, primary_key=True, index=True)
    SettlingDate = Column(Date)
    OutDate = Column(Date, nullable=False)
    ServiceName = Column(String, nullable=False)
    RoomID = Column(Integer, ForeignKey('Room.RoomID'), nullable=False)

    room = relationship("Room", back_populates="settlings")
    settling_services = relationship("SettlingService", back_populates="settling")
    settled_clients = relationship("SettledClient", back_populates="settling")

# Модель Service
class Service(Base):
    __tablename__ = 'Service'
    
    name = Column(String, primary_key=True)
    Description = Column(String(500), nullable=True)
    Price = Column(DECIMAL(10, 2))

    settling_services = relationship("SettlingService", back_populates="service")

# Модель CleaningSchedule
class CleaningSchedule(Base):
    __tablename__ = 'CleaningSchedule'
    
    CleaningID = Column(Integer, primary_key=True, index=True)
    CleaningState = Column(String(50), default='Не убрано')
    DateTime = Column(Date, nullable=False)
    RoomID = Column(Integer, ForeignKey('Room.RoomID'), nullable=False)
    MaidID = Column(Integer, ForeignKey('Maid.MaidID'), nullable=False)

    maid = relationship("Maid", back_populates="cleaning_schedules")

# Модель SettledClient
class SettledClient(Base):
    __tablename__ = 'settled_client'
    
    ClientID = Column(Integer, ForeignKey('client.ClientID'), primary_key=True, nullable=False)
    SettlingID = Column(Integer, ForeignKey('Settling.BookingNumber'), primary_key=True, nullable=False)
    ClientRate = Column(Integer, nullable=True)

    client = relationship("Client", back_populates="settled_clients")
    settling = relationship("Settling", back_populates="settled_clients")

# Модель SettlingService
class SettlingService(Base):
    __tablename__ = 'Settling_service'
    
    Name = Column(String, ForeignKey('Service.name'), primary_key=True, nullable=False)
    SettlingID = Column(Integer, ForeignKey('Settling.BookingNumber'), primary_key=True, nullable=False)
    Amount = Column(Integer, default=1)

    settling = relationship("Settling", back_populates="settling_services")
    service = relationship("Service", back_populates="settling_services")
