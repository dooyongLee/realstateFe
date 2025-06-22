import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiList, FiUsers, FiSettings } from "react-icons/fi";

const menu = [
  { to: "/", label: "대시보드", icon: <FiHome /> },
  { to: "/properties", label: "매물관리", icon: <FiList /> },
  { to: "/users", label: "회원관리", icon: <FiUsers /> },
  { to: "/settings", label: "설정", icon: <FiSettings /> },
];

const Sidebar = ({ open, onClose }) => (
  <>
    {/* 모바일 오버레이 */}
    {/* {open && <div className="sidebar-overlay" onClick={onClose} />} */}
    <nav>
      <ul className="sidebar-menu">
        {menu.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
              onClick={onClose}
              end={item.to === "/"}
            >
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  </>
);

export default Sidebar; 