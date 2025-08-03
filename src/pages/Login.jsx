import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useAuth } from "../App";
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../assets/goodreal.png"; // 로고 예시, 실제 로고로 교체 가능

const EMAIL_KEY = "login_email";
const EMAIL_SAVE_KEY = "login_email_save";

const Login = () => {
  const { loginSuccess } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", username: "", name: "", phone: "" });
  const [saveEmail, setSaveEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // 이메일 자동 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(EMAIL_SAVE_KEY) === "true";
    setSaveEmail(saved);
    if (saved) {
      const savedEmail = localStorage.getItem(EMAIL_KEY);
      if (savedEmail) setForm(f => ({ ...f, email: savedEmail }));
    }
  }, []);

  // 이메일 입력 시 저장 체크된 경우에만 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "email" && saveEmail) {
      localStorage.setItem(EMAIL_KEY, e.target.value);
    }
  };

  // 체크박스 변경
  const handleSaveEmailChange = (e) => {
    const checked = e.target.checked;
    setSaveEmail(checked);
    localStorage.setItem(EMAIL_SAVE_KEY, checked);
    if (!checked) {
      localStorage.removeItem(EMAIL_KEY);
    } else {
      localStorage.setItem(EMAIL_KEY, form.email);
    }
  };

  // Caps Lock 감지
  const handlePasswordKeyUp = (e) => {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  };
  const handlePasswordBlur = () => setCapsLock(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("입력된 패스워드:", form.password);
    try {
      console.log("서버로 전송되는 패스워드:", form.password);
      const res = await apiClient.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      if (res.data.success) {
        document.cookie = `accessToken=${res.data.data.accessToken}; path=/`;
        document.cookie = `refreshToken=${res.data.data.refreshToken}; path=/`;
        if (saveEmail) localStorage.setItem(EMAIL_KEY, form.email);
        loginSuccess(res.data.data.user || res.data.data);
        window.location.href = "/";
      } else {
        setError(res.data.message || "로그인 실패");
      }
    } catch (err) {
      setError(err.response?.data?.message || "로그인 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/api/auth/register", {
        email: form.email,
        password: form.password,
        username: form.username,
        name: form.name,
        phone: form.phone,
      });
      if (res.data.success) {
        alert("회원가입이 완료되었습니다. 로그인 해주세요.");
        setIsLogin(true);
      } else {
        setError(res.data.message || "회원가입 실패");
      }
    } catch (err) {
      setError(err.response?.data?.message || "회원가입 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src={logo} alt="Good Real Admin" />
          <span>Good Real Admin</span>
        </div>
        <h2>{isLogin ? "로그인" : "회원가입"}</h2>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div className="input-group"><FiMail /><input name="username" placeholder="아이디" value={form.username} onChange={handleChange} required /></div>
              <div className="input-group"><FiMail /><input name="name" placeholder="이름" value={form.name} onChange={handleChange} required /></div>
              <div className="input-group"><FiMail /><input name="phone" placeholder="전화번호" value={form.phone} onChange={handleChange} required /></div>
            </>
          )}
          <div className="input-group">
            <FiMail />
            <input name="email" type="email" placeholder="이메일" value={form.email} onChange={handleChange} required autoComplete="username" />
          </div>
          <div className="input-group">
            <FiLock />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              onKeyUp={handlePasswordKeyUp}
              onBlur={handlePasswordBlur}
              required
              autoComplete="current-password"
            />
            <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {capsLock && <div className="capslock-warning"><FiAlertCircle /> Caps Lock이 켜져 있습니다.</div>}
          {isLogin && (
            <label className="login-save-email">
              <input type="checkbox" checked={saveEmail} onChange={handleSaveEmailChange} /> 이메일 저장
            </label>
          )}
          {error && <div className="login-error"><FiAlertCircle style={{marginRight:4}} />{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>
        <div className="login-toggle">
          {isLogin ? (
            <span>계정이 없으신가요? <button onClick={() => setIsLogin(false)}>회원가입</button></span>
          ) : (
            <span>이미 계정이 있으신가요? <button onClick={() => setIsLogin(true)}>로그인</button></span>
          )}
        </div>
        <footer className="login-footer">© 2025 Real Estate Admin. All rights reserved.</footer>
      </div>
    </div>
  );
};

export default Login; 