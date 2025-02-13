const Bots = require("../models/Bots.model");
const botController = require("../controller/bots.controller");
const TTS = require("../services/TTS");

const socketRunner = (io, openai) => {
  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);

    let chatHistory = [
      { role: "system", content: "You are now connected to the bot." },
    ];

    socket.on("join", async (botId) => {
      // console.log(`User joined bot ${botId}`);
      try {
        const bot = await Bots.findOne({ _id: botId });
        if (!bot) {
          return socket.emit("error", "Bot not found");
        }

        socket.join(botId);

        chatHistory.push({
          role: "system",
          content: `behave like an assistant, don't answer anything in long paragram just make as short as possible until user asks for more detail, try to be very good agent in every answer promote things based on your personality, detail of you personality is here:- ${bot?.personality} `,
        });

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: chatHistory,
            temperature: 0.7,
            stream: true,
          });

          let botMessage = "";
          for await (const chunk of response) {
            if (chunk?.choices?.[0]?.delta?.content) {
              botMessage += chunk.choices[0].delta.content;
            }
          }
          // socket.emit("botMessage", botMessage);
          chatHistory.push({ role: "assistant", content: botMessage });

          socket.on("userMessage", async (message) => {
            const start = new Date().getTime();

            console.log(bot);
            chatHistory.push({ role: "assistant", content: message });

            try {
              const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: chatHistory,
                temperature: 0.7,
                stream: true,
              });

              let botMessage = "";
              console.log(response);
              for await (const chunk of response) {
                if (chunk?.choices?.[0]?.delta?.content) {
                  botMessage += chunk.choices[0].delta.content;
                }
              }
              console.log(new Date().getSeconds(), "res");
              const audio = await TTS.synthesizeSpeech(
                botMessage,
                bot.ttsProvider,
                {
                  voice: bot.ttsVoice,
                  provider: bot.ttsProvider,
                }
              );

              console.log(new Date().getTime() - start);
              socket.emit("botMessage", { botMessage, audio });
              chatHistory.push({ role: "assistant", content: botMessage });
            } catch (error) {
              socket.emit(
                "botMessage",
                "Sorry, there was an error processing your message."
              );
            }
          });
        } catch (error) {
          console.error("Error initializing AI response:", error);
          socket.emit(
            "botMessage",
            "Sorry, there was an error initializing the chat."
          );
        }
      } catch (error) {
        console.error("Error finding bot:", error);
        socket.emit("error", "Error finding bot");
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketRunner;
