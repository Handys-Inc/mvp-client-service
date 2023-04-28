
const { ServiceProvider } = require("../models/serviceProvider");
const { User } = require("../models/user");
const { Booking } = require("../models/booking");

const { createBooking, createPayment } = require("../utilities/bookings");
const mongoose = require("mongoose");
const _ = require("lodash");
const { parse } = require('date-fns');

async function calculateCostBreakDown(cost, duration, providerRate) {
    const grossAmount = providerRate * duration;
    const tax = grossAmount * 0.05;
    const serviceCharge = 10;
    const totalCost = grossAmount + tax + serviceCharge;
    const providerAmount = totalCost - (serviceCharge + tax) ;
    
    
    let confirmCost = cost === totalCost ? true : false;
    if(!confirmCost) return false;
    else
        return { 
            grossAmount,
            tax,
            serviceCharge,
            providerAmount,
            totalCost
        }
}


exports.createBooking = async (req, res, next) => {
    const user = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user);
    if (!isValid) return res.status(400).send("Invalid user id");

    const bookingData = JSON.parse(req.body.jsonData);
    const bookingImages = req.files;

    const { client, serviceProvider, dates, address, duration, description, cost, paymentMethod } = bookingData;

    const { start, end } = dates;
    const { city, location, number, code} = address;

    const startDate = parse(start, 'dd-MM-yyyy', new Date());
    const endDate = end ? parse(end, 'dd-MM-yyyy', new Date()) : null;

    let provider_id =  new mongoose.Types.ObjectId(serviceProvider);

    try {
       
        let provider = await ServiceProvider.findOne({ user: provider_id  });
        if(!provider) return res.status(404).send("Service provider not found");

        //converting to object
        let providerObj = provider.toObject()

        //calculate cost breakdown
        const costBreakdown = await calculateCostBreakDown(cost, duration, providerObj.rate);

        if(costBreakdown === false) return res.status(400).send("Cost incorrect"); 

        let grossAmount = costBreakdown.grossAmount;
        let tax = costBreakdown.tax;
        let serviceCharge = costBreakdown.serviceCharge;
        let totalCost = costBreakdown.totalCost;
        let providerAmount = costBreakdown.providerAmount;


        const images = await Promise.all(
            bookingImages.map( async (file) => {
                const options = { public_id: `booking_${file.originalname}`, folder: 'disputes'};
                const cloudinaryResponse = await cloudinary.uploader.upload(file.path, options);
    
                return cloudinaryResponse.secure_url;
            }));

         //check what kind of booking the users can make - instant or reservation
        const bookingStatus = providerObj.bookingType === 'instant' ? 'confirmed' : 'pending';

        let newBooking = await createBooking({ client, serviceProvider, startDate, endDate, city, location, number, code, duration, description, bookingStatus, images, totalCost, grossAmount, tax, serviceCharge  });
        let newPayment = await createPayment({ booking: newBooking.bookingCode, cost, paymentMethod, serviceProvider, providerAmount });

        //get provider details
        //get main user id for provider
        let provider_user = providerObj.user;
        let pid = new mongoose.Types.ObjectId(provider_user);

        //let provider_id = new mongoose.Types.ObjectId(newBooking.bookingObject.serviceProvider)
        let providerName = await User.findOne({ _id: pid }).select('firstName lastName -_id');
        let bookingData = {
            serviceProvider: providerName,
            bookingCode: newBooking.bookingCode,
        }

        // TO-DO : send notification to service provider if status is pending

            if(newBooking && newPayment) {
                //return res.status(200).send(_.pick(newBooking, ["_id", "bookingCode", "client", "serviceProvider", "dates", "address", "duration", "description", "bookingStatus", "jobStatus", "images"]));
                return res.status(200).send(bookingData);
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

    const bookingCode = req.params.bookingCode;

    try {
        let booking = await Booking.findOne({$and: [{ bookingCode : bookingCode, jobStatus: 'pendingApproval' }]});
        if(!booking) return res.status(404).send("Booking not found");

        let approveCompletion = await Booking.findOneAndUpdate({bookingCode: req.params.code}, {
            $set: {
                jobStatus: "completed"
            }
        }, { new: true });

        if(approveCompletion.jobStatus === 'completed') return res.status(200).send({
            message: "Job completion approved successfully"});

        else return res.status(400).send("Job could not be completed");    
    } catch (error) {
        console.log(error);
    }

    
};

exports.checkCancellation = async (req, res, next) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);
    if(!isValid) return res.status(400).send("Invalid user id");

    const bookingCode = req.params.bookingCode;

    let booking = await Booking.findOne({bookingCode: bookingCode});
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

    const bookingCode = req.params.bookingCode;

    let booking = await Booking.findOne({bookingCode: bookingCode});
    if(!booking) return res.status(404).send("Booking not found");

    if(booking.status === "cancelled") return res.status(400).send("Booking already cancelled");

    try {
            let cancelBooking = await Booking.findOneAndUpdate({bookingCode: bookingCode}, {
                $set: {
                    jobStatus: "cancelled"
                }
            }, { new: true });
    
            if(cancelBooking.jobStatus === 'cancelled') return res.status(200).send({
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

    try {
        let bookings = await Booking.find({client: user_id});
        if(!bookings.length) return res.status(404).send("No bookings found");

        for(let i = 0; i < bookings.length; i++) {

            let booking = bookings[i];

            let provider = {};

            let provider_id = new mongoose.Types.ObjectId(booking.serviceProvider)
            let providerName = await User.findById(provider_id).select('firstName lastName');
            let providerDetails = await ServiceProvider.findOne({user: provider_id}).select('profilePicture serviceType rate experience');

            provider.name = providerName;
            provider.details = providerDetails;


            let client = await User.findById(booking.client).select('firstName lastName email');

            let updatedBooking = {
                ...booking.toObject(),
                provider,
                client
            };

            bookings[i] = updatedBooking;
        }

        return res.status(200).send(bookings);
        
    } catch (error) {
        console.log(error);
    }
};

//bookingStatus jobStatus
exports.getServiceHistoryByStatus = async (req, res, next) => {
    const user = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user);
    if (!isValid) return res.status(400).send("Invalid user id");

    const jobStatus = req.params.status;
    try {

        if(jobStatus === 'completed') {
            let bookings = await Booking.find({client: user, jobStatus: "completed"});
            if(!bookings.length) return res.status(404).send("No completed bookings found");

            for(let i = 0; i < bookings.length; i++) {

                let booking = bookings[i];
    
                let provider = {};
    
                let provider_id = new mongoose.Types.ObjectId(booking.serviceProvider)
                let providerName = await User.findById(provider_id).select('firstName lastName');
                let providerDetails = await ServiceProvider.findOne({user: provider_id}).select('profilePicture serviceType rate experience');
    
                provider.name = providerName;
                provider.details = providerDetails;
    
    
                let client = await User.findById(booking.client).select('firstName lastName email');
    
                let updatedBooking = {
                    ...booking.toObject(),
                    provider,
                    client
                };
                bookings[i] = updatedBooking;
            }
    
            return res.status(200).send(bookings);
        }

        else if(jobStatus === 'pending') {
            let bookings = await Booking.find({client: user, jobStatus: "pendingApproval"});
            if(!bookings.length) return res.status(404).send("No reservation requests found");
    
            for(let i = 0; i < bookings.length; i++) {

                let booking = bookings[i];
    
                let provider = {};
    
                let provider_id = new mongoose.Types.ObjectId(booking.serviceProvider)
                let providerName = await User.findById(provider_id).select('firstName lastName');
                let providerDetails = await ServiceProvider.findOne({user: provider_id}).select('profilePicture serviceType rate experience');
    
                provider.name = providerName;
                provider.details = providerDetails;
    
    
                let client = await User.findById(booking.client).select('firstName lastName email');
    
                let updatedBooking = {
                    ...booking.toObject(),
                    provider,
                    client
                };
                bookings[i] = updatedBooking;
            }
  
    
            return res.status(200).send(bookings);
        }

        else if(jobStatus === 'requests') {
            let bookings = await Booking.find({ client: user });
            if(!bookings.length) return res.status(404).send("No reservation requests found");
    
            for(let i = 0; i < bookings.length; i++) {

                let booking = bookings[i];
    
                let provider = {};
    
                let provider_id = new mongoose.Types.ObjectId(booking.serviceProvider)
                let providerName = await User.findById(provider_id).select('firstName lastName');
                let providerDetails = await ServiceProvider.findOne({user: provider_id}).select('profilePicture serviceType rate experience');
    
                provider.name = providerName;
                provider.details = providerDetails;
    
    
                let client = await User.findById(booking.client).select('firstName lastName email');
    
                let updatedBooking = {
                    ...booking.toObject(),
                    provider,
                    client
                };
                bookings[i] = updatedBooking;
            }
            return res.status(200).send(bookings);
        }
        
        else
            return res.status(400).send("Invalid job status");
    
        
    } catch (error) {
        console.log(error)
    }
};