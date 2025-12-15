import React, { useEffect, useState } from "react";
import { Rate, Input, Button, List, Avatar, message } from "antd";
import dayjs from "dayjs";
import {
  getCommentsByEvent,
  createComment,
} from "../../services/CommentService";

const { TextArea } = Input;

const EventComment = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    const res = await getCommentsByEvent(eventId);
    setComments(res.data);
  };

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const handleSubmit = async () => {
    if (!rating || !content.trim()) {
      return message.warning("Vui lòng nhập sao và bình luận");
    }

    setLoading(true);
    await createComment({ eventId, rating, content });
    setRating(0);
    setContent("");
    fetchComments();
    setLoading(false);
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        width: "100%", // Giữ nguyên chiều ngang
      }}
    >
      <h3 style={{ marginBottom: 15 }}>Đánh giá sự kiện</h3>

      <Rate value={rating} onChange={setRating} style={{ fontSize: 18 }} />
      <TextArea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Chia sẻ cảm nhận của bạn..."
        style={{ margin: "10px 0", borderRadius: 6 }}
      />

      <Button
        type="primary"
        onClick={handleSubmit}
        loading={loading}
        style={{
          marginBottom: 20,
          backgroundColor: "#2DC275",
          borderColor: "#2DC275",
        }}
      >
        Gửi đánh giá
      </Button>

      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          paddingRight: 10,
        }}
      >
        <List
          dataSource={comments}
          renderItem={(item) => (
            <List.Item
              style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}
            >
              <List.Item.Meta
                avatar={
                  item.userAvatar ? (
                    <Avatar src={item.userAvatar} size={40} />
                  ) : (
                    <Avatar size={40}>{item.userName[0]}</Avatar>
                  )
                }
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontWeight: 600 }}>{item.userName}</span>
                    <Rate
                      disabled
                      value={item.rating}
                      style={{ fontSize: 14 }}
                    />
                  </div>
                }
                description={
                  <>
                    <div style={{ marginTop: 5 }}>{item.content}</div>
                    <small style={{ color: "#888" }}>
                      {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                    </small>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default EventComment;
