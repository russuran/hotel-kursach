// Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static" style={{ marginBottom: '20px' }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Отельный Менеджмент
        </Typography>

        <Button color="inherit" >
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
        </Button>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
