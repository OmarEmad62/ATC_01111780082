
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import { Calendar, LayoutDashboard, LogOut, Plus } from 'lucide-react';

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Create Event',
      path: '/admin/events/create',
      icon: <Plus className="h-5 w-5" />,
    },
    {
      title: 'Events',
      path: '/admin/events',
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-gray-100">
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="bg-event-light w-64 hidden md:block p-6 space-y-6 dark:bg-gray-800 dark:text-gray-100">
          <h2 className="text-xl font-bold text-event-primary mb-6 dark:text-event-light">Admin Panel</h2>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-event-primary text-white dark:bg-event-accent'
                    : 'text-gray-700 hover:bg-event-primary/10 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
            
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full text-left text-gray-700 hover:bg-red-100 dark:text-gray-300 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto dark:bg-gray-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
