const axios = require('axios');
const mongoose = require("mongoose");


async function fetchBookingSchema () {
    const url = 'https://res.cloudinary.com/handys-ca/raw/upload/v1679289185/App-files/booking_hq9a48.js';
    const response = await axios.get(url);
    return response.data;
}

const bookingSchema =  fetchBookingSchema();

const BookingSchema = new mongoose.Schema(bookingSchema);

const Booking = mongoose.model("Booking", BookingSchema);

module.exports.Booking = Booking;