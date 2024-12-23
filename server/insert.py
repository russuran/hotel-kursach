import csv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Client, Room, Maid, Employee, Booking, Settling, Service, CleaningSchedule, SettledClient, SettlingService  # Импортируйте ваши модели
import random

# Настройки подключения к базе данных
DATABASE_URL = "postgresql://postgres:2005@localhost/hotel_data3"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

def insert_data_from_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.reader(file, delimiter='\t')
        names = []
        for row in reader:
            
            print(row)
            # if row[0].split(',')[0] not in names:
            #     names.append(row[0].split(',')[0])

            #     settling_service = SettlingService(
            #         Name=row[0].split(',')[0],
            #         SettlingID=row[1],
            #         Amount=row[2]
            #     )
            #     session.add(settling_service)

            client = Client(
                ClientID=row[0],
                FullName=row[1],
                Passport=row[4],
                Sex='Мужской' if row[3] == 'М' else 'Ж',
                Birthday=row[2],
                Phone=row[5],
            )
            session.add(client)
        session.commit()

file_path = 'data_insertions/clients.txt'
insert_data_from_file(file_path)
