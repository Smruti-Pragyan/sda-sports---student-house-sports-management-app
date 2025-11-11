import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Event from '../models/eventModel.js';

const router = express.Router();

// All routes here are protected
router.use(protect);

// @desc    Get all events
// @route   GET /api/events
router.get('/', async (req, res) => {
  // FIX: Explicitly populate 'fullName' AND '_id' so frontend can correctly identify participants.
  const events = await Event.find({ user: req.user.id }).populate('participants.studentId', 'fullName _id');
  res.json(events);
});

// @desc    Create a new event
// @route   POST /api/events
router.post('/', async (req, res) => {
  const { name, type, status, maxParticipants } = req.body;

  if (!name || !type || !status || !maxParticipants) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  const event = new Event({
    ...req.body,
    user: req.user.id,
    participants: [],
  });

  const createdEvent = await event.save();
  res.status(201).json(createdEvent);
});

// @desc    Update an event (including participants)
// @route   PUT /api/events/:id
router.put('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event || event.user.toString() !== req.user.id) {
    return res.status(404).json({ message: 'Event not found' });
  }

  // Update logic from EventManagement.tsx
  const { name, type, status, maxParticipants, participants } = req.body;

  event.name = name || event.name;
  event.type = type || event.type;
  event.status = status || event.status;
  event.maxParticipants = maxParticipants ?? event.maxParticipants;
  event.participants = participants ?? event.participants; // This will update the participants array

  const updatedEvent = await event.save();
  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event || event.user.toString() !== req.user.id) {
    return res.status(404).json({ message: 'Event not found' });
  }

  await event.deleteOne();
  res.json({ id: req.params.id, message: 'Event removed' });
});

export default router;