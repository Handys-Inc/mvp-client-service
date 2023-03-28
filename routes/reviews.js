const express = require("express");
require("dotenv").config();

const reviewsController = require('../controllers/reviews');
const auth = require("../middleware/auth");


const router = express.Router();


router.post("/", auth, reviewsController.addReview);


module.exports = router;