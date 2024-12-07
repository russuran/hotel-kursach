import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Outlet } from 'react-router-dom';
import DataTableComponent from './components/tables/datatable';
import { initializeConfigs } from './components/tables/config';
import Login from './components/LoginForm';
import ProtectedRoute from './components/auth/protectedRoute';
import 'primereact/resources/primereact.min.css';
import  'primereact/resources/themes/saga-blue/theme.css';
import 'primeicons/primeicons.css';

function Nav() {
    return (
        <div>
            <Navbar />
            <Outlet />
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
