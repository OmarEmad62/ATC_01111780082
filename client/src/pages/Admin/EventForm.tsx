
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { eventService } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Event, EventFormData } from '@/types';
import { Upload, Image } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.string().min(1, { message: 'Please select a category' }),
  date: z.string().min(1, { message: 'Please select a date' }),
  venue: z.string().min(3, { message: 'Venue must be at least 3 characters' }),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
  capacity: z.coerce.number().min(1, { message: 'Capacity must be at least 1' }),
  availableTickets: z.coerce.number().optional(),
  tags: z.string().optional(),
  image: z.any().optional(),
});

const EventForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<EventFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      date: '',
      venue: '',
      price: 0,
      capacity: 1,
      availableTickets: undefined,
      tags: '',
      image: undefined,
    },
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const event = await eventService.getById(id);
          
          // Format the date for the input field (YYYY-MM-DDThh:mm)
          const date = new Date(event.date);
          const formattedDate = date.toISOString().slice(0, 16);
          
          form.reset({
            name: event.name,
            description: event.description,
            category: event.category,
            date: formattedDate,
            venue: event.venue,
            price: event.price,
            capacity: event.capacity,
            availableTickets: event.availableTickets,
            tags: event.tags.join(', '),
          });
          
          if (event.image && event.image !== 'default-event.jpg') {
           setImagePreview(event.image);
          }
        } catch (error) {
          console.error('Error fetching event:', error);
          toast({
            title: 'Error',
            description: 'Failed to load event data',
            variant: 'destructive',
          });
        } finally {
          setInitialLoading(false);
        }
      };

      fetchEvent();
    }
  }, [id, form, toast, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Error",
        description: "Only .jpg, .jpeg, .png and .webp formats are supported",
        variant: "destructive",
      });
      return;
    }

    // Set the file in the form
    form.setValue('image', file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);
      
      // Process tags from comma-separated string to array
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      
      // Create form data for file upload
      const formData = new FormData();
      Object.keys(processedData).forEach(key => {
        if (key === 'image' && processedData.image instanceof File) {
          formData.append('image', processedData.image);
        } else if (key === 'tags' && Array.isArray(processedData.tags)) {
          formData.append('tags', JSON.stringify(processedData.tags));
        } else {
          formData.append(key, processedData[key as keyof EventFormData]?.toString() || '');
        }
      });

      // If in edit mode, update the event
      if (isEditMode) {
        await eventService.update(id, formData);
        toast({
          title: 'Success',
          description: 'Event updated successfully',
        });
      } else {
        // If creating a new event, set availableTickets equal to capacity
        if (!processedData.availableTickets) {
          formData.set('availableTickets', processedData.capacity.toString());
        }
        
        await eventService.create(formData);
        toast({
          title: 'Success',
          description: 'Event created successfully',
        });
      }
      
      navigate('/admin/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: isEditMode ? 'Failed to update event' : 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl bg-gradient-to-r from-event-primary to-event-secondary text-transparent bg-clip-text">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </CardTitle>
          <CardDescription>
            {isEditMode ? 'Update the details of your event' : 'Fill in the details to create a new event'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your event" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Music">Music</SelectItem>
                          <SelectItem value="Sports">Sports</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter venue location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="availableTickets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Tickets</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder={isEditMode ? undefined : "Same as capacity"} 
                          {...field} 
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => {
                            if (e.target.value === '') {
                              field.onChange(undefined);
                            } else {
                              field.onChange(parseInt(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {!isEditMode && "Leave empty to set equal to capacity"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tags separated by commas" {...field} />
                    </FormControl>
                    <FormDescription>
                      E.g., "rock, live music, concert"
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Event Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="relative"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </Button>
                          <span className="text-sm text-gray-500">
                            JPG, PNG or WebP (max. 5MB)
                          </span>
                        </div>
                        {imagePreview && (
                          <div className="relative w-full max-w-md rounded-md overflow-hidden border">
                            <img
                              src={imagePreview}
                              alt="Event preview"
                              className="object-cover w-full h-48"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                              onClick={() => {
                                setImagePreview(null);
                                form.setValue('image', undefined);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image for your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin/events')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-event-primary to-event-secondary hover:from-event-secondary hover:to-event-accent"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : isEditMode ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;
