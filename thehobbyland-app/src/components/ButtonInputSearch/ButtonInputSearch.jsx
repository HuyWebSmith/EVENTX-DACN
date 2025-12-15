import React, { useState, useEffect, useRef } from "react";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { SearchOutlined } from "@ant-design/icons";
import InputComponent from "../inputComponent/inputComponent";
import { List } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ButtonInputSearch = (props) => {
  const {
    size,
    placeholder,
    backgroundColorInput = "#fff",
    backgroundColorButton = "#37B75A",
    colorButton = "#fff",
  } = props;

  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // API suggest
  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/event/search-suggest?keyword=${keyword}`
        );
        setSuggestions(res.data);
        setOpen(true);
      } catch (err) {
        console.log(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [keyword]);

  // click ra ngoài thì tắt dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToSearchPage = (kw) => {
    navigate(`/search?keyword=${kw}`);
    setOpen(false);
  };

  const handleKeyEnter = (e) => {
    if (e.key === "Enter") goToSearchPage(keyword);
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", width: "100%", display: "flex" }}
    >
      <InputComponent
        size={size}
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyEnter}
        style={{
          borderRadius: 0,
          backgroundColor: backgroundColorInput,
          border: "none",
          color: "#000",
        }}
      />

      <ButtonComponent
        size="large"
        icon={<SearchOutlined />}
        textButton="Tìm kiếm"
        onClick={() => goToSearchPage(keyword)}
        styleButton={{
          background: backgroundColorButton,
          color: colorButton,
          borderRadius: 0,
        }}
      />

      {open && suggestions?.length > 0 && (
        <List
          bordered
          style={{
            position: "absolute",
            top: "42px",
            width: "100%",
            zIndex: 30,
            background: "white",
            borderRadius: 6,
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            cursor: "pointer",
          }}
          dataSource={suggestions}
          renderItem={(item) => (
            <List.Item onClick={() => navigate(`/product-details/${item._id}`)}>
              {item.title}
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default ButtonInputSearch;
