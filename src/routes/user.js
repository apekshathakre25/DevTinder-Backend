const { getAllPendingRequest, getAllConnections, feed } = require("../controllers/user")
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router()

router.get("/pending", authMiddleware, getAllPendingRequest)
router.get("/connections", authMiddleware, getAllConnections)
router.get("/feed", authMiddleware, feed)

module.exports = router;