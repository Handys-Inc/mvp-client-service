const {Booking} = require('../models/booking');

exports.cancelBooking = async (req, res, next) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);
    if(!isValid) return res.status(400).send("Invalid user id");

    let booking = await Booking.findById(req.params.id);
    if(!booking) return res.status(404).send("Booking not found");

    if(booking.status === "cancelled") return res.status(400).send("Booking already cancelled");

    try {
        if(booking.createdAt < Date.now() - 72 * 60 * 60 * 1000) {
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
        }
        else {
            let cancelBooking = await Booking.updateOne({_id: req.params.id}, {
                $set: {
                    jobStatus: "cancelled"
                }
            });
    
            if(cancelBooking) return res.status(200).send({
                message: "You will be charged a fee for cancelling after 72 hours. Booking cancelled successfully",
                booking: cancelBooking
            });
        }
        
    } catch (error) {
        console.log(error);
    } 
}