const { Booking } = require('../models/booking');
const { Dispute } = require('../models/dispute');
const cloudinary = require('cloudinary').v2;
const mongoose = require("mongoose");

exports.createDispute = async (req, res) => {
    const userId = req.user_id;
    let isValid = mongoose.Types.ObjectId.isValid(userId);
    if (!isValid) return res.status(400).send("Invalid user id");

    const disputeData = JSON.parse(req.body.jsonData);
    const files = req.files;

    const {bookingCode, disputeType, information} = disputeData;

    try {
        const images = await Promise.all(
            files.map( async (file) => {
                const options = { public_id: `dispute_${file.originalname}`, folder: 'disputes'};
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