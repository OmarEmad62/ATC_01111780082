
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <h1 className="text-9xl font-bold text-event-primary mb-4">404</h1>
      <p className="text-2xl font-medium text-gray-600 mb-8">Page not found</p>
      <p className="text-gray-500 max-w-md text-center mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent">
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
