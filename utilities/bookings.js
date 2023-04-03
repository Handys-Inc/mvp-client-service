const { Booking } = require("../models/booking");
const { Payment } = require("../models/payment");
const crypto = require('crypto');

async function createBooking ({ user, serviceProvider, startDate, endDate, address, duration, description,  bookingStatus, images}) {
    try {
        const bookingCode = await generateBookingCode();

         const booking = new Booking({
                client: user,
                serviceProvider: serviceProvider,
                bookingStatus: bookingStatus,
                "dates.start": startDate,
                "dates.end": endDate,
                address: address,
                status: 'active',
                duration: duration,
                description: description,
                bookingCode: bookingCode, 
                images : images
             });
    
            await booking.save();
            return booking
        
    } catch (error) {
        console.log(error)
    }
}

async function generateBookingCode() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString();
        const hash = crypto.createHash('sha256').update(timestamp + random).digest('hex');
        let bookingCode =  `HA${hash.slice(0, 6)}`; 
        console.log(bookingCode)
        return bookingCode;
}

async function createPayment ({ booking, cost, paymentMethod, paymentStatus }) {
    try {
        const payment = new Payment({
            bookingCode: booking,
            amount: cost,
            paymentMethod: paymentMethod,
            status: paymentStatus
        });

        await payment.save();
        return payment;
    } catch (error) {
        console.log(error);
    }
}


module.exports.createBooking = createBooking;
module.exports.generateBookingCode = generateBookingCode;
module.exports.createPayment = createPayment;
