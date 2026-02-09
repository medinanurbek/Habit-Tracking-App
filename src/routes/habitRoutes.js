const express = require('express');
const {
    listHabits,
    createHabit,
    getHabit,
    updateHabit,
    deleteHabit,
} = require('../controllers/habitController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth to all routes
router.use(authMiddleware);

router.route('/')
    .get(listHabits)
    .post(createHabit);

router.route('/:id')
    .get(getHabit)
    .put(updateHabit)
    .delete(deleteHabit);

module.exports = router;
