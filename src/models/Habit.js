const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Please add a habit title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot be more than 500 characters'],
            default: '',
        },
        area: {
            type: String,
            default: 'General',
            enum: ['General', 'Work', 'Health', 'Learning', 'Social', 'Other', 'Mind', 'Spirit'], // Adjusted to match typical usage or keep open if flexible
        },
        timeOfDay: {
            type: String,
            enum: ['Morning', 'Afternoon', 'Evening', 'Anytime'],
            default: 'Anytime',
        },
        targetPerDay: {
            type: Number,
            default: 1,
            min: [1, 'Target must be at least 1'],
        },
        icon: {
            type: String,
            default: 'flame',
        },
        todayCount: {
            type: Number,
            default: 0,
        },
        streakDays: {
            type: Number,
            default: 0,
        },
        lastDoneDate: {
            type: Date,
            default: null,
        },
        archived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Method to check if habit is done for the day (based on local logic, but useful helper)
habitSchema.methods.isDoneToday = function () {
    return this.todayCount >= this.targetPerDay;
};

module.exports = mongoose.model('Habit', habitSchema);
