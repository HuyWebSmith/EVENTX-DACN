import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as ProductService from "../../services/ProductService";
import * as CategoryService from "../../services/CategoryService";
import CardComponent from "../../components/CardComponent/CardComponent";
import "./EventFilterPage.css"; // Import file CSS mới
import { AppstoreOutlined, RightOutlined } from "@ant-design/icons";
import BannerComponent from "../../components/BannerComponent/BannerComponent";

const EventFilterPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = params.get("category") || "";
  const locationParam = params.get("location") || "";
  const [categories, setCategories] = useState([]);
  const popularCities = [
    { name: "Hồ Chí Minh", slug: "Hồ Chí Minh" },
    { name: "Hà Nội", slug: "Hà Nội" },
    { name: "Đà Lạt", slug: "Đà Lạt" },
    { name: "Đà Nẵng", slug: "Đà Nẵng" },
  ];
  useEffect(() => {
    const fetchCategoryList = async () => {
      try {
        const res = await CategoryService.getAll();
        setCategories(res.data.data || []);
      } catch (err) {
        console.log("Lỗi load categories", err);
      }
    };
    fetchCategoryList();
  }, []);

  const fetchEventByCategory = async () => {
    const res = await ProductService.getAllEvent(1000);
    let filteredEvents = res.data || [];

    // 1. Lọc theo Category
    if (categoryParam) {
      filteredEvents = filteredEvents.filter(
        (ev) => ev.categoryId === categoryParam
      );
    }

    // 2. Lọc theo Location (Sửa lại đoạn này)
    if (locationParam) {
      filteredEvents = filteredEvents.filter((ev) =>
        ev.locations?.some((loc) => {
          // Chuyển cả 2 về chữ thường để so sánh chuẩn xác
          const cityInDb = loc.city?.toLowerCase() || "";
          const citySearch = locationParam.toLowerCase();
          return cityInDb.includes(citySearch);
        })
      );
    }

    return filteredEvents;
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-filter", categoryParam, locationParam],
    queryFn: fetchEventByCategory,
  });
  const handleFilter = (type, value) => {
    const newParams = new URLSearchParams(params);
    if (value) {
      newParams.set(type, value);
    } else {
      newParams.delete(type);
    }
    navigate(`/events?${newParams.toString()}`);
  };
  return (
    <>
      <div className="event-filter-container">
        <div
          style={{
            width: "1300px",
            margin: "0 auto",
            display: "flex",
            gap: "40px",
            padding: "0 20px",
          }}
        >
          {/* SIDEBAR FILTER */}
          <aside style={{ width: "280px" }}>
            <div className="filter-sidebar">
              {/* KHỐI DANH MỤC (Giữ nguyên hoặc sửa dùng handleFilter) */}
              <h3 className="filter-title">
                <AppstoreOutlined /> Danh mục
              </h3>
              <div
                className={`category-item ${!categoryParam ? "active" : ""}`}
                onClick={() => handleFilter("category", "")}
              >
                Tất cả sự kiện
              </div>
              {categories.map((cate) => (
                <div
                  key={cate._id}
                  className={`category-item ${
                    categoryParam === cate._id ? "active" : ""
                  }`}
                  onClick={() => handleFilter("category", cate._id)}
                >
                  <span style={{ flex: 1 }}>{cate.name}</span>
                </div>
              ))}

              {/* KHỐI ĐỊA ĐIỂM (MỚI THÊM) */}
              <div style={{ marginTop: "40px" }}>
                <h3 className="filter-title">📍 Địa điểm</h3>
                <div
                  className={`category-item ${!locationParam ? "active" : ""}`}
                  onClick={() => handleFilter("location", "")}
                >
                  Toàn quốc
                </div>
                {popularCities.map((city) => (
                  <div
                    key={city.slug}
                    className={`category-item ${
                      locationParam === city.slug ? "active" : ""
                    }`}
                    onClick={() => handleFilter("location", city.slug)}
                  >
                    <span style={{ flex: 1 }}>{city.name}</span>
                    {locationParam === city.slug && (
                      <RightOutlined style={{ fontSize: "12px" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* EVENT LIST */}
          <main style={{ flex: 1 }}>
            <h2 className="section-title">
              {isLoading ? (
                "Đang tìm kiếm..."
              ) : (
                <>
                  Sự kiện{" "}
                  {categories.find((c) => c._id === categoryParam)?.name ||
                    "tất cả"}
                  {locationParam && ` tại ${locationParam}`}
                </>
              )}
            </h2>

            {isLoading ? (
              <div
                style={{ color: "#888", textAlign: "center", padding: "100px" }}
              >
                Đang tải những sự kiện tuyệt vời nhất...
              </div>
            ) : (
              <>
                <div className="event-grid">
                  {events.map((ev) => {
                    const {
                      _id,
                      title,
                      organizerName,
                      organizerLogoUrl,
                      eventDate,
                      tickets = [],
                      locations = [],
                      eventImages = [],
                      mainImageUrl,
                    } = ev;

                    const displayImage =
                      mainImageUrl || eventImages[0]?.imageUrl;
                    const cheapestPrice =
                      tickets.length > 0 ? tickets[0].price : 0;
                    const firstLocation = locations[0];
                    const displayAddress = firstLocation
                      ? `${firstLocation.city}`
                      : "Toàn quốc";

                    return (
                      <div
                        key={_id}
                        onClick={() => navigate(`/product-details/${_id}`)}
                        style={{ height: "100%" }}
                      >
                        <CardComponent
                          title={title} // CardComponent mới đã có style đẹp nên không cần ghép chuỗi quá dài
                          eventDate={eventDate}
                          price={cheapestPrice}
                          address={displayAddress}
                          image={displayImage}
                          logo={organizerLogoUrl}
                        />
                      </div>
                    );
                  })}
                </div>

                {events.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "100px 0",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "20px",
                      border: "1px dashed rgba(255,255,255,0.1)",
                    }}
                  >
                    <p style={{ color: "#666", fontSize: "18px" }}>
                      Hiện chưa có sự kiện nào trong danh mục này.
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <BannerComponent></BannerComponent>
    </>
  );
};

export default EventFilterPage;
