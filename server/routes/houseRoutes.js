import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import House from '../models/houseModel.js';

const router = express.Router();

router.use(protect);

// @desc    Get all house data (creates them if they don't exist)
// @route   GET /api/houses
router.get('/', async (req, res) => {
  const houseNames = ['Yellow', 'Blue', 'Green', 'Red'];
  
  // Find existing houses for this user
  let houses = await House.find({ user: req.user.id });

  // If any house is missing (first time run), create it
  if (houses.length < 4) {
    for (const name of houseNames) {
      const exists = houses.find(h => h.name === name);
      if (!exists) {
        await House.create({
          user: req.user.id,
          name: name,
          initialPoints: 0
        });
      }
    }
    // Re-fetch to get the complete list
    houses = await House.find({ user: req.user.id });
  }

  res.json(houses);
});

// @desc    Update house initial points
// @route   PUT /api/houses/:name
router.put('/:name', async (req, res) => {
  const { initialPoints } = req.body;
  const { name } = req.params;

  const house = await House.findOneAndUpdate(
    { user: req.user.id, name: name },
    { initialPoints },
    { new: true }
  );

  if (house) {
    res.json(house);
  } else {
    res.status(404).json({ message: 'House not found' });
  }
});

export default router;