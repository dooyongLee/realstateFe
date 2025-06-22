import React, { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Properties from "./pages/Properties/Properties";
import Users from "./pages/Users/Users";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import apiClient from "./api/apiClient";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 쿠키에서 토큰 읽기
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  // 자동 로그인 (앱 시작 시)
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

  // 로그아웃
  const logout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {}
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    window.location.href = "/login";
  };

  // 로그인 성공 시 호출될 setter
  const loginSuccess = (user) => setUser(user);

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function AppRoutes() {
  const { user, loading, logout } = useAuth();
  if (loading) return <div />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          user ? (
            <AdminLayout user={user} onLogout={logout}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Login />
          )
        }
      />
    </Routes>
  );
}

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
