import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Student from '../models/studentModel.js';
import { z } from 'zod';

const router = express.Router();
router.use(protect);

const studentSchema = z.object({
  fullName: z.string().min(2),
  class: z.string(),
  uid: z.string(),
  phone: z.string().min(10),
  house: z.enum(['Yellow', 'Blue', 'Green', 'Red']),
  category: z.string()
});

router.get('/', async (req, res) => {
  const students = await Student.find({ user: req.user.id }).sort({ fullName: 1 });
  res.json(students);
});

router.post('/', async (req, res) => {
  try {
    studentSchema.parse(req.body);
    const student = new Student({ ...req.body, user: req.user.id });
    const createdStudent = await student.save();
    res.status(201).json(createdStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const studentsToCreate = req.body.students.map(s => ({ ...s, user: req.user.id }));
    const created = await Student.insertMany(studentsToCreate, { ordered: false });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: "Bulk upload failed. Check for duplicate UIDs." });
  }
});

router.delete('/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (student && student.user.toString() === req.user.id) {
    await student.deleteOne();
    res.json({ message: 'Student removed' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

export default router;