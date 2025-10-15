import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const linkClass = ({ isActive }) => isActive 
        ? "px-3 py-2 rounded-md text-sm font-medium bg-gray-900 text-white" 
        : "px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white";

    return (
        <div>
            <nav className="bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 text-white font-bold">Admin Panel</div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <NavLink to="/admin" end className={linkClass}>Dashboard</NavLink>
                                    <NavLink to="/admin/scanner" className={linkClass}>QR Scanner</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;