import React from "react";

const footerStyle = {
  height: "40px",
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.9rem",
};

const Footer = () => (
  <footer style={footerStyle}>
    © {new Date().getFullYear()} Good For You
  </footer>
);

export default Footer; 