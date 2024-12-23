import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import DataTableComponent from './components/tables/datatable';
import { initializeConfigs } from './components/tables/config';
import Login from './components/LoginForm';
import ProtectedRoute from './components/auth/protectedRoute';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Toolbar, AppBar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Menu, MenuItem } from '@mui/material';

import 'primereact/resources/primereact.min.css';
import  'primereact/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';


function Nav() {
    const role = localStorage.getItem('role');

    let urls = {};
        if (role === 'Директор'){
            urls = {
            '/booking': 'Бронирование',
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
        if (role === 'Администратор') {
            urls['/rooms'] = 'Номера';
            urls['/booking'] = 'Бронирование';
            urls['/clients'] = 'Клиенты';
            urls['/settledClients'] = 'Заселение Клиента';
            urls['/services'] = 'Услуги';
            urls['/settling'] = 'Заселение';
            //urls['/employees'] = 'Сотрудники';
        };
    
        if (role === 'Менеджер') {
            urls['/clients'] = 'Клиенты';
            // urls['/rooms'] = 'Номера';
            // urls['/settling'] = 'Заселение';
            urls['/employees'] = 'Сотрудники';
            urls['/cleaningSchedule'] = 'Расписание Уборок';
            urls['/settlingServices'] = 'Услуги Заселения';
        };
    
        if (role === 'Горничная') {
            urls['/cleaningSchedule'] = 'Расписание Уборок';
        }
    
        if (role === 'Управляющий') {
            urls['/clients'] = 'Клиенты';
            urls['/rooms'] = 'Номера';
            urls['/cleaningSchedule'] = 'Расписание Уборок';
            urls['/settling'] = 'Заселение';
            urls['/employees'] = 'Сотрудники';
            urls['/services'] = 'Услуги';
        }



    const [user, setUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newUser, setNewUser] = useState({ login: '', password: '' });
    const [usersList, setUsersList] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const users = localStorage.getItem('user_list');
        if (users) {
            setUsersList(JSON.parse(users));
            setUser(JSON.parse(users)[0]);
            localStorage.setItem('token', JSON.parse(users)[0].token);
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/user_data', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUser(response.data);
            } catch (error) {
                console.error("Ошибка при получении данных пользователя:", error);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
        setUser(null);
    };

    const handleUserChange = (selectedUser) => {
        console.log(selectedUser);
        localStorage.setItem('token', selectedUser.token);
        localStorage.setItem('role', selectedUser.role);
        
        let urls = {};
        if (selectedUser.role === 'Директор'){
            urls = {
            '/booking': 'Бронирование',
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
        if (selectedUser.role === 'Администратор') {
            urls['/rooms'] = 'Номера';
            urls['/booking'] = 'Бронирование';
            urls['/clients'] = 'Клиенты';
            urls['/settledClients'] = 'Заселение Клиента';
            urls['/services'] = 'Услуги';
            urls['/employees'] = 'Сотрудники';
        };
    
        if (selectedUser.role === 'Менеджер') {
            urls['/clients'] = 'Клиенты';
            urls['/rooms'] = 'Номера';
            urls['/settling'] = 'Заселение';
            urls['/cleaningSchedule'] = 'Расписание Уборок';
            urls['/settlingServices'] = 'Услуги Заселения';
        };
    
        if (selectedUser.role === 'Горничная') {
            urls['/cleaningSchedule'] = 'Расписание Уборок';
        }
    
        if (selectedUser.role === 'Управляющий') {
            urls['/clients'] = 'Клиенты';
            urls['/rooms'] = 'Номера';
            urls['/cleaningSchedule'] = 'Расписание Уборок';
            urls['/settling'] = 'Заселение';
            urls['/services'] = 'Услуги';
        }

        navigate(Object.keys(urls)[0]);
        setUser(selectedUser);
        setAnchorEl(null);
        
    };

    const handleAddUser = () => {
        axios.post('http://localhost:5000/login', newUser)
            .then(response => {
                setUsersList([...usersList, { name: response.data.name, role: response.data.role, token: response.data.access_token }]);
                setNewUser({ login: '', password: '' });
                setOpenDialog(false);

                const list = JSON.parse(localStorage.getItem('user_list'));
                list.push({ name: response.data.name, role: response.data.role, token: response.data.access_token });

                localStorage.setItem('user_list', JSON.stringify(list));

                console.log(123, usersList);
                
            })
            .catch(error => {
                console.error("Ошибка при добавлении пользователя:", error);
            });
    };


    return (

        <div>
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
                </Toolbar>
            </AppBar>

            <Outlet />
            <>
            <Toolbar style={{ backgroundColor: '#2074d4', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => setOpenDialog(true)} 
                            style={{ marginRight: '10px' }}
                        >
                            +
                        </Button>
                        {user && (
                            <>
                                <Typography 
                                    variant="h6" 
                                    style={{ color: 'white', cursor: 'pointer' }} 
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                >
                                    {user.name} - {user.role}
                                </Typography>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={() => setAnchorEl(null)}
                                >
                                    {usersList.map((u, index) => (
                                        <MenuItem key={index} onClick={() => handleUserChange(u)}>
                                            {u.name} - {u.role}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                        )}
                    </div>
                    <Button color="inherit" onClick={handleLogout} style={{ color: 'white' }}>Выход</Button>
                </div>
            </Toolbar>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Добавить пользователя</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Логин"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newUser.login}
                        onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Пароль"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Отмена
                    </Button>
                    <Button onClick={handleAddUser} color="primary">
                    Добавить
                    </Button>
                </DialogActions>
            </Dialog>
        </>
        </div>
    );
}

function App() {
    const [configs, setConfigs] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            const initializedConfigs = await initializeConfigs();
            setConfigs(initializedConfigs);
            setLoading(false);
        };

        initialize();
    }, []);

    if (loading) {
        return <div>Загрузка...</div>; 
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f1f1f1' }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Nav />}>
                    <Route 
                        path="/booking" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.bookingConfig} />
                        } 
                    />
                    <Route 
                        path="/rooms" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.roomConfig} />
                        } 
                    />
                    <Route 
                        path="/services" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.serviceConfig} />
                        } 
                    />
                    <Route 
                        path="/clients" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.clientConfig} />
                        } 
                    />
                    <Route 
                        path="/employees" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.employeeConfig} />
                        } 
                    />
                    <Route 
                        path="/maids" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.maidConfig} />
                        } 
                    />
                    <Route 
                        path="/settling" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.settlingConfig} />
                        } 
                    />
                    <Route 
                        path="/settlingServices" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.settlingServiceConfig} />
                        } 
                    />
                    <Route 
                        path="/cleaningSchedule" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.cleaningScheduleConfig} />
                        } 
                    />
                    <Route 
                        path="/settledClients" 
                        element={
                            <ProtectedRoute component={DataTableComponent} config={configs.settledClientConfig} />
                        } 
                    />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
