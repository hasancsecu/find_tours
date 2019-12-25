const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must belonging to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belonging to a user']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    price: {
        type: Number,
        require: [true, 'A booking must have a price']
    },
    paid: {
        type: Boolean,
        default: true
    }
});
bookingSchema.index({
    tour: 1,
    user: 1
}, {
    unique: true
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });
    next();
});
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;