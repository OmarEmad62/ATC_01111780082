
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { Event } from '@/types';
import { formatDate } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  isBooked?: boolean;
  onBook?: (eventId: string) => void;
  loading?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isBooked = false, 
  onBook,
  loading = false
}) => {
  // Function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle image URL
  const getImageUrl = () => {
    // Default image for null/undefined image
    if (!event.image) {
      return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    }
    
    // Default image for explicitly set default image
    if (event.image === 'default-event.jpg') {
      return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    }
    
    // For Cloudinary URLs, use them directly
    if (event.image.startsWith('http')) {
      return event.image;
    }
  };

  return (
    <Card className="event-card overflow-hidden h-full flex flex-col dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getImageUrl()} 
          alt={event.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <Badge 
          className="absolute top-2 right-2 bg-event-primary hover:bg-event-secondary"
        >
          {event.category}
        </Badge>
      </div>
      <CardContent className="pt-6 pb-2 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-1 dark:text-white">{event.name}</h3>
          <span className="font-bold text-event-primary dark:text-event-light">{formatPrice(event.price)}</span>
        </div>
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="text-sm">{formatDate(event.date)}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{event.venue}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{event.description}</p>
      </CardContent>
      <CardFooter className="border-t pt-4 dark:border-gray-700">
        <div className="w-full flex space-x-2">
          <Link to={`/events/${event._id}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-event-primary text-event-primary hover:bg-event-light hover:text-event-secondary dark:text-event-light dark:border-event-light dark:hover:bg-gray-700"
            >
              Details
            </Button>
          </Link>
          {isBooked ? (
            <Button 
              disabled
              className="flex-1 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
            >
              Booked
            </Button>
          ) : (
            <Button 
              onClick={() => onBook && onBook(event._id)}
              disabled={loading || event.availableTickets < 1}
              className={`flex-1 ${
                event.availableTickets < 1 
                  ? 'bg-gray-300 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400' 
                  : 'bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent text-white'
              }`}
            >
              {event.availableTickets < 1 ? 'Sold Out' : 'Book Now'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
