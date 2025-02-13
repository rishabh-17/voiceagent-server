const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
    },
    photo: {
      type: Object,
      default:
        "https://t4.ftcdn.net/jpg/00/64/67/63/240_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", AuthSchema);

module.exports = User;
