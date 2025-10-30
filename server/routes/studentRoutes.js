import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Student from '../models/studentModel.js';

const router = express.Router();

// All routes here are protected
router.use(protect);

// @desc    Get all students
// @route   GET /api/students
router.get('/', async (req, res) => {
  // Only get students created by the logged-in user
  const students = await Student.find({ user: req.user.id }).sort({ fullName: 1 });
  res.json(students);
});

// @desc    Create a new student
// @route   POST /api/students
router.post('/', async (req, res) => {
  const { fullName, class: studentClass, rollNumber, phone, house, category } = req.body;

  if (!fullName || !studentClass || !rollNumber || !phone || !house || !category) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  const student = new Student({
    ...req.body,
    user: req.user.id,
  });

  const createdStudent = await student.save();
  res.status(201).json(createdStudent);
});

// @desc    Create students in bulk
// @route   POST /api/students/bulk
router.post('/bulk', async (req, res) => {
    const studentsData = req.body.students; // Expecting an array of student objects
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
        return res.status(400).json({ message: 'No student data provided' });
    }

    const studentsToCreate = studentsData.map(s => ({
        ...s,
        user: req.user.id,
    }));

    try {
        const createdStudents = await Student.insertMany(studentsToCreate);
        res.status(201).json(createdStudents);
    } catch (error) {
        res.status(400).json({ message: 'Error creating students', error });
    }
});

// @desc    Update a student
// @route   PUT /api/students/:id
router.put('/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);

  // Check if student exists and belongs to the user
  if (!student || student.user.toString() !== req.user.id) {
    return res.status(404).json({ message: 'Student not found' });
  }
  
  const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedStudent);
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student || student.user.toString() !== req.user.id) {
    return res.status(404).json({ message: 'Student not found' });
  }

  await student.deleteOne(); // Use deleteOne()
  res.json({ id: req.params.id, message: 'Student removed' });
});

// @desc    Delete students in bulk
// @route   DELETE /api/students/bulk
router.delete('/bulk', async (req, res) => {
    const { ids } = req.body; // Expecting an array of student IDs
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'No student IDs provided' });
    }

    try {
        // Ensure user can only delete their own students
        const result = await Student.deleteMany({
            _id: { $in: ids },
            user: req.user.id 
        });

        if (result.deletedCount === 0) {
             return res.status(404).json({ message: 'No matching students found to delete' });
        }

        res.json({ message: `${result.deletedCount} students deleted successfully`, deletedIds: ids });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting students', error });
    }
});

export default router;