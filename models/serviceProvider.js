const axios = require('axios');
const mongoose = require("mongoose");


async function fetchServiceProviderSchema () {
    const url = 'https://res.cloudinary.com/handys-ca/raw/upload/v1678739182/App-files/service-provider_bz68gf.js';
    const response = await axios.get(url);
    //console.log(response)
    return response.data;
}

const serviceProviderSchema =  fetchServiceProviderSchema();

const ServiceProviderSchema = new mongoose.Schema(serviceProviderSchema);

const ServiceProvider = mongoose.model("ServiceProvider", ServiceProviderSchema);

module.exports.ServiceProvider = ServiceProvider;