import React from "react";
import { FiUser } from "react-icons/fi";

const Header = ({ user, onHamburgerClick, onLogout }) => (
  <div className="header-inner">
    <button className="hamburger" onClick={onHamburgerClick}>☰</button>
    <span className="header-title">Real Estate Admin</span>
    <div className="header-user">
      <FiUser size={20} style={{ marginRight: 4 }} />
      <span>{user?.name || "관리자"}</span>
      <button className="logout-btn" onClick={onLogout}>로그아웃</button>
    </div>
  </div>
);

export default Header; 