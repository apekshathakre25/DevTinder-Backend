const express = require("express");
const cors = require("cors")
const { connectToDb } = require("./src/config/connectToDB.js");
const authRoute = require("./src/routes/auth.js");
const profileRoute = require("./src/routes/profile.js")
const connectionRoute = require("./src/routes/connectionRequest.js")
const userRoute = require("./src/routes/user.js")
const socketRoute = require("./src/routes/socket.js")
const chatRoute = require("./src/routes/chat.js")
const http = require("http")
const socket = require("socket.io")
const { initializedSocket } = require("./src/controllers/socket.js")

const app = express();
const PORT = 3000;


const server = http.createServer(app)
initializedSocket(server)

connectToDb()

app.use(cors())
app.use(express.json());

app.use("/", authRoute);
app.use("/profile", profileRoute);
app.use("/connection", connectionRoute);
app.use("/user", userRoute);
app.use("/chat", socketRoute);
app.use("/message", chatRoute)


app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

server.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`);
});
