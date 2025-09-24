const { mongoose } = require("mongoose");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const getAllPendingRequest = async (req, res) => {
    try {
        const user = req.user;

        const pendingRequest = await ConnectionRequest.find({
            toUserId: user._id,
            status: "interested"
        }).populate("fromUserId", "firstName lastName photoUrl age gender about");

        res.status(200).json({
            message: "Pending requests fetched successfully",
            count: pendingRequest.length,
            data: pendingRequest
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Server error while fetching pending requests",
            error: error.message
        });
    }
};


const getAllConnections = async (req, res) => {
    try {
        const user = req.user;

        const allConnection = await ConnectionRequest.find({
            $or: [
                { fromUserId: user._id, status: "accepted" },
                { toUserId: user._id, status: "accepted" }
            ]
        })
            .populate("fromUserId", "firstName lastName photoUrl age gender about")
            .populate("toUserId", "firstName lastName photoUrl age gender about");

        const filteredConnections = allConnection.map(conn => {
            if (conn.fromUserId._id.toString() === user._id.toString()) {
                return conn.toUserId;
            } else {
                return conn.fromUserId;
            }
        });

        res.status(200).json({
            message: "Connections fetched successfully",
            count: filteredConnections.length,
            data: filteredConnections
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: "Server error while fetching connections",
            error: error.message
        });
    }
};


const feed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit
        const userId = req.user;

        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { fromUserId: userId._id },
                { toUserId: userId._id }
            ]
        }).select("fromUserId toUserId");

        const hideUserFromFeed = new Set()
        connectionRequest.forEach((connection) => {
            hideUserFromFeed.add(connection.fromUserId.toString())
            hideUserFromFeed.add(connection.toUserId.toString())
        })

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUserFromFeed) } },
                { _id: { $ne: userId._id } }
            ]
        }).select("firstName lastName photoUrl about skills gender age").skip(skip).limit(limit)

        return res.status(200).json({
            message: "Feed fetched successfully",
            data: users
        });
    } catch (error) {
        console.error("Feed error:", error.message);
        res.status(500).json({ message: "Server error while fetching feed", error: error.message });
    }
};



const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findById(userId).select("firstName lastName photoUrl age gender about");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error.message);
        res.status(500).json({ 
            message: "Server error while fetching user", 
            error: error.message 
        });
    }
};

module.exports = {
    getAllPendingRequest,
    getAllConnections,
    feed,
    getUserById,
};
