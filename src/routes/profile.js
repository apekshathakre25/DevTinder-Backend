const { viewProfile, editProfile, updatePassword } = require("../controllers/profile")
const { authMiddleware } = require("../middleware/authMiddleware")
const express = require("express")

const router = express.Router()

router.get("/view", authMiddleware, viewProfile)
router.put("/edit", authMiddleware, editProfile)
router.put("/update-password", authMiddleware, updatePassword)

module.exports = router;