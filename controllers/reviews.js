const mongoose = require("mongoose");
const { Review } = require("../models/review");

exports.addReview = async (req, res, next) => {
    const user_id = req.user._id;
    let isValid = mongoose.Types.ObjectId.isValid(user_id);
    if (!isValid) return res.status(400).send("Invalid user id");

    const { provider_id, bookingCode, rate, comment } = req.body

    try {
       let review = new Review({
        user: user_id,
        serviceProvider: provider_id,
        bookingCode: bookingCode,
        rating: rate,
        comment: comment
       });

       await review.save();

       if (review) {
        return res.status(200).send({
            message: "Review successfully added",
            review: review
           })
       }
       else{
        return res.status(400).send("Adding review failed");
       }
        
    } catch (error) {
        console.log(error);
    }      
};