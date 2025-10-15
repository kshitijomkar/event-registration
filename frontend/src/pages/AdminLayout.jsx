import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const MenuIcon = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path></svg>
);

const CloseIcon = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>
);


const AdminLayout = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const linkClass = ({ isActive }) => isActive 
        ? "block px-3 py-2 rounded-md text-base font-medium bg-primary text-primary-foreground" 
        : "block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted hover:text-foreground";

    return (
        <div>
            <nav className="bg-card border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 text-foreground font-bold text-lg">Admin Panel</div>
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    <NavLink to="/admin" end className={({isActive}) => isActive ? 'px-3 py-2 rounded-md text-sm font-medium bg-muted' : 'px-3 py-2 rounded-md text-sm font-medium hover:bg-muted'}>Dashboard</NavLink>
                                    <NavLink to="/admin/scanner" className={({isActive}) => isActive ? 'px-3 py-2 rounded-md text-sm font-medium bg-muted' : 'px-3 py-2 rounded-md text-sm font-medium hover:bg-muted'}>QR Scanner</NavLink>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted">Logout</button>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                            <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted focus:outline-none">
                                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <NavLink to="/admin" end className={linkClass} onClick={() => setMobileMenuOpen(false)}>Dashboard</NavLink>
                            <NavLink to="/admin/scanner" className={linkClass} onClick={() => setMobileMenuOpen(false)}>QR Scanner</NavLink>
                        </div>
                        <div className="pt-4 pb-3 border-t border-border">
                            <div className="px-2">
                                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-muted">Logout</button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <main>
                <div className="mx-auto max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;