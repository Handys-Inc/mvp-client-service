const axios = require('axios');
const mongoose = require("mongoose");
require("dotenv").config();


async function fetchBookingSchema () {
    const url = process.env.BOOKING_SCHEMA;
    const response = await axios.get(url);
    return response.data;
}

const bookingSchema =  fetchBookingSchema();

const BookingSchema = new mongoose.Schema(bookingSchema);

const Booking = mongoose.model("Booking", BookingSchema);

module.exports.Booking = Booking;