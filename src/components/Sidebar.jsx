/**
 * 사이드바 컴포넌트 (Sidebar.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 좌측 네비게이션 사이드바를 담당합니다.
 * 메뉴 구조, 현재 페이지 하이라이트, 서브메뉴 토글 기능을 제공하며,
 * 반응형 디자인을 위한 모바일 오버레이를 포함합니다.
 * 
 * 주요 기능:
 * - 메인 네비게이션 메뉴 제공
 * - 서브메뉴 토글 기능
 * - 현재 페이지 활성 상태 표시
 * - 모바일 오버레이 (사이드바 닫기)
 * - 아이콘과 라벨을 포함한 메뉴 구조
 * 
 * 비즈니스 규칙:
 * - 현재 페이지에 해당하는 메뉴 항목이 활성 상태로 표시
 * - 설정 메뉴는 현재 설정 페이지에 있을 때 자동으로 열림
 * - 모바일에서 메뉴 클릭 시 자동으로 사이드바 닫힘
 * - 서브메뉴는 부모 메뉴 클릭 시 토글됨
 * - 홈 페이지("/")는 정확히 일치할 때만 활성화
 * 
 * 데이터 형식:
 * - 메뉴 구조: Array<{ to?: string, label: string, icon: JSX.Element, children?: Array }>
 * - 사이드바 상태: boolean (true: 열림, false: 닫힘)
 * - 서브메뉴 상태: boolean (true: 열림, false: 닫힘)
 * 
 * 사용 예시:
 * 1. AdminLayout에서 사이드바 상태와 함께 렌더링
 * 2. 현재 페이지에 따라 메뉴 활성 상태 자동 변경
 * 3. 설정 메뉴 클릭 시 서브메뉴 토글
 * 4. 모바일에서 오버레이 클릭 시 사이드바 닫기
 */

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiList, FiHome, FiSettings, FiUsers, FiCreditCard } from "react-icons/fi";
import "./Sidebar.css";

/**
 * 사이드바 메뉴 구조 정의
 * 
 * 메뉴 항목 구조:
 * - to: 라우트 경로 (없으면 서브메뉴를 가진 부모 메뉴)
 * - label: 메뉴 표시 텍스트
 * - icon: 메뉴 아이콘 (React 아이콘 컴포넌트)
 * - children: 서브메뉴 배열 (선택적)
 * 
 * @type {Array<Object>}
 * @property {string} to - 라우트 경로
 * @property {string} label - 메뉴 라벨
 * @property {JSX.Element} icon - 메뉴 아이콘
 * @property {Array<Object>} children - 서브메뉴 배열
 */
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

/**
 * 사이드바 컴포넌트
 * 
 * 이 컴포넌트는 애플리케이션의 좌측 네비게이션 메뉴를 렌더링합니다.
 * 메인 메뉴와 서브메뉴를 지원하며, 현재 페이지에 따라 활성 상태를
 * 자동으로 관리합니다.
 * 
 * 컴포넌트 구조:
 * Sidebar
 * ├── Overlay (모바일용)
 * └── Navigation Menu
 *     ├── Main Menu Items
 *     └── Submenu Items (토글 가능)
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.open - 사이드바 열림/닫힘 상태
 * @param {Function} props.onClose - 사이드바 닫기 핸들러
 * @returns {JSX.Element} 사이드바 UI
 * 
 * 사용 예시:
 * <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
 */
const Sidebar = ({ open, onClose }) => {
  // 현재 라우트 위치 정보
  const location = useLocation();
  
  /**
   * 설정 서브메뉴 열림/닫힘 상태
   * 현재 페이지가 설정 페이지로 시작하면 자동으로 열림
   * 
   * @type {boolean}
   */
  const [openSettings, setOpenSettings] = useState(
    location.pathname.startsWith("/settings")
  );

  return (
    <>
      {/* 모바일 오버레이 - 사이드바가 열려있을 때만 표시 */}
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      
      {/* 네비게이션 메뉴 */}
      <nav>
        <ul className="sidebar-menu">
          {menu.map((item) => (
            <li key={item.label || item.to}>
              {item.children ? (
                // 서브메뉴를 가진 부모 메뉴 항목
                <>
                  <div
                    className={
                      "sidebar-link" +
                      (openSettings ? " active" : "") +
                      " sidebar-parent"
                    }
                    onClick={() => setOpenSettings((prev) => !prev)}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                  
                  {/* 서브메뉴 (열림 상태일 때만 표시) */}
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
                // 일반 메뉴 항목 (서브메뉴 없음)
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    "sidebar-link" + (isActive ? " active" : "")
                  }
                  onClick={onClose}
                  end={item.to === "/"} // 홈 페이지는 정확히 일치할 때만 활성화
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