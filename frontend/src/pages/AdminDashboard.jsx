import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
    const location = useLocation();
    const getLinkClass = (path) => {
        const isActive = location.pathname === path || (location.pathname === '/admin' && path === '/admin/events');
        return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`;
    };

    return (
        <div className="container mx-auto py-12">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/4">
                    <h2 className="text-lg font-semibold tracking-tight mb-4">Admin Panel</h2>
                    <nav className="flex flex-row md:flex-col gap-2">
                        <NavLink to="/admin/events" className={getLinkClass('/admin/events')}>
                            Event Management
                        </NavLink>
                        <NavLink to="/admin/registrations" className={getLinkClass('/admin/registrations')}>
                            Registration Review
                        </NavLink>
                        <NavLink to="/admin/scanner" className={getLinkClass('/admin/scanner')}>
                            QR Scanner
                        </NavLink>
                    </nav>
                </aside>
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;