import mongoose from 'mongoose';

const houseSchema = mongoose.Schema(
  {
    user: { // Links points to the specific admin user
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      enum: ['Yellow', 'Blue', 'Green', 'Red'],
    },
    initialPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    eventPoints: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can't have duplicate entries for the same house
houseSchema.index({ user: 1, name: 1 }, { unique: true });

const House = mongoose.model('House', houseSchema);
export default House;