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

router.post("/dispute", auth, upload.array('disputeImages'), clientController.createDispute);




module.exports = router;