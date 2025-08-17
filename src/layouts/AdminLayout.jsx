/**
 * 관리자 레이아웃 컴포넌트 (AdminLayout.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 기본 레이아웃을 제공합니다.
 * 헤더, 사이드바, 메인 콘텐츠 영역, 푸터로 구성된 관리자 페이지의
 * 공통 구조를 정의합니다.
 * 
 * 주요 기능:
 * - 반응형 레이아웃 구조 제공
 * - 사이드바 열기/닫기 토글
 * - 사용자 정보 표시 및 로그아웃 기능
 * - 네비게이션 메뉴 제공
 * - 일관된 UI/UX 제공
 * 
 * 비즈니스 규칙:
 * - 모든 관리자 페이지는 이 레이아웃을 사용
 * - 사이드바는 기본적으로 열린 상태로 시작
 * - 헤더의 햄버거 메뉴로 사이드바 토글 가능
 * - 사용자 정보는 헤더에 표시
 * - 로그아웃 기능은 헤더에서 제공
 * 
 * 데이터 형식:
 * - 사용자 정보: { id, email, name, role, agencyId, ... }
 * - 사이드바 상태: boolean (true: 열림, false: 닫힘)
 * - 자식 컴포넌트: React.ReactNode
 * 
 * 사용 예시:
 * 1. App.jsx에서 인증된 사용자 페이지를 이 레이아웃으로 감싸기
 * 2. 각 페이지 컴포넌트가 children으로 전달됨
 * 3. 사용자 정보와 로그아웃 함수를 props로 전달
 * 4. 사이드바 토글 기능으로 반응형 UI 제공
 */

import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

/**
 * 관리자 레이아웃 컴포넌트
 * 
 * 이 컴포넌트는 관리자 페이지의 기본 구조를 제공합니다.
 * 헤더, 사이드바, 메인 콘텐츠, 푸터로 구성된 레이아웃을
 * 관리하며, 사이드바의 열기/닫기 상태를 제어합니다.
 * 
 * 컴포넌트 구조:
 * AdminLayout
 * ├── Header (사용자 정보, 햄버거 메뉴, 로그아웃)
 * ├── Sidebar (네비게이션 메뉴)
 * ├── Main Content (children 컴포넌트들)
 * └── Footer (저작권 정보 등)
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 레이아웃 내부에 렌더링할 자식 컴포넌트들
 * @param {Object} props.user - 현재 로그인한 사용자 정보
 * @param {string} props.user.id - 사용자 고유 ID
 * @param {string} props.user.email - 사용자 이메일
 * @param {string} props.user.name - 사용자 이름
 * @param {string} props.user.role - 사용자 역할 (ADMIN, AGENCY, AGENT 등)
 * @param {string} props.user.agencyId - 소속 에이전시 ID (에이전시 사용자의 경우)
 * @param {Function} props.onLogout - 로그아웃 처리 함수
 * @returns {JSX.Element} 관리자 레이아웃 UI
 * 
 * 사용 예시:
 * <AdminLayout user={user} onLogout={logout}>
 *   <Home />
 * </AdminLayout>
 */
const AdminLayout = ({ children, user, onLogout }) => {
  /**
   * 사이드바 열기/닫기 상태
   * true: 사이드바 열림, false: 사이드바 닫힘
   * 
   * @type {boolean}
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      {/* 헤더 영역 */}
      <header className="admin-header">
        <Header 
          user={user} 
          onHamburgerClick={() => setSidebarOpen(v => !v)} 
          onLogout={onLogout} 
        />
      </header>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="admin-body">
        {/* 사이드바 영역 */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
        </aside>
        
        {/* 메인 콘텐츠 영역 */}
        <main className="admin-main">
          {children}
        </main>
      </div>
      
      {/* 푸터 영역 */}
      <footer className="admin-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default AdminLayout; 