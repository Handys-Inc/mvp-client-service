const axios = require('axios');
const mongoose = require("mongoose");
require("dotenv").config();


async function fetchServiceProviderSchema () {
    const url = process.env.PROVIDER_SCHEMA;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

const serviceProviderSchema =  fetchServiceProviderSchema();

const ServiceProviderSchema = new mongoose.Schema(serviceProviderSchema);

const ServiceProvider = mongoose.model("ServiceProvider", ServiceProviderSchema);

module.exports.ServiceProvider = ServiceProvider;