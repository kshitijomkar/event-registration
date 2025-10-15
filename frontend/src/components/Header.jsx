import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button'; // Import our new Button

const Header = () => {
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = (
        <>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Events</Link>
            {isAuthenticated && (
                <>
                    {isAdmin && <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Admin</Link>}
                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                </>
            )}
        </>
    );

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
                    Origin Club
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {navLinks}
                </nav>

                <div className="hidden md:flex items-center space-x-2">
                    {isAuthenticated ? (
                        <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                            <Button onClick={() => navigate('/register')}>Sign Up</Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t">
                    <nav className="flex flex-col space-y-4 p-4">
                        {navLinks}
                        <div className="border-t pt-4 flex flex-col space-y-2">
                            {isAuthenticated ? (
                                <Button variant="secondary" onClick={handleLogout}>Logout</Button>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>Login</Button>
                                    <Button onClick={() => { navigate('/register'); setIsMenuOpen(false); }}>Sign Up</Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;