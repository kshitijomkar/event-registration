import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    // Simple check for token existence. For production, you might want to verify the token.
    return token ? children : <Navigate to="/admin/login" />;
};

export default PrivateRoute;