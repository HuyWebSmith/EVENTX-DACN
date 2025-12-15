const Category = require("../models/CategoryModel");

// Lấy tất cả category
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const existing = await Category.findOne({ name });
    if (existing)
      return res.status(400).json({ message: "Tên category đã tồn tại" });

    const newCategory = await Category.create({
      name,
      description,
      isActive,
    });

    res.status(201).json({ data: newCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated)
      return res.status(404).json({ message: "Category không tồn tại" });

    res.status(200).json({ data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Category không tồn tại" });

    res.status(200).json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
