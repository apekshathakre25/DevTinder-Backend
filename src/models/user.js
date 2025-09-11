const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 50,
        },
        lastName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        about: {
            type: String,
            default: "This is the new user"
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        photoUrl: {
            type: String,
            default: "https://i.pravatar.cc/150?img=3"
        },
        age: {
            type: Number,
            default: 0,
        },
        skills: {
            type: [String]
        }
    },
    {
        timestamps: true,
    }
);


const User = mongoose.model("User", userSchema);
module.exports = User;
