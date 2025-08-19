/**
 * 헤더 컴포넌트 (Header.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 상단 헤더를 담당합니다.
 * 로고, 햄버거 메뉴, 사용자 정보, 로그아웃 기능을 포함하며,
 * 전체 애플리케이션의 브랜딩과 사용자 인터페이스를 제공합니다.
 * 
 * 주요 기능:
 * - 햄버거 메뉴 버튼 (사이드바 토글)
 * - 로고 및 브랜드명 표시
 * - 현재 로그인한 사용자 정보 표시
 * - 로그아웃 기능 제공
 * - 반응형 디자인 지원
 * 
 * 비즈니스 규칙:
 * - 모든 관리자 페이지에서 일관된 헤더 표시
 * - 햄버거 메뉴 클릭 시 사이드바 토글
 * - 사용자 정보가 없으면 "관리자"로 표시
 * - 로그아웃 버튼 클릭 시 즉시 로그아웃 처리
 * - 로고 클릭 시 홈 페이지로 이동 (선택적)
 * 
 * 데이터 형식:
 * - 사용자 정보: { id, email, name, role, agencyId, ... }
 * - 햄버거 클릭 핸들러: Function
 * - 로그아웃 핸들러: Function
 * 
 * 사용 예시:
 * 1. AdminLayout에서 사용자 정보와 함께 렌더링
 * 2. 햄버거 메뉴로 사이드바 열기/닫기
 * 3. 사용자 이름 표시 및 로그아웃 기능 제공
 * 4. 브랜드 로고 및 제목 표시
 */

import React from "react";
import { FiUser } from "react-icons/fi";
import logo from "../assets/goodreal.png"; // 로고 예시, 실제 로고로 교체 가능
import "./Header.css";

/**
 * 헤더 컴포넌트
 * 
 * 이 컴포넌트는 애플리케이션의 상단 헤더를 렌더링합니다.
 * 햄버거 메뉴, 로고, 사용자 정보, 로그아웃 버튼을 포함하며,
 * 관리자 페이지의 일관된 상단 네비게이션을 제공합니다.
 * 
 * 컴포넌트 구조:
 * Header
 * ├── Hamburger Button (사이드바 토글)
 * ├── Logo & Brand Name
 * └── User Info & Logout Button
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.user - 현재 로그인한 사용자 정보
 * @param {string} props.user.id - 사용자 고유 ID
 * @param {string} props.user.email - 사용자 이메일
 * @param {string} props.user.name - 사용자 이름 (표시용)
 * @param {string} props.user.role - 사용자 역할
 * @param {string} props.user.agencyId - 소속 에이전시 ID
 * @param {Function} props.onHamburgerClick - 햄버거 메뉴 클릭 핸들러
 * @param {Function} props.onLogout - 로그아웃 버튼 클릭 핸들러
 * @returns {JSX.Element} 헤더 UI
 * 
 * 사용 예시:
 * <Header 
 *   user={user} 
 *   onHamburgerClick={() => setSidebarOpen(!sidebarOpen)} 
 *   onLogout={handleLogout} 
 * />
 */
const Header = ({ user, onHamburgerClick, onLogout }) => (
  <div className="header-inner">
    {/* 햄버거 메뉴 버튼 - 사이드바 토글용 */}
    <button className="hamburger" onClick={onHamburgerClick}>
      ☰
    </button>
    
    {/* 로고 및 브랜드명 영역 */}
    <div className="header-logo">
      <img 
        src={logo} 
        alt="Good Real Admin" 
        width="64" 
        height="64" 
      />
      <span className="header-title">Good Real Admin</span>
    </div>
    
    {/* 사용자 정보 및 로그아웃 영역 */}
    <div className="header-user">
      {/* 사용자 아이콘 */}
      <FiUser size={20} className="header-user-icon" />
      
      {/* 사용자 이름 표시 (없으면 "관리자"로 표시) */}
      <span>{user?.name || "관리자"}</span>
      
      {/* 로그아웃 버튼 */}
      <button className="logout-btn" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  </div>
);

export default Header; 