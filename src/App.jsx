/**
 * 부동산 관리 시스템 메인 애플리케이션 (App.jsx)
 * 
 * 이 파일은 부동산 관리 시스템의 루트 컴포넌트로, 전체 애플리케이션의 구조와
 * 라우팅을 담당합니다. 인증 상태 관리와 페이지 간 네비게이션을 처리합니다.
 * 
 * 주요 기능:
 * - 인증 상태 관리 (로그인/로그아웃)
 * - 라우팅 설정 및 보호된 라우트 관리
 * - 자동 로그인 (쿠키 기반 토큰 관리)
 * - 전역 상태 관리 (AuthContext)
 * 
 * 비즈니스 규칙:
 * - 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
 * - 로그인한 사용자는 관리자 레이아웃으로 감싸진 페이지에 접근
 * - 토큰은 쿠키에 저장되어 브라우저 재시작 시에도 유지
 * - 로그아웃 시 모든 토큰 삭제 및 로그인 페이지로 이동
 * 
 * 데이터 형식:
 * - 사용자 정보: { id, email, name, role, agencyId, ... }
 * - 인증 토큰: accessToken, refreshToken (쿠키 저장)
 * - 라우트 경로: /, /properties, /settings, /login 등
 * 
 * 사용 예시:
 * 1. 사용자가 애플리케이션 접속
 * 2. 쿠키에서 토큰 확인 및 자동 로그인 시도
 * 3. 로그인 성공 시 해당 권한에 맞는 페이지 표시
 * 4. 로그인 실패 시 로그인 페이지로 리다이렉트
 * 5. 로그아웃 시 모든 세션 정보 삭제
 */

import React, { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Properties from "./pages/Properties/Properties";
import PropertyForm from "./pages/Properties/PropertyForm";
import PropertyDetail from "./pages/Properties/PropertyDetail";
import UsersManage from "./pages/Settings/UsersManage";
import SubscriptionsManage from "./pages/Settings/SubscriptionsManage";
import Login from "./pages/Login";
import apiClient from "./api/apiClient";

/**
 * 인증 컨텍스트 생성
 * 전역적으로 사용자 인증 상태를 관리하기 위한 React Context
 * 
 * @type {React.Context}
 */
const AuthContext = createContext();

/**
 * 인증 컨텍스트 사용을 위한 커스텀 훅
 * 컴포넌트에서 인증 관련 상태와 함수에 접근할 때 사용
 * 
 * @returns {Object} 인증 컨텍스트 값 { user, loginSuccess, logout, loading }
 */
export const useAuth = () => useContext(AuthContext);

/**
 * 인증 상태 관리 컴포넌트
 * 사용자의 로그인 상태를 관리하고 자동 로그인 기능을 제공
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트들
 * @returns {JSX.Element} AuthContext.Provider로 감싼 자식 컴포넌트들
 */
function AuthProvider({ children }) {
  /**
   * 현재 로그인한 사용자 정보 상태
   * 로그인하지 않은 경우 null
   * 
   * @type {Object|null} 사용자 정보 객체 또는 null
   * @property {string} id - 사용자 고유 ID
   * @property {string} email - 사용자 이메일
   * @property {string} name - 사용자 이름
   * @property {string} role - 사용자 역할 (ADMIN, AGENCY, AGENT 등)
   * @property {string} agencyId - 소속 에이전시 ID (에이전시 사용자의 경우)
   */
  const [user, setUser] = useState(null);
  
  /**
   * 로딩 상태
   * 자동 로그인 확인 중일 때 true
   * 
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);

  /**
   * 쿠키에서 특정 이름의 값을 읽어오는 함수
   * 토큰 저장소로 쿠키를 사용하여 브라우저 재시작 시에도 로그인 상태 유지
   * 
   * @param {string} name - 읽어올 쿠키의 이름
   * @returns {string|null} 쿠키 값 또는 null (존재하지 않는 경우)
   * 
   * 사용 예시:
   * const token = getCookie("accessToken");
   * if (token) { /* 토큰이 존재하는 경우 처리 *\/ }
   */
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  /**
   * 자동 로그인 처리
   * 애플리케이션 시작 시 쿠키에 저장된 토큰을 확인하여 자동 로그인 시도
   * 
   * API 엔드포인트: /api/auth/me
   * 요청 헤더: Authorization: Bearer {accessToken}
   * 
   * 응답 데이터 형식:
   * {
   *   success: boolean,
   *   data: {
   *     id: string,
   *     email: string,
   *     name: string,
   *     role: string,
   *     agencyId: string,
   *     ...기타 사용자 정보
   *   }
   * }
   * 
   * 비즈니스 로직:
   * 1. 쿠키에서 accessToken 확인
   * 2. 토큰이 존재하면 /api/auth/me API 호출
   * 3. 응답이 성공적이면 사용자 정보를 상태에 저장
   * 4. 실패하거나 토큰이 없으면 로그인 상태로 설정
   * 5. 로딩 상태를 false로 변경
   */
  useEffect(() => {
    const accessToken = getCookie("accessToken");
    if (accessToken) {
      apiClient.get("/api/auth/me", { headers: { Authorization: `Bearer ${accessToken}` } })
        .then(res => {
          console.log('me 응답:', res.data);
          if (res.data.success) setUser(res.data.data);
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * 로그아웃 처리 함수
   * 사용자 로그아웃 시 모든 세션 정보를 삭제하고 로그인 페이지로 이동
   * 
   * 처리 과정:
   * 1. 서버에 로그아웃 요청 전송 (선택적)
   * 2. 쿠키에서 모든 토큰 삭제
   * 3. 사용자 상태를 null로 초기화
   * 4. 로그인 페이지로 리다이렉트
   * 
   * API 엔드포인트: /api/auth/logout (POST)
   * 
   * @returns {Promise<void>}
   * 
   * 사용 예시:
   * const { logout } = useAuth();
   * await logout(); // 로그아웃 실행
   */
  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {}
    // 쿠키에서 토큰 삭제 (만료일을 과거로 설정)
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    window.location.href = "/login";
  };

  /**
   * 로그인 성공 시 호출되는 함수
   * 로그인 컴포넌트에서 로그인 성공 시 사용자 정보를 전역 상태에 저장
   * 
   * @param {Object} user - 로그인한 사용자 정보
   * @property {string} user.id - 사용자 ID
   * @property {string} user.email - 사용자 이메일
   * @property {string} user.name - 사용자 이름
   * @property {string} user.role - 사용자 역할
   * @property {string} user.agencyId - 소속 에이전시 ID
   */
  const loginSuccess = (user) => setUser(user);

  /**
   * AuthContext.Provider로 감싸서 전역 상태 제공
   * 모든 자식 컴포넌트에서 인증 관련 상태와 함수에 접근 가능
   */
  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 애플리케이션 라우팅 컴포넌트
 * 인증 상태에 따라 적절한 페이지를 렌더링하고 보호된 라우트를 관리
 * 
 * 라우팅 규칙:
 * - /login: 로그인 페이지 (인증되지 않은 사용자만 접근)
 * - /*: 보호된 라우트 (인증된 사용자만 접근)
 * - 인증되지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트
 * 
 * @returns {JSX.Element} 현재 인증 상태에 맞는 페이지 컴포넌트
 */
function AppRoutes() {
  const { user, loading, logout } = useAuth();
  
  // 로딩 중일 때는 빈 div 반환 (로딩 스피너 대신)
  if (loading) return <div />;
  
  return (
    <Routes>
      {/* 로그인 페이지 - 인증되지 않은 사용자만 접근 */}
      <Route path="/login" element={<Login />} />
      
      {/* 보호된 라우트 - 인증된 사용자만 접근 */}
      <Route
        path="/*"
        element={
          user ? (
            // 인증된 사용자: 관리자 레이아웃으로 감싸진 페이지들
            <AdminLayout user={user} onLogout={logout}>
              <Routes>
                {/* 홈 페이지 */}
                <Route path="/" element={<Home />} />
                
                {/* 부동산 관리 페이지들 */}
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/add" element={<PropertyForm />} />
                <Route path="/properties/edit/:id" element={<PropertyForm />} />
                <Route path="/properties/detail/:id" element={<PropertyDetail />} />
                
                {/* 설정 페이지들 */}
                <Route path="/settings/users" element={<UsersManage />} />
                <Route path="/settings/subscriptions" element={<SubscriptionsManage />} />
                <Route path="/settings" element={<Navigate to="/settings/users" replace />} />
              </Routes>
            </AdminLayout>
          ) : (
            // 인증되지 않은 사용자: 로그인 페이지로 리다이렉트
            <Login />
          )
        }
      />
    </Routes>
  );
}

/**
 * 애플리케이션 루트 컴포넌트
 * 전체 애플리케이션의 최상위 컴포넌트로, 라우터와 인증 제공자를 설정
 * 
 * 컴포넌트 구조:
 * App
 * ├── BrowserRouter (라우팅 관리)
 * └── AuthProvider (인증 상태 관리)
 *     └── AppRoutes (실제 라우팅 로직)
 * 
 * @returns {JSX.Element} 전체 애플리케이션 구조
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
