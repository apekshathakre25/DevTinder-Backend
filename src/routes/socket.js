const express = require("express")
const { getUserDetailById } = require("../controllers/socket")
const router = express.Router()

router.get("/:toUserId", getUserDetailById)

module.exports = router;