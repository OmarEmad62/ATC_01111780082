
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Booking, Event } from '@/types';

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getMyBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your bookings. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  const handleCancelBooking = async (id: string) => {
    try {
      setCancellingId(id);
      await bookingService.cancelBooking(id);
      
      // Remove the cancelled booking from the list
      setBookings(prevBookings => prevBookings.filter(booking => booking._id !== id));
      
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel the booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-event-primary to-event-secondary text-transparent bg-clip-text">
          My Bookings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all your event bookings in one place.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">You don't have any bookings yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Explore our events and book your first ticket.</p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent">
              Browse Events
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map(booking => {
            const event = booking.event as Event;
            
            return (
              <Card key={booking._id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="h-48 overflow-hidden relative">
                  <img 
                      src={
                        event.image && event.image !== 'default-event.jpg'
                          ? event.image  // Use Cloudinary URL directly
                          : `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80`
                      }
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    className={`absolute top-2 right-2 ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : booking.status === 'cancelled' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{event.name}</h3>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{event.venue}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Tickets</span>
                      <p className="font-medium dark:text-white">{booking.tickets}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                      <p className="font-bold text-event-primary dark:text-event-light">{formatCurrency(booking.totalPrice)}</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 flex justify-between dark:border-gray-700">
                  <Link to={`/events/${event._id}`}>
                    <Button 
                      variant="outline" 
                      className="border-event-primary text-event-primary dark:text-event-light dark:border-event-light hover:bg-event-light hover:text-event-secondary dark:hover:bg-gray-700"
                    >
                      View Event
                    </Button>
                  </Link>
                  
                  {booking.status === 'confirmed' && (
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-50 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id ? <LoadingSpinner size="sm" /> : 'Cancel'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
