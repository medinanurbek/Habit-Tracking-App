const Habit = require('../models/Habit');

// @desc    Get all habits for logged in user
// @route   GET /api/habits
// @access  Private
const listHabits = async (req, res, next) => {
    try {
        const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: habits.length,
            habits,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
const getHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ success: false, message: 'Habit not found' });
        }

        // Make sure user owns the habit
        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, habit });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;

        // Optional: simple validation for flexible fields if not handled by schema 'enum' strictness
        // logic...

        const habit = await Habit.create(req.body);

        res.status(201).json({
            success: true,
            habit,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update habit (general fields)
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res, next) => {
    try {
        let habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ success: false, message: 'Habit not found' });
        }

        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Determine if this is a "check-in" update (delta) or a general update
        if (req.body.delta !== undefined) {
            // Handle Increment/Decrement logic specifically
            const delta = Number(req.body.delta);

            // Calculate new count
            let newCount = (habit.todayCount || 0) + delta;
            if (newCount < 0) newCount = 0;

            // Logic to update streak/lastDoneDate
            // This logic mimics the frontend logic for consistency
            const now = new Date();
            const todayKey = now.toISOString().slice(0, 10);

            let streak = habit.streakDays || 0;
            const lastKey = habit.lastDoneDate ? habit.lastDoneDate.toISOString().slice(0, 10) : null;

            // If marking done (and it wasn't done before properly today? Logic is complex here)
            // Actually, simple streak logic:
            // If we are incrementing, update lastDoneDate to NOW
            // If it's a new day since last done, check if consecutive
            if (delta > 0) {
                habit.lastDoneDate = now;
                // Basic daily streak logic
                if (!lastKey) {
                    streak = 1;
                } else if (lastKey !== todayKey) {
                    const diffTime = Math.abs(now - new Date(lastKey));
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    // Note: this simple diff is rough. Better to compare date strings or set midnight.
                    // For now, let's trust the frontend logic or keep it simple: 
                    // If lastDone was yesterday, inc streak. If older, reset to 1. If today, keep.
                    // But wait, the frontend does this logic. Ideally backend should own it.
                    // let's apply the same logic as frontend:

                    const date1 = new Date(todayKey);
                    const date2 = new Date(lastKey);
                    const diff = (date1 - date2) / (1000 * 60 * 60 * 24);

                    if (diff === 1) streak += 1;
                    else if (diff > 1) streak = 1;
                    // if diff === 0, same day, do nothing to streak
                }
            }

            habit.todayCount = newCount;
            habit.streakDays = streak;
            // habit.lastDoneDate is updated above if delta > 0

            await habit.save();
        } else {
            // Normal update
            habit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });
        }

        res.status(200).json({ success: true, habit });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ success: false, message: 'Habit not found' });
        }

        if (habit.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await habit.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listHabits,
    getHabit,
    createHabit,
    updateHabit,
    deleteHabit,
};
