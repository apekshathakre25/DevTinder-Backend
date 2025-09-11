const express = require("express");
const cors = require("cors")
const { connectToDb } = require("./src/config/connectToDB.js");
const authRoute = require("./src/routes/auth.js");
const profileRoute = require("./src/routes/profile.js")
const connectionRoute = require("./src/routes/connectionRequest.js")
const userRoute = require("./src/routes/user.js")

const app = express();
const PORT = 3000;

connectToDb()

app.use(cors())
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/connection", connectionRoute);
app.use("/api/user", userRoute);


app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
});
