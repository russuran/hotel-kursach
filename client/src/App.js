import React from 'react';
import Navbar from './components/Navbar';
import { Routes, Route, Outlet } from 'react-router-dom';
import BookingTable from './components/bookingTable';
import CleaningScheduleTable from './components/cleaningScheduleTable';
import ClientsTable from './components/clientsTable';
import EmployeesTable from './components/employeesTable';
import MaidsTable from './components/maidsTable';
import RoomsTable from './components/roomsTable';
import ServiceTable from './components/serviceTable';
import SettledClientsTable from './components/settledClientsTable';
import SettlingServiceTable from './components/settlingServiceTable';
import SettlingTable from './components/settlingTable';
import Login from './components/LoginForm';

import ProtectedRoute from './components/auth/protectedRoute';

function Nav() {
    return (
        <div>
            <Navbar />
            <Outlet />
        </div>
    );
}
function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f1f1f1' }}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Nav />}>
                    <Route path="/booking" element={<ProtectedRoute component={BookingTable} />} />
                    <Route path="/rooms" element={<ProtectedRoute component={RoomsTable} />}/>
                    <Route path="/services" element={<ProtectedRoute component={ServiceTable} />}/>
                    <Route path="/clients" element={<ProtectedRoute component={ClientsTable} />} />
                    <Route path="/employees" element={<ProtectedRoute component={EmployeesTable} />} />
                    <Route path="/maids" element={<ProtectedRoute component={MaidsTable} />} />
                    <Route path="/settling" element={<ProtectedRoute component={SettlingTable} />} />
                    <Route path="/settlingServices" element={<ProtectedRoute component={SettlingServiceTable} />} />
                    <Route path="/cleaningSchedule" element={<ProtectedRoute component={CleaningScheduleTable} />} />
                    <Route path="/settledClients" element={<ProtectedRoute component={SettledClientsTable} />} />
                </Route>
            </Routes>
        </div>
    );
};

export default App;
