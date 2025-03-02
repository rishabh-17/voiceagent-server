const Bots = require("../models/Bots.model");
const botController = require("../controller/bots.controller");
const TTS = require("../services/TTS");

const socketRunner = (io, openai) => {
  io.on("connection", (socket) => {
    let chatHistory = [
      { role: "system", content: "You are now connected to the bot." },
    ];

    socket.on("join", async (botId) => {
      try {
        const bot = await Bots.findOne({ _id: botId });
        if (!bot) {
          return socket.emit("error", "Bot not found");
        }

        socket.join(botId);

        chatHistory.push({
          role: "system",
          content: `Act as a concise and efficient assistant. You are a voice bot not chat bot so talk as humanly as possible use commonly used words like oh great, amazing etc. Keep responses short and to the point unless the user requests more details. If the user’s input contains Hindi or Hinglish, reply entirely in हिन्दी using common English words where necessary example if i ask kese ho then reply should  be like मैं ठीक हूं आपका धन्यवाद. Otherwise, respond in English please always start communcation in english then switch to hindi if required. Maintain a proactive approach by promoting relevant ideas based on your personality. Your personality details are: ${bot?.personality}.`,
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
          chatHistory.push({ role: "assistant", content: botMessage });

          socket.on("userMessage", async (message) => {
            const start = new Date().getTime();

            chatHistory.push({ role: "assistant", content: message });

            try {
              const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: chatHistory,
                temperature: 0.7,
                stream: true,
              });

              let botMessage = "";
              let temp = "";
              const sentenceEndings = /[.!?,:;]/;
              for await (const chunk of response) {
                if (chunk?.choices?.[0]?.delta?.content) {
                  botMessage += chunk.choices[0].delta.content;
                  temp += chunk.choices[0].delta.content;
                  if (sentenceEndings.test(temp)) {
                    const audio = await TTS.synthesizeSpeech(
                      temp,
                      bot.ttsProvider,
                      {
                        voice: bot.ttsVoice,
                        provider: bot.ttsProvider,
                      }
                    );
                    socket.emit("botMessage", {
                      botMessage: temp,
                      audio,
                      question: message,
                    });
                    temp = "";
                  }
                }
              }
              // const audio = await TTS.synthesizeSpeech(botMessage, "polly", {
              //   voice: bot.ttsVoice,
              //   provider: bot.ttsProvider,
              // });

              // socket.emit("botMessage", { botMessage: temp, audio });

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
