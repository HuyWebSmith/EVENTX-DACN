const express = require("express");
const router = express.Router();
const sliderController = require("../controllers/SliderController");

router.post("/create", sliderController.createSlider);
router.get("/get-all", sliderController.getAllSlider);
router.put("/update/:id", sliderController.updateSlider);
router.delete("/delete/:id", sliderController.deleteSlider);

module.exports = router;
