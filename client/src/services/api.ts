
const API_URL = import.meta.env.VITE_API_URL 

// Helper function to handle API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Event services
export const eventService = {
  getAll: () => apiRequest('/events'),
  getById: (id: string) => apiRequest(`/events/${id}`),
  create: (event: any) => {
    const options: RequestInit = {
      method: 'POST',
    };
    
    if (event instanceof FormData) {
      options.body = event;
    } else {
      options.body = JSON.stringify(event);
    }
    
    return apiRequest('/events', options);
  },
  update: (id: string, event: any) => {
    const options: RequestInit = {
      method: 'PUT',
    };
    
    if (event instanceof FormData) {
      options.body = event;
    } else {
      options.body = JSON.stringify(event);
    }
    
    return apiRequest(`/events/${id}`, options);
  },
  delete: (id: string) => apiRequest(`/events/${id}`, {
    method: 'DELETE',
  }),
};

// Booking services
export const bookingService = {
  getMyBookings: () => apiRequest('/bookings/my-bookings'),
  createBooking: (eventId: string, tickets: number = 1) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify({ eventId, tickets }),
  }),
  cancelBooking: (id: string) => apiRequest(`/bookings/${id}`, {
    method: 'DELETE',
  }),
};
