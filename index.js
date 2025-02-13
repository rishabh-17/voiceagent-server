const OpenAI = require("openai");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./models");
const app = express();
const server = http.createServer(app);
const authRouter = require("./routes/auth.routes");
const botsRouter = require("./routes/bots.routes");

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
const socketRunner = require("./socket");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

app.use(cors("*"));

app.use("/api/auth", authRouter);
app.use("/api/bots", botsRouter);

socketRunner(io, openai);

server.listen(5000, () => {
  connectDB(process.env.MONGODB_URL);
  console.log("Server running on port 5000");
});
