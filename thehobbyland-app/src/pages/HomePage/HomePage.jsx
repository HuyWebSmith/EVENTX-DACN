import React, { useEffect, useState } from "react";
import TypeProduct from "../../components/TypeProduct/TypeProduct";
import { WrapperTypeProduct, WrapperProducts } from "./style";
import SliderComponent from "../../components/SliderComponent/SliderComponent";
import CardComponent from "../../components/CardComponent/CardComponent";
import { WrapperButtonMore } from "../../components/NavbarComponent/style";
import * as ProductService from "../../services/ProductService";
import * as CategoryService from "../../services/CategoryService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spin, Typography } from "antd";

import BannerComponent from "../../components/BannerComponent/BannerComponent";
import CityCard from "../../components/CityCard/CityCard";
import Footer from "../../components/Footer/Footer";
import { Center } from "@mantine/core";
import axios from "axios";
const HomePage = () => {
  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1); // page hiện tại
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true); // còn sản phẩm để load không
  const [isLoading, setIsLoading] = useState(true);
  const { Text } = Typography;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const navigate = useNavigate();
  const [sliders, setSliders] = useState([]);
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/slider/get-all");
        if (res.data.status === "OK") {
          setSliders(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy slider:", error);
      }
    };
    fetchSliders();
  }, []);
  // Fetch danh sách categories
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

  const fetchProducts = async (newLimit) => {
    try {
      setIsLoading(true);
      const res = await ProductService.getAllEvent(newLimit);
      const data = res.data || [];
      setProducts(data);
      if (data.length < newLimit) setHasMore(false);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(8);
  }, []);

  const handleLoadMore = () => {
    const newLimit = products.length + 4;
    fetchProducts(newLimit);
  };

  const filteredProducts = products
    .filter((p) => ["Approved", "Ongoing"].includes(p.status))
    .filter((p) => {
      const search = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(search) ||
        p.organizerName?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (a.status === b.status) return 0;
      if (a.status === "Approved") return -1;
      return 1;
    });

  const navigatorEvent = (id) => navigate(`/product-details/${id}`);

  return (
    <>
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
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "16px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.3s ease",
            minHeight: "1000px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "1300px" }}>
              <SliderComponent dataSliders={sliders} />
            </div>
          </div>

          <WrapperProducts>
            {isLoading ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
                }}
              >
                <Spin size="large" />
                <Text
                  style={{ fontSize: 18, color: "#1890ff", marginTop: "15px" }}
                >
                  Đang tải sự kiện...
                </Text>
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

          {hasMore && !isLoading && (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <WrapperButtonMore
                textButton={loadingMore ? "Đang tải..." : "Xem thêm"}
                type="outline"
                onClick={handleLoadMore}
                styleButton={{
                  border: "2px solid #83C6F0",
                  color: "#37B75A",
                  width: "240px",
                  height: "38px",
                  borderRadius: "4px",
                }}
                styleTextButton={{ fontWeight: "500" }}
              />
            </div>
          )}
        </div>
        <CityCard></CityCard>
        <BannerComponent></BannerComponent>
      </div>
    </>
  );
};

export default HomePage;
