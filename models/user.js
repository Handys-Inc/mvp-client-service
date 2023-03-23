const axios = require('axios');
const mongoose = require("mongoose");
require("dotenv").config();

async function fetchUserSchema() {
    const url = process.env.USER_SCHEMA;
    const response = await axios.get(url);
    return response.data;
}

const userSchema =  fetchUserSchema();

const UserSchema = new mongoose.Schema(userSchema);

const User = mongoose.model("User", UserSchema);

module.exports.User = User;