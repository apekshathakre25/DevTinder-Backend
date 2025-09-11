const bcrypt = require("bcrypt")
const validator = require("validator");

const viewProfile = (req, res) => {
    try {
        const user = req.user
        res.status(200).json({ message: "profile fetch succesfully", data: user })
    } catch (error) {
        console.log(error)
        res.status(200).json({ message: error.message })
    }
}

const editProfile = async (req, res) => {
    try {
        const data = req.body;
        const user = req.user;

        const ALLOWED_FIELDS = ["firstName", "lastName", "gender", "about", "photoUrl", "age", "skills"];

        // Check if all fields in body are allowed
        const isUpdateAllowed = Object.keys(data).every((key) => ALLOWED_FIELDS.includes(key));
        if (!isUpdateAllowed) {
            return res.status(400).json({ message: "Update not allowed for some fields" });
        }

        // Update only allowed fields dynamically
        Object.keys(data).forEach((key) => {
            user[key] = data[key];
        });

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updatePassword = async (req, res) => {
  try {
    const user = req.user;
    const { currentPass, newPass } = req.body;

    // 1. Verify current password
    const isPasswordValid = await bcrypt.compare(currentPass, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is wrong" });
    }

    // 2. Validate new password strength
    if (!validator.isStrongPassword(newPass)) {
      return res.status(400).json({ message: "Please enter a stronger password" });
    }

    // 3. Hash new password
    const hashPassword = await bcrypt.hash(newPass, 10);

    // 4. Save new password
    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
    viewProfile,
    editProfile,
    updatePassword
}