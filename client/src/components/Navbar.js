// Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const role = localStorage.getItem('role');


  let urls = {};
  
  if (role === 'supervisor'){
    urls = {
      '/booking': 'Бонирование',
      '/rooms': 'Номера',
      '/services': 'Услуги',
      '/settling': 'Заселение',
      '/employees': 'Сотрудники',
      '/settledClients': 'Заселение Клиента',
      '/settlingServices': 'Услуги Заселения',
      '/cleaningSchedule': 'Расписание Уборок',
      '/clients': 'Клиенты',
    };
  }
  if (role === 'admin') {
    urls['/rooms'] = 'Номера';
    urls['/booking'] = 'Бронирование';
    urls['/clients'] = 'Клиенты';
    urls['/settledClients'] = 'Заселение Клиента';
    urls['/services'] = 'Услуги';
    urls['/employees'] = 'Сотрудники';
  };

  if (role === 'manager') {
    urls['/clients'] = 'Клиенты';
    urls['/rooms'] = 'Номера';
    urls['/settling'] = 'Заселение';
    urls['/settlingServices'] = 'Услуги Заселения';
  };

  if (role === 'maid') {
    urls['/cleaningSchedule'] = 'Услуги Заселения';
  }

  if (role === 'control') {
    urls['/clients'] = 'Клиенты';
    urls['/rooms'] = 'Номера';
    urls['/cleaningSchedule'] = 'Расписание Уборок';
    urls['/settling'] = 'Заселение';
    urls['/services'] = 'Услуги';
  }


  return (
    <AppBar position="static" style={{ marginBottom: '20px' }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Отельный Менеджмент
        </Typography>
        

        {Object.entries(urls).map(([url, label], index) => (
          <Button key={index} color="inherit">
            <Link style={{ textDecoration: 'none', color: 'white' }} to={url}>{label}</Link>
          </Button>
        ))}
        {/* <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/booking">Бронирование</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/rooms">Номера</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/services">Услуги</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/settling">Заселение</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/settlingServices">Услуги Заселения</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/clients">Клиенты</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/settledClients">Заселенный Клиент</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/maids">Горничные (Сотрудник)</Link>
        </Button>

        <Button color="inherit" >
          <Link style={{ textDecoration: 'none', color: 'white' }} to="/cleaningSchedule">Расписание Уборок</Link>
        </Button> */}

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
