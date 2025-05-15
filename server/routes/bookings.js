const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Create a booking
router.post('/', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    const tickets = 1; // Default to 1 ticket per booking

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has available tickets
    if (event.availableTickets < tickets) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    // Check if user has already booked this event
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      event: eventId
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this event' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      event: eventId,
      tickets,
      totalPrice: event.price * tickets
    });

    // Update event's available tickets
    event.availableTickets -= tickets;
    await event.save();
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Cancel a booking
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Update event's available tickets
    const event = await Event.findById(booking.event);
    event.availableTickets += booking.tickets;
    await event.save();

    // Remove booking
    await booking.deleteOne();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

module.exports = router; 