const express = require("express");
require("dotenv").config();

const clientController = require('../controllers/clients');
const auth = require("../middleware/auth");


const router = express.Router();


router.put("/booking/:id/cancel", auth, clientController.cancelBooking);
router.get("/booking/:id/", auth, clientController.checkCancellation);




module.exports = router;