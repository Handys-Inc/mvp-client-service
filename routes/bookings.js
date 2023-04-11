const express = require("express");
require("dotenv").config();

const bookingController = require('../controllers/bookings');
const auth = require("../middleware/auth");


const router = express.Router();

const { storage } = require("../config/cloudinary.js");

const multer = require('multer');

const upload = multer({
    storage: storage
})


router.post("/:id/complete", auth, bookingController.markJobCompleted);
router.post("/", auth, upload.array('bookingImages'), bookingController.createBooking);
router.put("/:id/cancel", auth, bookingController.cancelBooking);
router.get("/:id/cancel", auth, bookingController.checkCancellation);
router.get("/history", auth, bookingController.getServiceHistory);
router.get("/history/:status", auth, bookingController.getServiceHistoryByStatus);



module.exports = router;