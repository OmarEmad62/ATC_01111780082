
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, bookingService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency, getCategoryColor } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { Calendar, MapPin, Tag, User, Ticket } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const eventData = await eventService.getById(id);
        setEvent(eventData);
        
        // Check if the user has already booked this event
        if (isAuthenticated) {
          try {
            const bookings = await bookingService.getMyBookings();
            const hasBooked = bookings.some((booking: any) => {
              const eventId = typeof booking.event === 'string' ? booking.event : booking.event._id;
              return eventId === id;
            });
            setIsBooked(hasBooked);
          } catch (error) {
            console.error('Error checking booking status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event details. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, isAuthenticated, toast]);

  const handleBookEvent = async () => {
    if (!id) return;
    
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
      setBookingLoading(true);
      await bookingService.createBooking(id);
      setIsBooked(true);
      
      // Update available tickets in the UI
      if (event) {
        setEvent({
          ...event,
          availableTickets: event.availableTickets - 1
        });
      }
      
      toast({
        title: 'Booking Successful',
        description: 'Your event has been booked successfully!',
      });
      
      // Navigate to the congratulations page
      navigate(`/booking-success/${id}`);
    } catch (error) {
      console.error('Error booking event:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to book the event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBookingLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-700">Event not found</h1>
        <p className="text-gray-500 mt-4">The event you're looking for doesn't exist or has been removed.</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden dark:bg-gray-800">
        <div className="relative h-60 sm:h-80 md:h-96">
          <img 
            src={imageUrl} 
            alt={event?.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4 sm:p-6">
            <Badge className={`${getCategoryColor(event?.category || '')} mb-4 self-start`}>
              {event?.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{event?.name}</h1>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Calendar className="h-5 w-5 mr-2 text-event-primary dark:text-event-light" />
              <span>{formatDate(event?.date || '')}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="h-5 w-5 mr-2 text-event-primary dark:text-event-light" />
              <span>{event?.venue}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Ticket className="h-5 w-5 mr-2 text-event-primary dark:text-event-light" />
              <span>{event?.availableTickets} tickets left</span>
            </div>
            {event?.createdBy && typeof event.createdBy !== 'string' && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <User className="h-5 w-5 mr-2 text-event-primary dark:text-event-light" />
                <span>By {event.createdBy.username}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 dark:text-white">Description</h2>
            <p className="text-gray-700 whitespace-pre-line dark:text-gray-300">{event?.description}</p>
          </div>

          {event?.tags && event.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2 flex items-center dark:text-white">
                <Tag className="h-4 w-4 mr-1 text-event-primary dark:text-event-light" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-event-primary text-event-primary dark:border-event-light dark:text-event-light">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-gray-600 mb-1 dark:text-gray-400">Ticket Price</p>
              <p className="text-2xl sm:text-3xl font-bold text-event-primary dark:text-event-light">{formatCurrency(event?.price || 0)}</p>
            </div>
            
            {isBooked ? (
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-md font-medium flex items-center dark:bg-green-900/30 dark:text-green-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Already Booked
              </div>
            ) : (
              <Button 
                onClick={handleBookEvent} 
                disabled={bookingLoading || (event?.availableTickets || 0) < 1}
                className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent disabled:from-gray-300 disabled:to-gray-400"
              >
                {bookingLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (event?.availableTickets || 0) < 1 ? (
                  'Sold Out'
                ) : (
                  'Book Now'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
