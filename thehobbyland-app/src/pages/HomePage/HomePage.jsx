import React, { useEffect, useState } from "react";
import TypeProduct from "../../components/TypeProduct/TypeProduct";
import { WrapperTypeProduct } from "./style";
import SliderComponent from "../../components/SliderComponent/SliderComponent";
import slider1 from "../../assets/images/Slider1.jpg";
import slider2 from "../../assets/images/Slider2.png";
import slider3 from "../../assets/images/Slider3.jpg";
import slider4 from "../../assets/images/Slider4.jpg";
import slider5 from "../../assets/images/Slider5.jpg";
import slider6 from "../../assets/images/Slider6.png";
import CardComponent from "../../components/CardComponent/CardComponent";
import * as ProductService from "../../services/ProductService";
import { WrapperButtonMore } from "../../components/NavbarComponent/style";
import { WrapperProducts } from "./style";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import * as CategoryService from "../../services/CategoryService";

const HomePage = () => {
  const [limit, setLimit] = useState(4);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [categories, setCategories] = useState([]);

  const fetchAllProducts = async ({ queryKey }) => {
    const limit = queryKey[1];
    const res = await ProductService.getAllEvent(limit);
    return res.data || res;
  };
  const { data: trendingEvents } = useQuery({
    queryKey: ["trending-events"],
    queryFn: ProductService.getTrendingEvents,
  });

  const {
    isLoading,
    data: products,
    error,
  } = useQuery({
    queryKey: ["products", limit],
    queryFn: fetchAllProducts,
    retry: 3,
    retryDelay: 1000,
  });

  const navigate = useNavigate();
  const navigatorEvent = (id) => {
    navigate(`/product-details/${id}`);
  };

  // Lọc sản phẩm theo searchQuery và status
  const filteredProducts = Array.isArray(products)
    ? products
        .filter((product) => ["Approved", "Ongoing"].includes(product.status))
        .filter((product) => {
          const search = searchQuery.toLowerCase();
          return (
            product.title?.toLowerCase().includes(search) ||
            product.organizerName?.toLowerCase().includes(search)
          );
        })
        .sort((a, b) => {
          if (a.status === b.status) return 0;
          if (a.status === "Approved") return -1;
          return 1;
        })
    : [];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryService.getAll();
        setCategories(res.data.data || []);
      } catch (err) {
        console.log("Lỗi load categories", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div style={{ width: "1270px", margin: "0 auto" }}>
      <WrapperTypeProduct>
        {categories.map((cate) => (
          <TypeProduct
            key={cate._id}
            name={cate.name}
            onClick={() => navigate(`/events?category=${cate._id}`)}
          />
        ))}
      </WrapperTypeProduct>

      <div
        id="container"
        style={{ backgroundColor: "#efefef", minHeight: "1000px" }}
      >
        <SliderComponent
          arrImages={[slider1, slider2, slider3, slider4, slider5, slider6]}
        />

        <WrapperProducts>
          {isLoading ? (
            <div style={{ padding: 16, color: "#1890ff" }}>
              Đang tải sự kiện...
            </div>
          ) : error ? (
            <div style={{ padding: 16, color: "#b00020" }}>
              Lỗi khi tải sự kiện: {error?.message || "Unknown error"}.
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const {
                _id,
                title,
                organizerName,
                eventDate,
                organizerLogoUrl,
                tickets = [],
                locations = [],
                eventImages = [],
                mainImageUrl,
              } = product;

              const displayImage = mainImageUrl || eventImages[0]?.imageUrl;
              const firstLocation = locations[0];
              const chipestPrice = tickets.length > 0 ? tickets[0].price : 0;
              const displayAddress = firstLocation
                ? `${firstLocation.city}`
                : "Địa chỉ chưa xác định";

              return (
                <div key={_id} onClick={() => navigatorEvent(_id)}>
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
            })
          ) : (
            <div style={{ padding: 16 }}>Không tìm thấy sự kiện nào</div>
          )}
        </WrapperProducts>

        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <WrapperButtonMore
            textButton="Xem thêm"
            type="outline"
            styleButton={{
              border: "2px solid #37B75A",
              color: "#37B75A",
              width: "240px",
              height: "38px",
              borderRadius: "4px",
            }}
            onClick={() => setLimit((prev) => prev + 4)}
            styleTextButton={{ fontWeight: "500" }}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
