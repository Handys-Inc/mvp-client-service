const { Booking } = require("../models/booking");
const { Payment } = require("../models/payment");
const crypto = require('crypto');

async function createBooking ({ client, serviceProvider, startDate, endDate, city, location, number, code, duration, description,  bookingStatus, images, totalCost, grossAmount, tax, serviceCharge}) {
    const bookingCode = await generateBookingCode();

    try{
        const booking = new Booking({
            client: client,
            serviceProvider: serviceProvider,
            bookingStatus: bookingStatus,
            "dates.start": startDate,
            "dates.end": endDate,
            "address.city": city,
            "address.location": location,
            "address.number": number,
            "address.code": code,
            duration: duration,
            description: description,
            jobStatus: 'active',
            bookingCode: bookingCode, 
            images : images,
            totalCost: totalCost,
            "costBreakdown.grossAmount": grossAmount,
            "costBreakdown.tax": tax,
            "costBreakdown.serviceCharge": serviceCharge
         });

        const savedBooking = await booking.save();
        const bookingObject = savedBooking.toObject();

        return {bookingObject, bookingCode};

        }
          
     catch (error) {
        console.log(error)
    }
}

async function generateBookingCode() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString();
        const hash = crypto.createHash('sha256').update(timestamp + random).digest('hex');
        let bookingCode =  `HA${hash.slice(0, 6)}`; 
        return bookingCode;
}

async function createPayment ({ booking, cost, paymentMethod, provider, providerAmount }) {
    try {
        const payment = new Payment({
            bookingCode: booking,
            amount: cost,
            paymentMethod: paymentMethod,
            status: 'pending',
            "providerPayout.provider": provider,
            "providerPayout.amount": providerAmount,
            "providerPayout.payoutStatus": "pending"
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
