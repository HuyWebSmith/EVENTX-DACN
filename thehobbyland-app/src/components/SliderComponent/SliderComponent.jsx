import React, { useState, useEffect, useCallback } from "react";
import "./SliderComponent.css";

const SliderComponent = ({ dataSliders }) => {
  const [items, setItems] = useState([]);
  const [progressKey, setProgressKey] = useState(0);
  useEffect(() => {
    // Nếu dataSliders đã là mảng các Object từ MongoDB
    if (dataSliders && dataSliders.length > 0) {
      setItems(dataSliders);
    }
  }, [dataSliders]);

  const nextSlide = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const newArray = [...prev];
      const firstItem = newArray.shift();
      return [...newArray, firstItem];
    });
    setProgressKey((prev) => prev + 1);
  }, []);

  const handleThumbnailClick = (clickedId) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item._id === clickedId);
      if (index === 0) return prev;

      const partBefore = prev.slice(0, index);
      const partAfter = prev.slice(index);
      return [...partAfter, ...partBefore];
    });

    // Reset thanh chạy thời gian
    setProgressKey((prev) => prev + 1);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => clearInterval(timer);
  }, [nextSlide, items]);

  if (items.length === 0) return null;

  return (
    <div className="slider-container">
      {/* 1. Danh sách ảnh chính */}
      <div key={progressKey} className="time-running"></div>
      <div className="list">
        {items.map((item, index) => (
          <div className="item" key={item._id || item.id}>
            <img src={item.img} alt="banner" />
            <div className="content">
              <div className="OrganizeName">{item.name || "EVENTX"}</div>
              <div className="titleEvent1">{item.title}</div>
              <div className="titleEvent2">{item.sub}</div>
              <div className="descriptionEvent">{item.desc}</div>
              <div className="buttons">
                <button>SEE MORE</button>
                <button>SUBSCRIBE</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Dàn Thumbnail - Đã đổi tên class thành "thumbnail" */}
      <div className="thumbnail">
        {items.map((item, index) => (
          <div
            className="item"
            key={`thumb-${item._id || item.id}`}
            onClick={() => handleThumbnailClick(item._id || item.id)}
          >
            <img src={item.img} alt="thumb" />
            <div
              className="thumb-info"
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                color: "#fff",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                {item.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Đã loại bỏ div class arrows theo yêu cầu */}
    </div>
  );
};

export default SliderComponent;
