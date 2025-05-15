
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import Navbar from "@/components/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminEvents from "./pages/Admin/Events";
import EventForm from "./pages/Admin/EventForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <Home />
                  </>
                }
              />
              <Route
                path="/login"
                element={
                  <>
                    <Navbar />
                    <Login />
                  </>
                }
              />
              <Route
                path="/register"
                element={
                  <>
                    <Navbar />
                    <Register />
                  </>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <>
                    <Navbar />
                    <EventDetails />
                  </>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-success/:eventId"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <BookingSuccess />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="events/create" element={<EventForm />} />
                <Route path="events/edit/:id" element={<EventForm />} />
              </Route>

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <NotFound />
                  </>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
