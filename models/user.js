const axios = require('axios');
const mongoose = require("mongoose");


async function fetchUserSchema() {
    const url = 'https://res.cloudinary.com/handys-ca/raw/upload/v1678739182/App-files/user_ze7j1i.js';
    const response = await axios.get(url);
    //console.log(response)
    return response.data;
}

const userSchema =  fetchUserSchema();

const UserSchema = new mongoose.Schema(userSchema);

const User = mongoose.model("User", UserSchema);

module.exports.User = User;