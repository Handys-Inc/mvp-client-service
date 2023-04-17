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
        type: mongoose.Schema.Types.Decimal128
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

// Define the transform function for the schema
bookingSchema.set('toObject', {
    transform: function (doc, ret, options) {
      ret.totalCost = parseFloat(ret.totalCost.toString());
      ret.costBreakdown.grossAmount = parseFloat(ret.costBreakdown.grossAmount.toString());
      ret.costBreakdown.tax = parseFloat(ret.costBreakdown.tax.toString());
      ret.costBreakdown.serviceCharge = parseFloat(ret.costBreakdown.serviceCharge.toString());
    }
  });


const Booking = mongoose.model('Booking', bookingSchema);

module.exports.Booking = Booking;