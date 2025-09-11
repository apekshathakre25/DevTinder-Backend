const ConnectionRequest = require("../models/connectionRequest");

const sendConnectionRequest = async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        if (fromUserId.equals(toUserId)) {
            return res.status(400).json({ message: "You cannot send a request to yourself" });
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({ message: "Connection request already exists" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        await connectionRequest.save();

        return res.status(201).json({ message: "Connection request sent successfully" });
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const reviewConnectionRequest = async (req, res) => {
    try {
        const userId = req.user._id;
        const requestId = req.params.requestId;
        const status = req.params.status;

        const ALLOWED_STATUS = ["accepted", "rejected"];
        if (!ALLOWED_STATUS.includes(status)) {
            return res.status(400).json({ message: "Only accept or reject is valid" });
        }

        const connectionRequest = await ConnectionRequest.findById(requestId);
        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        // only the receiver of the request can review it
        if (!connectionRequest.toUserId.equals(userId)) {
            return res.status(403).json({ message: "You are not authorized to review this request" });
        }

        if (connectionRequest.status !== "interested") {
            return res.status(400).json({ message: `Request already ${connectionRequest.status}` });
        }

        // update status
        connectionRequest.status = status;
        await connectionRequest.save();

        return res.status(200).json({ message: `Request ${status} successfully` });
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    sendConnectionRequest,
    reviewConnectionRequest
};
