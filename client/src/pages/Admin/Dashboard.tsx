
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { eventService } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Event } from '@/types';
import { Plus, Calendar, Ticket, Tag, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

const AdminDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
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

    fetchEvents();
  }, [toast]);

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

  // Calculate some statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).length;
  
  const totalCapacity = events.reduce((acc, event) => acc + event.capacity, 0);
  const totalAvailableTickets = events.reduce((acc, event) => acc + event.availableTickets, 0);
  const totalSoldTickets = totalCapacity - totalAvailableTickets;
  
  const categories = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
          Admin Dashboard
        </h1>
        <Link to="/admin/events/create">
          <Button className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent">
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Events</CardTitle>
            <CardDescription>All events on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-event-primary mr-4" />
              <span className="text-3xl font-bold">{totalEvents}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Upcoming Events</CardTitle>
            <CardDescription>Events in the future</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-event-primary mr-4" />
              <span className="text-3xl font-bold">{upcomingEvents}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Tickets Sold</CardTitle>
            <CardDescription>Total bookings made</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-event-primary mr-4" />
              <span className="text-3xl font-bold">{totalSoldTickets}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Events by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-event-primary mr-2" />
                    <span>{category}</span>
                  </div>
                  <span className="font-medium">{count} events</span>
                </div>
              ))}
              {Object.keys(categories).length === 0 && (
                <p className="text-gray-500">No categories available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Recently added events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 5).map(event => (
                <div key={event._id} className="flex items-center justify-between">
                  <div className="truncate max-w-[70%]">
                    <span className="font-medium">{event.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/admin/events/edit/${event._id}`}>
                      <Button variant="outline" size="sm" className="border-event-primary text-event-primary hover:bg-event-light">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteClick(event)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-gray-500">No events available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>Manage your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Venue</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Capacity</th>
                  <th className="px-4 py-2 text-right">Available</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/60 dark:border-gray-700">
                    <td className="px-4 py-3">{event.name}</td>
                    <td className="px-4 py-3">{event.category}</td>
                    <td className="px-4 py-3">{formatDate(event.date)}</td>
                    <td className="px-4 py-3">{event.venue}</td>
                    <td className="px-4 py-3 text-right">${event.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{event.capacity}</td>
                    <td className="px-4 py-3 text-right">{event.availableTickets}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link to={`/admin/events/edit/${event._id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteClick(event)}
                          disabled={!!deleteLoading}
                        >
                          {deleteLoading === event._id ? <LoadingSpinner size="sm" /> : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      No events available. Create your first event to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 dark:text-red-400">
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

export default AdminDashboard;
