const mongoose = require('mongoose');


const bookingSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ServiceProvider'
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'declined'],
        //default: 'pending'
    },
    dates: {
        start: { type: Date },
        end: { type: Date }
    },
    address: {
        city: {type: String},
        location: {type: String},
        number: {type: String},
        code: {type: String},
    },
    duration: {
        type: Number,
    },
    description: {
        type: String,
    },
    jobStatus: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
    },
    bookingCode: {
        type: String,
    },
    images: [
        {
            type: String,
            description: String
        }
    ],
    totalCost: {
        type: Number
    },
    costBreakdown : {
        grossAmount: { type: mongoose.Schema.Types.Decimal128},
        tax: { type: mongoose.Schema.Types.Decimal128},
        serviceCharge: { type: mongoose.Schema.Types.Decimal128}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
});


const Booking = mongoose.model('Booking', bookingSchema);

module.exports.Booking = Booking;