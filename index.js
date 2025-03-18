const { AzureOpenAI } = require("openai");
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

// Configure Azure OpenAI
const endpoint =
  "https://talib-m4b8f8l2-francecentral.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-10-21";
const modelName = "gpt-4o-mini";
const deployment = "gpt-4o-mini";

const openai = new AzureOpenAI({
  endpoint,
  apiKey:
    "5sPl3dul1vHwalPFqFxx4dTIVVogulLyR1izVnZ6KtGPSM5pX4ofJQQJ99ALAC5T7U2XJ3w3AAAAACOGCp83",
  deployment,
  apiVersion: "2024-10-21",
});

const socketRunner = require("./socket");
socketRunner(io, openai);

app.use(express.json());
app.use(cors("*"));
app.use("/api/auth", authRouter);
app.use("/api/bots", botsRouter);

server.listen(5000, () => {
  connectDB(process.env.MONGODB_URL);
  console.log("Server running on port 5000");
});
