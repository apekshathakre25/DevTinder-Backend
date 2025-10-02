const Contact = require("../models/contact.js");

const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message, category } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, subject, and message are required"
            });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Validate category if provided
        const validCategories = ["general", "support", "business", "feedback", "bug", "feature"];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category provided"
            });
        }

        // Create contact object
        const contactData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            category: category || "general"
        };

        // Save to database
        const contact = new Contact(contactData);
        await contact.save();

        res.status(201).json({
            success: true,
            message: "Your message has been sent successfully! We'll get back to you soon.",
            data: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                category: contact.category,
                createdAt: contact.createdAt
            }
        });

    } catch (error) {
        console.error("Contact form submission error:", error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    submitContactForm
};