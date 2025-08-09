import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiList, FiHome, FiSettings, FiUsers, FiCreditCard } from "react-icons/fi";

const menu = [
  { to: "/", label: "대시보드", icon: <FiList /> },
  { to: "/properties", label: "매물관리", icon: <FiHome /> },
  {
    label: "설정",
    icon: <FiSettings />,
    children: [
      { to: "/settings/users", label: "회원관리", icon: <FiUsers /> },
      { to: "/settings/subscriptions", label: "구독관리", icon: <FiCreditCard /> }
    ]
  }
];

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const [openSettings, setOpenSettings] = useState(
    location.pathname.startsWith("/settings")
  );

  return (
    <>
      {/* 모바일 오버레이 */}
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <nav>
        <ul className="sidebar-menu">
          {menu.map((item) => (
            <li key={item.label || item.to}>
              {item.children ? (
                <>
                  <div
                    className={
                      "sidebar-link" +
                      (openSettings ? " active" : "")
                    }
                    onClick={() => setOpenSettings((prev) => !prev)}
                    style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                  {openSettings && (
                    <ul className="sidebar-submenu">
                      {item.children.map((sub) => (
                        <li key={sub.to}>
                          <NavLink
                            to={sub.to}
                            className={({ isActive }) =>
                              "sidebar-link" + (isActive ? " active" : "")
                            }
                            onClick={onClose}
                          >
                            {sub.icon}
                            {sub.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
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
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar; 