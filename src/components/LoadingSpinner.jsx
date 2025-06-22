import React from "react";

const spinnerStyle = {
  display: "inline-block",
  width: 40,
  height: 40,
  border: "4px solid #ccc",
  borderTop: "4px solid #222e3c",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const LoadingSpinner = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
    <div style={spinnerStyle} />
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner; 