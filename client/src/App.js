import React from 'react';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import BookingTable from './components/bookingTable';
import CleaningScheduleTable from './components/cleaningScheduleTable';
import ClientsTable from './components/clientsTable';
import EmployeesTable from './components/employeesTable';
import MaidsTable from './components/maidsTable';
import RoomsTable from './components/roomsTable';
import ServiceTable from './components/serviceTable';
import SettledClientsTable from './components/settledClientsTable';
import SettlingServiceTable from './components/settlingServiceTable.js';
import SettlingTable from './components/settlingTable';


function App() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f1f1f1' }}>
            <Navbar />
            <Routes>
                <Route path="/booking" element={<BookingTable />} />
                <Route path="/rooms" element={<RoomsTable />} />
                <Route path="/services" element={<ServiceTable />} />
                <Route path="/clients" element={<ClientsTable />} />
                <Route path="/employees" element={<EmployeesTable />} />
                <Route path="/maids" element={<MaidsTable />} />
                <Route path="/settling" element={<SettlingTable />} />
                <Route path="/settlingServices" element={<SettlingServiceTable />} />
                <Route path="/cleaningSchedule" element={<CleaningScheduleTable />} />
                <Route path="/settledClients" element={<SettledClientsTable />} />
    
                <Route path="/" />
            </Routes>
        </div>
    );
};

export default App;
