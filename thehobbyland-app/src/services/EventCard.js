import React, { useState, useEffect } from "react";
import axios from "axios";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

const EventCard = ({ event, currentUser }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (currentUser?.favorites) {
      setIsFavorite(currentUser.favorites.includes(event._id));
    }
  }, [currentUser, event]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.post("/api/favorite/removeFavorite", {
          userId: currentUser._id,
          eventId: event._id,
        });
      } else {
        await axios.post("/api/favorite/addFavorite", {
          userId: currentUser._id,
          eventId: event._id,
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="event-card">
      <img src={event.image} alt={event.title} />
      <h3>{event.title}</h3>
      <button onClick={toggleFavorite}>
        {isFavorite ? (
          <HeartFilled style={{ color: "red" }} />
        ) : (
          <HeartOutlined />
        )}
      </button>
    </div>
  );
};

export default EventCard;
