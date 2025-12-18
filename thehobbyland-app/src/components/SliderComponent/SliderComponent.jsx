import React from "react";
import Slider from "react-slick";
import { Image } from "antd";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./SliderComponent.css";
import { WrapperSliderStyle } from "./style";
const SliderComponent = ({ arrImages, items, renderItem }) => {
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "400px",
    slidesToShow: 1,
    speed: 600,
    dots: true,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: false,
  };

  return (
    <div className="slider-container">
      <WrapperSliderStyle {...settings}>
        {/* CASE 1: Slider ảnh (code cũ, không hỏng) */}
        {arrImages &&
          arrImages.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt="slider image"
              height="274px"
              style={{ objectFit: "contain" }}
              preview
            />
          ))}

        {/* CASE 2: Slider custom item (event, card...) */}
        {items &&
          renderItem &&
          items.map((item) => <div key={item._id}>{renderItem(item)}</div>)}
      </WrapperSliderStyle>
    </div>
  );
};

export default SliderComponent;
