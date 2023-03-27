const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
    bookingCode: {
        type: String,
        required: true,
        ref: 'Booking'
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
    },
    amount: {
        type: Number,
    },
    paymentMethod: {
        type: String,
        enum: ['paypal', 'card']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports.Payment = Payment;