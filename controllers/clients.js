const { Booking } = require('../models/booking');
const { Dispute } = require('../models/dispute');

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

exports.getServiceHistory = async (req, res, next) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);
    if(!isValid) return res.status(400).send("Invalid user id");

    let bookings = await Booking.find({user: user_id, jobStatus: "completed"});
    if(!bookings) return res.status(404).send("No bookings found");

    try {
        return res.status(200).send(bookings);
    } catch (error) {
        console.log(error);
    }
};

exports.createDispute = async (req, res) => {
    const userId = req.user_id;

    const disputeData = JSON.parse(req.body.jsonData);
    const files = req.files;

    const {bookingCode, disputeType, information} = disputeData;

    const filename = `disputes_${userId.toString()}`;

    try {
        const images = await Promise.all(
            files.map( async (file) => {
                const options = { public_id: filename, folder: 'disputes'};
                const cloudinaryResponse = await cloudinary.uploader.upload(file.path, options);
    
                return cloudinaryResponse.secure_url;
            }));
            
        const dispute = new Dispute({
            client: userId,
            bookingCode: bookingCode,
            disputeType: disputeType,
            information: information,
            disputeImages: images
        });

        try {
            await dispute.save();
            res.status(200).send({
                message: "Dispute created",
                dispute: dispute
            })
        } catch (error) {
            res.status(500).send(`Error creating dispute: ${error.message}`);
        }
    } catch (error) {
        
    }
};