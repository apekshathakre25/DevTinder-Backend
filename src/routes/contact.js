const express = require("express");
const router = express.Router();
const { submitContactForm } = require("../controllers/contact.js");


router.post("/submit", submitContactForm);

module.exports = router;