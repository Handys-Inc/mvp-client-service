const express = require("express");
require("dotenv").config();

const clientController = require('../controllers/clients');
const auth = require("../middleware/auth");


const router = express.Router();

const { storage } = require("../config/cloudinary.js");

const multer = require('multer');

const upload = multer({
    storage: storage
})


router.put("/booking/:id/cancel", auth, clientController.cancelBooking);
router.get("/booking/:id/", auth, clientController.checkCancellation);
router.get("/history", auth, clientController.getServiceHistory);
router.post("/dispute", auth, upload.array('disputeImages'), clientController.createDispute);




module.exports = router;