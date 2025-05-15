
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { eventService, bookingService } from '@/services/api';
import EventCard from '@/components/EventCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { Event } from '@/types';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [bookedEventIds, setBookedEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await eventService.getAll();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchBookings = async () => {
        try {
          const bookings = await bookingService.getMyBookings();
          const eventIds = bookings.map((booking: any) => 
            typeof booking.event === 'string' ? booking.event : booking.event._id
          );
          setBookedEventIds(eventIds);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      };

      fetchBookings();
    }
  }, [isAuthenticated]);

  const handleBookEvent = async (eventId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to book this event.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      setBookingInProgress(eventId);
      await bookingService.createBooking(eventId);
      
      // Update booked events list
      setBookedEventIds(prev => [...prev, eventId]);
      
      // Update available tickets in events list
      setEvents(prev => 
        prev.map(event => 
          event._id === eventId 
            ? { ...event, availableTickets: event.availableTickets - 1 } 
            : event
        )
      );
      
      toast({
        title: 'Booking Successful',
        description: 'Your event has been booked successfully!',
      });
      
      // Navigate to the congratulations page
      navigate(`/booking-success/${eventId}`);
    } catch (error) {
      console.error('Error booking event:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to book the event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBookingInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-event-primary to-event-secondary text-transparent bg-clip-text">
          Discover Amazing Events
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto dark:text-gray-300">
          Find and book the best events happening around you. From concerts to workshops, we've got you covered.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No events available at the moment.</h2>
          <p className="text-gray-500 mt-2 dark:text-gray-400">Please check back later for upcoming events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              isBooked={bookedEventIds.includes(event._id)}
              onBook={handleBookEvent}
              loading={bookingInProgress === event._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
