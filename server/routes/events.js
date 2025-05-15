const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Event = require('../models/Event');
const Booking = require('../models/Booking'); 
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'event-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const upload = multer({ storage });

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'username');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'username');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create event (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      createdBy: req.user._id,
      image: req.file ? req.file.path : 'default-event.jpg',
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Update event (admin only)
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.image = req.file.path;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete all bookings associated with this event
    await Booking.deleteMany({ event: req.params.id });

    // Delete the event itself
    await event.deleteOne();

    res.json({ message: 'Event and related bookings deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

module.exports = router; 