const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        //required: true,
        ref: 'User'
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ServiceProvider'
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    bookingCode: {
        type: String,
        ref: 'Booking'
    },
    rating: {
        type: String,
        enum: ['like', 'dislike'],
        required: true,
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
});

const Review = mongoose.model('Review', reviewSchema);

module.exports.Review = Review;