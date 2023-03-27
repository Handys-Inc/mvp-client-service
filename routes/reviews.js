const express = require("express");
require("dotenv").config();

const reviewsController = require('../../mvp-service-provider/controllers/reviews');
const auth = require("../../mvp-service-provider/middleware/auth");


const router = express.Router();


router.post("/", auth, reviewsController.addReview);


module.exports = router;