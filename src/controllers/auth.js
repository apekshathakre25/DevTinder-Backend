const User = require("../models/user.js");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password, about, gender, photoUrl, age } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "First name, last name, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const newPassword = await bcrypt.hash(password, 10)
        // Create user object
        const userData = { firstName, lastName, email, password: newPassword };

        // Include optional fields only if provided
        if (about) userData.about = about;
        if (gender) userData.gender = gender;
        if (photoUrl) userData.photoUrl = photoUrl;
        if (age) userData.age = age;

        // Create and save user
        const user = new User(userData);
        await user.save();

        res.status(201).json({ message: "User created successfully", data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please signup first" });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, email: email }, "$|KKLFc%5")

        // Success
        res.status(200).json({ message: "User logged in successfully", data: user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    signup,
    login,
    logout
};
