import React from "react";
import { FiUser } from "react-icons/fi";
import logo from "../assets/goodreal.png"; // 로고 예시, 실제 로고로 교체 가능

const Header = ({ user, onHamburgerClick, onLogout }) => (
  <div className="header-inner">
    <button className="hamburger" onClick={onHamburgerClick}>☰</button>
    <div className="logo">
      <img src={logo} alt="Good Real Admin" width="64" height="64" />
      <span className="header-title">Good Real Admin</span>
    </div>
    <div className="header-user">
      <FiUser size={20} style={{ marginRight: 4 }} />
      <span>{user?.name || "관리자"}</span>
      <button className="logout-btn" onClick={onLogout}>로그아웃</button>
    </div>
  </div>
);

export default Header; 