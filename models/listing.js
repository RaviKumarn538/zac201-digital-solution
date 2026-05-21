const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    img: {
        type: String,
        default: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1560185127-6ed189bf02f4" : v,
    },
    price: Number,
    location: String,
    city: {
        type: String,
        default: "bhopal"
    }

    });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;