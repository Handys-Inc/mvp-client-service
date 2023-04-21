const mongoose = require('mongoose');


const refundSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    bookingCode: {
        type: String,
        required: true,
        ref: 'Booking'
    },
    reason: {
        type: String
    },
    refundStatus: {
        type: String,
        enum: ['requested', 'approved', 'denied'],
        default: 'requested'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },    
});

const Refund = mongoose.model('Refund', refundSchema);

module.exports.Refund = Refund;