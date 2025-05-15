
export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Event {
  _id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  venue: string;
  price: number;
  image?: string;
  capacity: number;
  availableTickets: number;
  tags: string[];
  createdBy: string | User;
  createdAt: string;
}

export interface EventFormData {
  name: string;
  description: string;
  category: string;
  date: string;
  venue: string;
  price: number;
  capacity: number;
  availableTickets?: number;
  tags?: string;
  image?: File | string | null;
  [key: string]: any; // For FormData compatibility
}

export interface Booking {
  _id: string;
  user: string | User;
  event: string | Event;
  tickets: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}
