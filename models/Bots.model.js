const mongoose = require("mongoose");

const BotsSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  personality: {
    type: String,
    trim: true,
  },
  ttsProvider: {
    type: String,
    trim: true,
  },
  ttsVoice: {
    type: String,
    trim: true,
  },
  ttsSettings: {
    type: Object,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  additionalInfo: {
    type: Object,
    default: {},
  },
});

module.exports = mongoose.model("Bots", BotsSchema);
