
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-event-primary to-event-secondary text-transparent bg-clip-text">
              Event Nexus
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-event-primary transition-colors dark:text-gray-300 dark:hover:text-event-light">
              Home
            </Link>
            {isAuthenticated && (
              <Link to="/bookings" className="text-gray-600 hover:text-event-primary transition-colors dark:text-gray-300 dark:hover:text-event-light">
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-event-primary transition-colors dark:text-gray-300 dark:hover:text-event-light">
                Admin
              </Link>
            )}
            <ThemeToggle />
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-event-primary text-event-primary hover:bg-event-light hover:text-event-secondary dark:border-event-light dark:text-event-light dark:hover:bg-gray-800"
              >
                Logout
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline"
                    className="border-event-primary text-event-primary hover:bg-event-light hover:text-event-secondary dark:border-event-light dark:text-event-light dark:hover:bg-gray-800"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="default"
                    className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent text-white"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-event-primary hover:bg-gray-100 dark:text-gray-300 dark:hover:text-event-light dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-event-primary px-3 py-2 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:text-event-light dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/bookings" 
                className="text-gray-600 hover:text-event-primary px-3 py-2 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:text-event-light dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-gray-600 hover:text-event-primary px-3 py-2 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:text-event-light dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full border-event-primary text-event-primary hover:bg-event-light hover:text-event-secondary dark:border-event-light dark:text-event-light dark:hover:bg-gray-800"
                >
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="outline"
                      className="w-full border-event-primary text-event-primary hover:bg-event-light hover:text-event-secondary dark:border-event-light dark:text-event-light dark:hover:bg-gray-800"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant="default"
                      className="w-full bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent text-white"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
