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
  const [categories, setCategories] = useState([]);

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
    const all = res.data || [];
    if (!categoryParam) return all;
    return all.filter((ev) => ev.categoryId === categoryParam);
  };

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-filter", categoryParam],
    queryFn: fetchEventByCategory,
  });

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
              <h3
                style={{
                  color: "#fff",
                  fontSize: "20px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AppstoreOutlined /> Danh mục
              </h3>

              <div
                className={`category-item ${!categoryParam ? "active" : ""}`}
                onClick={() => navigate(`/events`)}
              >
                Tất cả sự kiện
              </div>

              {categories.map((cate) => (
                <div
                  key={cate._id}
                  className={`category-item ${
                    categoryParam === cate._id ? "active" : ""
                  }`}
                  onClick={() => navigate(`/events?category=${cate._id}`)}
                >
                  <span style={{ flex: 1 }}>{cate.name}</span>
                  {categoryParam === cate._id && (
                    <RightOutlined style={{ fontSize: "12px" }} />
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* EVENT LIST */}
          <main style={{ flex: 1 }}>
            <h2 className="section-title">
              {categoryParam
                ? `${
                    categories.find((c) => c._id === categoryParam)?.name ||
                    "Danh mục"
                  }`
                : "Khám phá tất cả sự kiện"}
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
