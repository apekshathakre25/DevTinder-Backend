const { getAllPendingRequest, getAllConnections, feed, getUserById } = require("../controllers/user")
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router()

router.get("/pending", authMiddleware, getAllPendingRequest)
router.get("/connections", authMiddleware, getAllConnections)
router.get("/feed", authMiddleware, feed)
router.get("/:userId", authMiddleware, getUserById)

module.exports = router;