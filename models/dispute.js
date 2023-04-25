const mongoose = require('mongoose');


const disputeSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        //required: true,
        ref: 'ServiceProvider'
    },
    bookingCode: {
        type: String,
        required: true,
        ref: 'Booking'
    },
    disputeType: {
        type: String,
        enum: ['poorQuality', 'harassment', 'unprofessional']
    },
    information: {
        type: String
    },
    disputeImages: [
        {
            type: String,
            description: String
        }
    ],
    resolvedFor: {
        type: String,
        enum: ['client', 'serviceProvider', 'none'],
        default: 'none',
    },
    disputeStatus: {
        type: String,
        enum: ['resolved', 'unresolved'],
        default: 'unresolved'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
});

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports.Dispute = Dispute;