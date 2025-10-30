import mongoose from 'mongoose';

const studentSchema = mongoose.Schema(
  {
    user: { // To know which admin created this student
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    fullName: { type: String, required: true },
    class: { type: String, required: true },
    rollNumber: { type: String, required: true },
    phone: { type: String, required: true },
    house: {
      type: String,
      required: true,
      enum: ['Yellow', 'Blue', 'Green', 'Red'],
    },
    category: {
      type: String,
      required: true,
      enum: ['U13', 'U16', 'U19'],
    },
  },
  {
    timestamps: true, // This replaces createdAt and updatedAt
  }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;