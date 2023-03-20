const mongoose = require('mongoose');
const User = require("./user"); //Client model
const ServiceProvider = require("./serviceProvider"); //ServiceProvider model


const ticketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'urgent'],
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
    },
    issue: {
        type: String,
    }
})