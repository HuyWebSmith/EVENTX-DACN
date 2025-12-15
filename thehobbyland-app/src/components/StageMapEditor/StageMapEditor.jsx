import React, { useRef, useState, useEffect } from "react";

const StageMapEditor = ({ imageUrl, onChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;
      ctx.drawImage(img, 0, 0);
      if (rect) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      }
    };
  }, [imageUrl, rect]);

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    const rectBounds = canvasRef.current.getBoundingClientRect();
    const x = Math.min(startPos.x, e.clientX - rectBounds.left);
    const y = Math.min(startPos.y, e.clientY - rectBounds.top);
    const width = Math.abs(startPos.x - (e.clientX - rectBounds.left));
    const height = Math.abs(startPos.y - (e.clientY - rectBounds.top));
    const newRect = { x, y, width, height };
    setRect(newRect);
    setIsDrawing(false);
    onChange(newRect);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ border: "1px solid #ccc", maxWidth: "100%" }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
};

export default StageMapEditor;
