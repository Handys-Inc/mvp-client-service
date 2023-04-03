
const { ServiceProvider } = require("../models/serviceProvider");
const { User } = require("../models/user");
const { Booking } = require("../models/booking");

const { createBooking, createPayment } = require("../utilities/bookings");
const mongoose = require("mongoose");


exports.createBooking = async (req, res, next) => {
    const user = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user);
    if (!isValid) return res.status(400).send("Invalid user id");

    const bookingData = JSON.parse(req.body.jsonData);
    const bookingImages = req.files;

    const { client, serviceProvider, dates, address, duration, description, cost, paymentMethod, paymentStatus } = bookingData;

    const { start, end } = dates;
    let startNew = new Date(start);
    let endNew = new Date(end);

    const startDate = startNew.toISOString();
    const endDate = endNew ? endNew.toISOString() : null;
;

    try {
        //check what kind of booking the users can make - instant or reservation
        let provider = await ServiceProvider.findById(serviceProvider);
        if(!provider) return res.status(404).send("Service provider not found");

        const images = await Promise.all(
            bookingImages.map( async (file) => {
                const options = { public_id: `booking_${file.originalname}`, folder: 'disputes'};
                const cloudinaryResponse = await cloudinary.uploader.upload(file.path, options);
    
                return cloudinaryResponse.secure_url;
            }));

        const bookingStatus = provider.bookingType === 'instant' ? 'confirmed' : 'pending';

        let newBooking = await createBooking({ client, serviceProvider, startDate, endDate, address, duration, description, bookingStatus, images  });
        let newPayment = await createPayment({ booking: newBooking.bookingCode, cost, paymentMethod, paymentStatus });

        // TO-DO : send notification to service provider if status is pending

            if(newBooking && newPayment) {
                return res.status(200).send(_.pick(newBooking, ["_id", "bookingCode", "client", "serviceProvider", "dates", "address", "duration", "description", "bookingStatus", "jobStatus", "images"]));
            }
            else {
                return res.status(400).send("Booking failed");
            } 
        }
        
        catch (error) {
        console.log(error);
    }    
};

exports.markJobCompleted = async (req, res, next) => {
    const user = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user);
    if (!isValid) return res.status(400).send("Invalid user id");

    let booking = await Booking.findById(req.params.id);
    if(!booking) return res.status(404).send("Booking not found");

    let updateJob = await Booking.updateOne({_id: req.params.id}, {
        $set: {
            jobStatus: "completed"
        }
    });

    if(updateJob) return res.status(200).send("Job completed successfully");
    else return res.status(400).send("Job could not be completed");    
};

exports.checkCancellation = async (req, res, next) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);
    if(!isValid) return res.status(400).send("Invalid user id");

    let booking = await Booking.findById(req.params.id);
    if(!booking) return res.status(404).send("Booking not found");

    if(booking.status === "cancelled") return res.status(400).send("Booking already cancelled");

    try {
        if(booking.createdAt < Date.now() - 72 * 60 * 60 * 1000) return res.status(200).send("Booking can be cancelled without charges");
        else return res.status(200).send("You will be charged a fee for cancelling after 72 hours");

    } catch (error) {
        console.log(error);
    }
}

exports.cancelBooking = async (req, res, next) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);
    if(!isValid) return res.status(400).send("Invalid user id");

    let booking = await Booking.findById(req.params.id);
    if(!booking) return res.status(404).send("Booking not found");

    if(booking.status === "cancelled") return res.status(400).send("Booking already cancelled");

    try {
            let cancelBooking = await Booking.updateOne({_id: req.params.id}, {
                $set: {
                    jobStatus: "cancelled"
                }
            });
    
            if(cancelBooking) return res.status(200).send({
                message: "Booking cancelled successfully",
                booking: cancelBooking
            });
    
            else return res.status(400).send("Booking could not be cancelled");
        
    } catch (error) {
        console.log(error);
    } 
}

exports.getServiceHistory = async (req, res, next) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);
    if(!isValid) return res.status(400).send("Invalid user id");

    let bookings = await Booking.find({client: user_id, jobStatus: "completed"});
    if(!bookings) return res.status(404).send("No bookings found");

    try {
        return res.status(200).send(bookings);
    } catch (error) {
        console.log(error);
    }
};