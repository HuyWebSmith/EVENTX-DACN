// models/Slider.js
const mongoose = require("mongoose");

const SliderSchema = new mongoose.Schema(
  {
    name: { type: String, default: "LUNDEV" },
    title: { type: String, required: true },
    sub: { type: String },
    desc: { type: String },
    img: { type: String, required: true }, // Lưu URL ảnh từ Cloudinary hoặc Server
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slider", SliderSchema);
