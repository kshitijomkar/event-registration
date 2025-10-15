import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import QRScannerPage from './pages/QRScannerPage';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans">
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="scanner" element={<QRScannerPage />} />
        </Route>
      </Routes>
    </div>
  );
}
export default App;