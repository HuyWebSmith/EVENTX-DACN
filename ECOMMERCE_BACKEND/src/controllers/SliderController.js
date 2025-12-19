const Slider = require("../models/Slider");

const createSlider = async (req, res) => {
  try {
    const { title, img } = req.body;

    // Kiểm tra dữ liệu đầu vào (Tránh lỗi 400)
    if (!title || !img) {
      return res.status(400).json({
        status: "ERR",
        message: "Trường 'title' và 'img' là bắt buộc theo Model!",
      });
    }

    // Tạo mới trong Mongo
    const newSlider = await Slider.create(req.body);

    return res.status(200).json({
      status: "OK",
      data: newSlider,
    });
  } catch (e) {
    // In lỗi ra terminal để debug (Xử lý lỗi 500)
    console.error("Lỗi Mongo:", e.message);
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const getAllSlider = async (req, res) => {
  try {
    const allSlider = await Slider.find().sort({ createdAt: -1 }); // Lấy cái mới nhất lên đầu
    return res.status(200).json({
      status: "OK",
      message: "Success",
      data: allSlider,
    });
  } catch (e) {
    console.error("LỖI TẠI GET_ALL:", e); // In ra terminal để xem lỗi gì
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const updateSlider = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Slider.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ status: "OK", data: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deleteSlider = async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "OK", message: "Deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { createSlider, getAllSlider, updateSlider, deleteSlider };
