const express = require("express")
const { getChatHistory, markMessagesAsSeen } = require("../controllers/chat")
const { authMiddleware } = require("../middleware/authMiddleware")
const router = express.Router()

router.get("/:toUserId", authMiddleware, getChatHistory);
router.put("/seen/:toUserId", authMiddleware, markMessagesAsSeen);

module.exports = router;