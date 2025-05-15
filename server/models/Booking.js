const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  tickets: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
});

// Ensure one user can't book the same event multiple times
bookingSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema); 