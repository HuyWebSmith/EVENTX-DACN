import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as ProductService from "../../services/ProductService";
import * as CategoryService from "../../services/CategoryService";
import CardComponent from "../../components/CardComponent/CardComponent";

const EventFilterPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = params.get("category") || "";

  const [categories, setCategories] = useState([]);

  // Fetch categories
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

  // Fetch events
  const fetchEventByCategory = async () => {
    const res = await ProductService.getAllEvent(1000);
    const all = res.data || [];

    if (!categoryParam) return all;
    return all.filter((ev) => ev.categoryId === categoryParam);
  };

  const { data: events = [] } = useQuery({
    queryKey: ["events-filter", categoryParam],
    queryFn: fetchEventByCategory,
  });

  return (
    <div
      style={{
        width: "1270px",
        margin: "0 auto",
        paddingTop: "20px",
        display: "flex",
        gap: "28px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* SIDEBAR FILTER */}
      <div
        style={{
          width: "260px",
          background: "#ffffff",
          padding: "22px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          height: "fit-content",
        }}
      >
        <h3
          style={{
            marginBottom: "16px",
            fontSize: "18px",
            fontWeight: 600,
            color: "#1a1a1a",
          }}
        >
          Danh mục
        </h3>

        {categories.map((cate) => {
          const isActive = categoryParam === cate._id;

          return (
            <div
              key={cate._id}
              style={{
                padding: "10px 12px",
                marginBottom: "4px",
                borderRadius: "8px",
                cursor: "pointer",
                background: isActive ? "#E8F8EF" : "transparent",
                color: isActive ? "#1D9F55" : "#333",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.25s ease",
              }}
              onClick={() => navigate(`/events?category=${cate._id}`)}
            >
              {cate.name}
            </div>
          );
        })}
      </div>

      {/* EVENT LIST */}
      <div style={{ flex: 1 }}>
        <h2
          style={{
            marginBottom: "20px",
            fontSize: "22px",
            fontWeight: 600,
            color: "#111",
          }}
        >
          {categoryParam
            ? `Kết quả cho: ${
                categories.find((c) => c._id === categoryParam)?.name || ""
              }`
            : "Tất cả sự kiện"}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px",
          }}
        >
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
            const displayImage = mainImageUrl || eventImages[0]?.imageUrl;
            const chipestPrice = tickets.length > 0 ? tickets[0].price : 0;
            const firstLocation = locations[0];
            const displayAddress = firstLocation
              ? `${firstLocation.city}`
              : "Chưa rõ địa điểm";

            return (
              <div
                key={ev._id}
                onClick={() => navigate(`/product-details/${ev._id}`)}
                style={{
                  borderRadius: "10px",
                  padding: "4px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <CardComponent
                  title={`${
                    organizerName ? `[${organizerName}]` : ""
                  } - ${title}`}
                  eventDate={eventDate}
                  price={chipestPrice}
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
              marginTop: 20,
              fontSize: "16px",
              color: "#555",
            }}
          >
            Không có sự kiện nào.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFilterPage;
