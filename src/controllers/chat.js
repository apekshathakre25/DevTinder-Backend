const Chat = require("../models/chatSchema");

const getChatHistory = async (req, res) => {
    try {
        const { toUserId } = req.params;
        const { _id: loggedInUserId } = req.user;

        
        const chat = await Chat.findOne({
            participants: { $all: [loggedInUserId, toUserId] },
        });

        if (!chat) {
            return res.json({ messages: [] }); 
        }

        return res.json({ messages: chat.messages });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const markMessagesAsSeen = async (req, res) => {
    try {
        const { toUserId } = req.params;
        const { _id: loggedInUserId } = req.user;

        const chat = await Chat.findOne({
            participants: { $all: [loggedInUserId, toUserId] },
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Mark all messages from toUserId as seen
        let updatedCount = 0;
        chat.messages.forEach(message => {
            if (message.senderId.toString() === toUserId && !message.seen) {
                message.seen = true;
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            await chat.save();
        }

        return res.json({ 
            message: "Messages marked as seen", 
            updatedCount 
        });
    } catch (error) {
        console.error("Error marking messages as seen:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getChatHistory,
    markMessagesAsSeen,
};
