
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Plus, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;
    
    try {
      setDeleteLoading(selectedEvent._id);
      await eventService.delete(selectedEvent._id);
      
      setEvents(events.filter(e => e._id !== selectedEvent._id));
      
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(null);
      setDeleteDialogOpen(false);
      setSelectedEvent(null);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-event-primary to-event-secondary text-transparent bg-clip-text">
          Manage Events
        </h1>
        <Link to="/admin/events/create">
          <Button className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent">
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No events available</h2>
            <p className="text-gray-500 mb-6">Start by creating your first event.</p>
            <Link to="/admin/events/create">
              <Button className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent">
                <Plus className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Venue</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Available / Capacity</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{event.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-normal">
                          {event.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{formatDate(event.date)}</td>
                      <td className="px-4 py-3 text-gray-600">{event.venue}</td>
                      <td className="px-4 py-3 text-right font-medium">${event.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={event.availableTickets === 0 ? 'text-red-500 font-medium' : ''}>
                          {event.availableTickets}
                        </span> / {event.capacity}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/events/edit/${event._id}`)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteClick(event)}
                            disabled={!!deleteLoading}
                          >
                            {deleteLoading === event._id ? <LoadingSpinner size="sm" /> : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the event "{selectedEvent?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={!!deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!!deleteLoading}
            >
              {deleteLoading ? <LoadingSpinner size="sm" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
