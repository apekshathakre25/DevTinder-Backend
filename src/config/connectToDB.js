const mongoose = require("mongoose");

const connectToDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://apekshathakre25_db_user:AioSDLunOZqj69YV@cluster0.apfeurd.mongodb.net/");
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed:", error.message);
    }
};

module.exports = { connectToDb };
