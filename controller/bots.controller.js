const { Polly } = require("aws-sdk");
const Bots = require("../models/Bots.model");

const createBot = async (req, res) => {
  try {
    const { name, description, personality, provider, voice, settings } =
      req.body;
    const newBot = await Bots.create({
      name,
      description,
      personality,
      ttsProvider: provider,
      ttsVoice: voice,
      ttsSettings: settings,
      owner: req.user.userId,
    });
    res.status(201).json(newBot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBot = async (req, res) => {
  try {
    const bot = await Bots.findOne({ where: { id: req.params.id } });
    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBot = async (req, res) => {
  try {
    const {
      name,
      description,
      personality,
      ttsProvider,
      ttsVoice,
      ttsSettings,
    } = req.body;
    const bot = await Bots.findOne({ where: { id: req.params.id } });
    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }
    bot.name = name;
    bot.description = description;
    bot.personality = personality;
    bot.ttsProvider = ttsProvider;
    bot.ttsVoice = ttsVoice;
    bot.ttsSettings = ttsSettings;
    await bot.save();
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBot = async (req, res) => {
  try {
    const bot = await Bots.findOne({ where: { id: req.params.id } });
    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }
    await bot.destroy();
    res.json({ message: "Bot deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBotsByUser = async (req, res) => {
  try {
    const bots = await Bots.find({ owner: req.user.userId });
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTTSConfig = async (req, res) => {
  try {
    const ttsConfig = {
      openai: {
        voices: [
          { id: "alloy", name: "alloy" },
          { id: "echo", name: "echo" },
          { id: "fable", name: "fable" },
          { id: "onyx", name: "onyx" },
          { id: "nova", name: "nova" },
          { id: "shimmer", name: "shimmer" },
        ],
        settings: {},
      },
      elevenlabs: {
        voices: [
          { id: "JBFqnCBsd6RMkjVDRZzb", name: "Rachel" },
          { id: "21m00Tcm4TlvDq8ikWAM", name: "Adam" },
          // { id: "MF4J4IDTRo0AxOO4dpFR", name: "Devi (hindi)" },
          // { id: "1qEiC6qsybMkmnNdVMbK", name: "Monica Sogam (hindi)" },
        ],
        settings: {
          stability: { type: "range", min: 0, max: 1, default: 0 },
          similarity_boost: { type: "range", min: 0, max: 1, default: 0.5 },
        },
      },
      Polly: {
        voices: [
          { id: "Aditi", name: "Aditi (hindi)" },
          // { id: "Kajal", name: "Kajal (hindi)" },
          { id: "Joanna", name: "Joanna" },
          { id: "Matthew", name: "Matthew" },
        ],
        settings: {},
      },
      Deepgram: {
        voices: [
          { id: "aura-asteria-en", name: "Asteria " },
          { id: "aura-luna-en", name: "Luna" },
        ],
        settings: {},
      },
    };

    res.json(ttsConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBot,
  getBot,
  updateBot,
  deleteBot,
  getBotsByUser,
  getTTSConfig,
};
