
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventService } from '@/services/api';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Event } from '@/types';
import { Check, Calendar, MapPin, Ticket } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import confetti from 'canvas-confetti';

const BookingSuccess = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Trigger confetti animation when component mounts
    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    };

    setTimeout(triggerConfetti, 500);

    const fetchEventDetails = async () => {
      if (!eventId) {
        navigate('/');
        return;
      }

      try {
        const eventData = await eventService.getById(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">Event not found</h1>
        <p className="text-gray-500 mt-4 dark:text-gray-400">The event you're looking for doesn't exist or has been removed.</p>
        <Button 
          onClick={() => navigate('/')} 
          className="mt-6 bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent"
        >
          Back to Events
        </Button>
      </div>
    );
  }

  // Default image if none is provided
  const imageUrl = event?.image === 'default-event.jpg' 
  ? `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80`
  : event?.image; // Directly use the Cloudinary URL stored in the database

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 dark:bg-green-900/30">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">
            Congratulations!
          </h1>
          <p className="text-lg md:text-xl text-gray-600 text-center mb-8 max-w-2xl dark:text-gray-300">
            Your ticket for <span className="font-semibold text-event-primary dark:text-event-light">{event.name}</span> has been confirmed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-1 h-64 md:h-auto">
            <div className="h-full w-full rounded-lg overflow-hidden">
              <img src={imageUrl} alt={event.name} className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-event-primary dark:text-event-light">{event.name}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-event-primary dark:text-event-light" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="font-medium dark:text-white">{formatDate(event.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-event-primary dark:text-event-light" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Venue</p>
                  <p className="font-medium dark:text-white">{event.venue}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Ticket className="h-5 w-5 mr-3 text-event-primary dark:text-event-light" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tickets</p>
                  <p className="font-medium dark:text-white">1</p>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="font-bold text-xl text-event-primary dark:text-event-light">
                  ${event.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto min-w-[150px] border-event-primary text-event-primary hover:bg-event-light hover:text-event-secondary dark:border-event-light dark:text-event-light dark:hover:bg-gray-800"
            >
              Browse Events
            </Button>
          </Link>
          <Link to="/bookings">
            <Button 
              className="w-full sm:w-auto min-w-[150px] bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent"
            >
              My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
