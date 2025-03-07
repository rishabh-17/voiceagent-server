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
      Polly: {
        voices: [
          { id: "Aditi", name: "Aditi (hindi)" },
          // { id: "Kajal", name: "Kajal (hindi)" },
          { id: "Raveena", name: "Raveena (hindi)" },
          { id: "Joanna", name: "Joanna" },
          { id: "Matthew", name: "Matthew" },

          { id: "Joey", name: "Joey (English-US)" },

          { id: "Amy", name: "Amy (Female)" },
          // done

          { id: "Salli", name: "Salli (English-US)" },
        ],
        settings: {},
      },
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
      Deepgram: {
        voices: [
          { id: "aura-luna-en", name: "Luna" }, // English (US), Female
          { id: "aura-stella-en", name: "Stella" }, // English (US), Female

          { id: "aura-orion-en", name: "Orion" }, // English (US), Male

          { id: "aura-angus-en", name: "Angus" }, // English (Ireland), Male
          { id: "aura-orpheus-en", name: "Orpheus" }, // English (US), Male
          { id: "aura-helios-en", name: "Helios" }, // English (UK), Male
          { id: "aura-zeus-en", name: "Zeus" }, // English (US), Male
        ],
        settings: {},
      },

      elevenlabs: {
        voices: [
          { id: "JBFqnCBsd6RMkjVDRZzb", name: "Rachel" },
          { id: "21m00Tcm4TlvDq8ikWAM", name: "Adam" },

          // NEW ADD ID
          // {id: "zcAOhNBS3c14rBihAFp1", name: "Giovanni TESTT"},
          //  { id: "wViXBPUzp2ZZixB1xQuM", name: "Arnold  (English-US)" },
          //  { id:  "9BWtsMINqrJLrRacOk9x", name: "Aria (English-US)" },
          //  { id: "5Q0t7uMcjvnagumLfvZi", name: "Paul (Legacy)" },
          //  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
          // { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" },
          // { id: "SOYHLrjzK2X1ezoPC6cr", name: "Harry " },
        ],
        settings: {
          stability: { type: "range", min: 0, max: 1, default: 0 },
          similarity_boost: { type: "range", min: 0, max: 1, default: 0.5 },
        },
      },

      // Deepgram: {
      //   voices: [
      //     { id: "aura-asteria-en", name: "Asteria " },
      //     { id: "aura-luna-en", name: "Luna" },
      //   ],
      //   settings: {},
      // },
      //   Smallest: {
      //     voices: [{ id: "diya", name: "diya" }],
      //     settings: {},
      //   },
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
