const mongoose = require("mongoose");
const User = require("./user");

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    status: {
        type: String,
        enum: {
            values: ["interested", "ignored", "accepted", "rejected"],
            message: '{VALUE} is not a valid status',
        },
    }
}, { timestamps: true });

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 })

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;
