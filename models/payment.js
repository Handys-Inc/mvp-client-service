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
    providerPayout: {
        provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceProvider' },
        amount: { type: mongoose.Schema.Types.Decimal128 },
        payoutStatus: { type: String, enum: ['pending', 'paid', 'refunded'] },
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports.Payment = Payment;