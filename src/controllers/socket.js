const socket = require("socket.io");
const User = require("../models/user");
const Chat = require("../models/chatSchema");

const onlineUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> Set of socketIds
const typingUsers = new Map(); // roomId -> Set of userIds who are typing

const initializedSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "https://dev-tinder-frontend-ruddy.vercel.app"
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        // Join a chat room
        socket.on("joinChat", async ({ firstName, _id, toUserId }) => {
            const room = [_id, toUserId].sort().join("-");
            console.log(`User ${firstName} joined room ${room}`);

            // Track online users
            onlineUsers.set(socket.id, _id);

            if (!userSockets.has(_id)) {
                userSockets.set(_id, new Set());
            }
            userSockets.get(_id).add(socket.id);

            // Notify others that this user is online
            socket.broadcast.emit("userOnline", { userId: _id });

            try {
                let chat = await Chat.findOne({
                    participants: { $all: [_id, toUserId] },
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [_id, toUserId],
                        messages: [],
                    });
                    await chat.save();
                }
            } catch (error) {
                console.error("Error creating/finding chat:", error);
            }

            socket.join(room);
        });

        // Send a message
        socket.on("sendMessage", async ({ text, senderId, senderName, toUserId }) => {
            const room = [senderId, toUserId].sort().join("-");

            try {
                const chat = await Chat.findOne({ participants: { $all: [senderId, toUserId] } });
                if (chat) {
                    const newMessage = { senderId, text };
                    chat.messages.push(newMessage);
                    await chat.save();

                    // Get the saved message with timestamp
                    const savedMessage = chat.messages[chat.messages.length - 1];
                    io.to(room).emit("messageReceived", {
                        senderId,
                        senderName,
                        text,
                        createdAt: savedMessage.createdAt,
                        seen: savedMessage.seen,
                        _id: savedMessage._id
                    });
                }
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        // Handle marking messages as seen
        socket.on("markAsSeen", async ({ senderId, toUserId }) => {
            const room = [senderId, toUserId].sort().join("-");

            try {
                const chat = await Chat.findOne({ participants: { $all: [senderId, toUserId] } });
                if (chat) {
                    let updated = false;
                    chat.messages.forEach(message => {
                        if (message.senderId.toString() === toUserId && !message.seen) {
                            message.seen = true;
                            updated = true;
                        }
                    });

                    if (updated) {
                        await chat.save();
                        // Emit to the sender that their messages have been seen
                        socket.to(room).emit("messagesSeen", {
                            fromUserId: senderId,
                            toUserId: toUserId
                        });
                    }
                }
            } catch (error) {
                console.error("Error marking messages as seen:", error);
            }
        });

        // Handle typing indicators
        socket.on("typing", ({ toUserId, isTyping }) => {
            const userId = onlineUsers.get(socket.id);
            if (!userId) return;

            const room = [userId, toUserId].sort().join("-");

            if (isTyping) {
                if (!typingUsers.has(room)) {
                    typingUsers.set(room, new Set());
                }
                typingUsers.get(room).add(userId);
            } else {
                if (typingUsers.has(room)) {
                    typingUsers.get(room).delete(userId);
                    if (typingUsers.get(room).size === 0) {
                        typingUsers.delete(room);
                    }
                }
            }

            // Emit typing status to the other user in the room
            socket.to(room).emit("userTyping", { userId, isTyping });
        });

        // Check if a specific user is online
        socket.on("checkUserStatus", ({ userId }) => {
            const isOnline = userSockets.has(userId) && userSockets.get(userId).size > 0;
            socket.emit(isOnline ? "userOnline" : "userOffline", { userId });
        });

        // Disconnect handling
        socket.on("disconnect", () => {
            const userId = onlineUsers.get(socket.id);
            console.log(`User disconnected: ${userId || socket.id}`);

            if (userId) {
                // Remove this socket from user's socket set
                if (userSockets.has(userId)) {
                    userSockets.get(userId).delete(socket.id);

                    // If user has no more active sockets, they're offline
                    if (userSockets.get(userId).size === 0) {
                        userSockets.delete(userId);
                        // Notify others that user is offline
                        socket.broadcast.emit("userOffline", { userId });

                        // Clear typing status for this user
                        for (const [room, typingSet] of typingUsers.entries()) {
                            if (typingSet.has(userId)) {
                                typingSet.delete(userId);
                                if (typingSet.size === 0) {
                                    typingUsers.delete(room);
                                }
                                // Notify room that user stopped typing
                                socket.to(room).emit("userTyping", { userId, isTyping: false });
                            }
                        }
                    }
                }
            }

            onlineUsers.delete(socket.id);
        });
    });
};

// Get user details by ID
const getUserDetailById = async (req, res) => {
    try {
        const { toUserId } = req.params;
        const user = await User.findById(toUserId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    initializedSocket,
    getUserDetailById,
};
