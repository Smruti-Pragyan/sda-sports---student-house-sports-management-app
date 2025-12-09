import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import House from '../models/houseModel.js';

const router = express.Router();

router.use(protect);

// @desc    Get all house data (creates them if they don't exist)
// @route   GET /api/houses
// Helper to calculate event points for each house
import Event from '../models/eventModel.js';
router.get('/', async (req, res) => {
  const houseNames = ['Yellow', 'Blue', 'Green', 'Red'];
  try {
    // Ensure houses exist for user
    const housePromises = houseNames.map(name =>
      House.findOneAndUpdate(
        { user: req.user.id, name: name },
        { $setOnInsert: { initialPoints: 0, eventPoints: 0 } },
        { new: true, upsert: true }
      )
    );
    let houses = await Promise.all(housePromises);

    // Calculate event points for each house
    const events = await Event.find({ user: req.user.id });
    const pointsMap = { Yellow: 0, Blue: 0, Green: 0, Red: 0 };
    for (const event of events) {
      for (const p of event.participants) {
        if (p.studentId && p.score) {
          // Find student's house
          // Assume studentId is ObjectId, need to fetch student
          // For performance, you may want to cache students
          // But for now, fetch each
          const student = await import('../models/studentModel.js').then(m => m.default.findById(p.studentId));
          if (student && student.house) {
            pointsMap[student.house] += p.score;
          }
        }
      }
    }
    // Update eventPoints for each house
    houses = await Promise.all(houses.map(async house => {
      house.eventPoints = pointsMap[house.name] || 0;
      await house.save();
      return house;
    }));
    res.json(houses);
  } catch (error) {
    console.error("Error fetching/initializing houses:", error);
    res.status(500).json({ message: "Failed to fetch house data" });
  }
});

// @desc    Update house initial points
// @route   PUT /api/houses/:name
router.put('/:name', async (req, res) => {
  const { initialPoints, eventPoints } = req.body;
  const { name } = req.params;

  const updateFields = {};
  if (typeof initialPoints === 'number') updateFields.initialPoints = initialPoints;
  if (typeof eventPoints === 'number') updateFields.eventPoints = eventPoints;

  const house = await House.findOneAndUpdate(
    { user: req.user.id, name: name },
    updateFields,
    { new: true }
  );

  if (house) {
    res.json(house);
  } else {
    res.status(404).json({ message: 'House not found' });
  }
});

export default router;