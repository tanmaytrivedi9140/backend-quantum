const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
  otp: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
});
const Otp = mongoose.model("otp", otpSchema);

module.exports = Otp;
