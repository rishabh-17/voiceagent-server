const axios = require("axios");
const OpenAI = require("openai");
const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});
const Polly = new AWS.Polly({
  signatureVersion: "v4",
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const defaultProvider = process.env.DEFAULT_TTS_PROVIDER || "openai";

async function fetchVoices(provider) {
  if (provider.toLowerCase() === "elevenlabs") {
    return getElevenLabsVoices();
  }
  return ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
}

async function getElevenLabsVoices() {
  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: { Authorization: `Bearer ${elevenLabsApiKey}` },
    });
    return response.data.voices;
  } catch (error) {
    console.error("Failed to fetch ElevenLabs voices:", error);
    return [];
  }
}

async function synthesizeSpeech(
  text,
  provider = defaultProvider,
  options = {}
) {
  try {
    if (provider.toLowerCase() === "elevenlabs") {
      return elevenLabsSpeech(text, options);
    } else if (provider.toLowerCase() === "polly") {
      return pollySpeech(text, options);
    }
    return openAISpeech(text, options);
  } catch (error) {
    console.error("TTS error:", error);
    if (provider !== "openai") {
      console.log("Retrying with OpenAI TTS...");
      return openAISpeech(text, options);
    }
    throw error;
  }
}

async function openAISpeech(text, options = {}) {
  try {
    const response = await openai.audio.speech.create({
      model: options.model || "tts-1",
      voice: options.voice || "alloy",
      input: text,
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString("base64");
  } catch (error) {
    console.error("OpenAI TTS error:", error);
    throw error;
  }
}

async function pollySpeech(text, options = {}) {
  try {
    const response = await Polly.synthesizeSpeech({
      OutputFormat: "mp3",
      Text: text || "Hello, this is a test.",
      VoiceId: options.voice || "Joanna",
    }).promise();
    const buffer = Buffer.from(response.AudioStream);
    return buffer.toString("base64");
  } catch (error) {
    console.error("Polly TTS error:", error);
    throw error;
  }
}

async function elevenLabsSpeech(text, options = {}) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${
        options.voice || "JBFqnCBsd6RMkjVDRZzb"
      }`,
      {
        text,
        model_id: options.modelId || "eleven_multilingual_v2",
        voice_settings: {
          stability: options.stability || 0,
          similarity_boost: options.similarityBoost || 0,
        },
      },
      {
        headers: {
          Accept: "audio/mpeg",
          "xi-api-key": elevenLabsApiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );
    const buffer = Buffer.from(response.data);
    return buffer.toString("base64");
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    throw error;
  }
}

module.exports = { fetchVoices, synthesizeSpeech };
