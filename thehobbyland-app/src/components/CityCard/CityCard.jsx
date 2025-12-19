import { useNavigate } from "react-router-dom";
import hochiminhImg from "../../assets/images/cho-ben-thanh-cover.webp";
import hanoiImg from "../../assets/images/W_z5620227067098_17422a1d9f705e524396421d93fb68c1_1.jpg";
import dalatImg from "../../assets/images/quang-truong-da-lat-13.webp";

const CityCard = () => {
  const navigate = useNavigate();

  const cities = [
    { id: 1, name: "Hồ Chí Minh", slug: "Hồ Chí Minh", img: hochiminhImg },
    { id: 2, name: "Hà Nội", slug: "Hà Nội", img: hanoiImg },
    { id: 3, name: "Đà Lạt", slug: "Đà Lạt", img: dalatImg },
  ];

  const handleCityClick = (citySlug) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    navigate(`/events?location=${citySlug}`);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "40px 20px",
        justifyContent: "center",
      }}
    >
      {cities.map((city) => (
        <div
          key={city.id}
          onClick={() => handleCityClick(city.slug)}
          style={{
            position: "relative",
            cursor: "pointer",
            width: "350px", // Kích thước to
            height: "220px",
            borderRadius: "15px",
            overflow: "hidden",
            transition: "transform 0.3s ease",
          }}
          // Hiệu ứng nhấc card lên khi di chuột vào
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-8px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          {/* Lớp ảnh nền */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${city.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Lớp phủ đen Blur (Backdrop Filter) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.4)", // Màu đen mờ
              backdropFilter: "blur(1.1px)", // Hiệu ứng Blur nhẹ cho ảnh nền
              zIndex: 1,
            }}
          />

          {/* Chữ ở góc dưới bên trái */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              zIndex: 2,
            }}
          >
            <h2
              style={{
                color: "white",
                margin: 0,
                fontSize: "26px",
                fontWeight: "bold",
                textTransform: "uppercase",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              {city.name}
            </h2>
            <p
              style={{
                color: "#37B75A",
                margin: "5px 0 0 0",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              KHÁM PHÁ NGAY →
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CityCard;
