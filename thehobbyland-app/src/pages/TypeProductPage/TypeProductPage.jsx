import React from "react";
import NavbarComponent from "../../components/NavbarComponent/NavbarComponent";
import CardComponent from "../../components/CardComponent/CardComponent";
import { Col, Pagination, Row } from "antd";
import { WrapperNavBar, WrapperProducts } from "./style";

const TypeProductPage = () => {
  const onChange = () => {};
  return (
    <div style={{ padding: "0 120px", background: "#efefef" }}>
      <div style={{ width: "1270px", margin: "0 auto" }}>
        <Row
          style={{
            flexWrap: "nowrap",
            paddingTop: "10px",
          }}
        >
          <WrapperNavBar span={4}>
            <NavbarComponent />
          </WrapperNavBar>
          <Col span={20}>
            <WrapperProducts>
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
              <CardComponent />
            </WrapperProducts>
            <Pagination
              defaultCurrent={2}
              total={100}
              onChange={onChange}
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TypeProductPage;
