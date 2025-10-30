import mongoose from 'mongoose';

const participantSchema = mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  score: { type: Number, required: true, default: 0 },
});

const eventSchema = mongoose.Schema(
  {
    user: { // Which admin created this event
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['Individual', 'Team'],
    },
    status: {
      type: String,
      required: true,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    participants: [participantSchema],
    maxParticipants: { type: Number, required: true, default: 1 },
  },
  {
    timestamps: true, // This replaces createdAt and updatedAt
  }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;