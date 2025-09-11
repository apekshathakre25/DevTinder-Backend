const { sendConnectionRequest, reviewConnectionRequest } = require("../controllers/connectionRequest")
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router()

router.post("/send/:status/:toUserId", authMiddleware, sendConnectionRequest)
router.post("/review/:status/:requestId", authMiddleware, reviewConnectionRequest)

module.exports = router;