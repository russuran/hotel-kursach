import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ component: Component }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await axios.get('http://localhost:5000/me', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    console.log(token);
                    setIsAuthenticated(true);
                } catch (error) {
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <p>Загрузка</p>;
    }

    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute;