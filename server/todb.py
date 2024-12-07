from sqlalchemy.orm import Session
import models
from database import SessionLocal
from datetime import datetime

mdls = {
    'Бронирование': models.Booking,
    'Услуга': models.Service,
    'Клиент': models.Client,
    'Номер': models.Room,
    'Сотрудник': models.Employee,
    'Заселение': models.Settling,
    'Услуги заселения': models.SettlingService,
    'Горничная': models.Maid,
    'Расписание уборок': models.CleaningSchedule
}

# Создаем сессию для работы с базой данных
session = SessionLocal()
cols = ['Date', 'Time', 'RoomID', 'ServiceID', 'ClientID', 'EmployeeID', 'SettlingID', 'MaidID', 'CleaningID']
with open('./part1.txt', mode='r', encoding='utf-8') as f:
    rwd = f.readlines()
    model_to_work = None
    for row in rwd:
        row = row.strip().split('\t') 
        if len(row) == 1:
            print(row)
        if len(row) == 1 and row[0] in mdls:
            model_to_work = mdls[row[0]]
            
        elif model_to_work is not None and len(row) > 1 and row[0] not in cols:
            try:
                data = {}
                for col, val in zip(model_to_work.__table__.columns.keys(), row):
                    if 'Date' in col:
                        data[col] = datetime.strptime(val, '%Y-%m-%d').date()
                    else:
                        data[col] = val

                instance = model_to_work(**data)
                session.add(instance)
            except Exception as e:
                print(f"Ошибка при добавлении в {model_to_work.__tablename__}: {e}")


session.commit()
session.close()
