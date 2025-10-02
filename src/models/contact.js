const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: 100,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        subject: {
            type: String,
            required: true,
            minLength: 5,
            maxLength: 200,
            trim: true
        },
        message: {
            type: String,
            required: true,
            minLength: 10,
            maxLength: 2000,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: ["general", "support", "business", "feedback", "bug", "feature"],
            default: "general"
        },
        status: {
            type: String,
            enum: ["new", "in_progress", "resolved", "closed"],
            default: "new"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },
        responseRequired: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ category: 1, status: 1 });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;