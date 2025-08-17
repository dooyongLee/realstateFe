/**
 * 로그인/회원가입 페이지 (Login.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 사용자 인증을 담당합니다.
 * 로그인과 회원가입 기능을 하나의 페이지에서 제공하며, 사용자 경험을
 * 향상시키는 다양한 기능들을 포함합니다.
 * 
 * 주요 기능:
 * - 로그인/회원가입 폼 전환
 * - 이메일 자동 저장 및 불러오기
 * - 비밀번호 표시/숨김 토글
 * - Caps Lock 경고 표시
 * - 로딩 상태 및 에러 메시지 표시
 * - 토큰 기반 인증 처리
 * 
 * 비즈니스 규칙:
 * - 로그인 성공 시 토큰을 쿠키에 저장하고 메인 페이지로 이동
 * - 회원가입 성공 시 로그인 모드로 전환
 * - 이메일 저장 옵션은 localStorage에 설정 저장
 * - 비밀번호는 기본적으로 숨김 처리
 * - Caps Lock이 켜져 있을 때 경고 메시지 표시
 * 
 * 데이터 형식:
 * - 로그인 요청: { email: string, password: string }
 * - 회원가입 요청: { email: string, password: string, username: string, name: string, phone: string }
 * - 로그인 응답: { success: boolean, data: { accessToken: string, refreshToken: string, user: Object } }
 * - 회원가입 응답: { success: boolean, message: string }
 * 
 * 사용 예시:
 * 1. 사용자가 로그인 페이지 접속
 * 2. 이메일/비밀번호 입력 및 로그인 시도
 * 3. 로그인 성공 시 토큰 저장 및 메인 페이지로 이동
 * 4. 회원가입 모드에서 신규 사용자 등록
 * 5. 이메일 저장 옵션으로 편의성 제공
 */

import React, { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { useAuth } from "../App";
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../assets/goodreal.png"; // 로고 예시, 실제 로고로 교체 가능

/**
 * localStorage 키 상수
 * 이메일 저장 관련 설정을 위한 키 값들
 * 
 * @type {string}
 */
const EMAIL_KEY = "login_email";
const EMAIL_SAVE_KEY = "login_email_save";

/**
 * 로그인/회원가입 페이지 컴포넌트
 * 
 * @returns {JSX.Element} 로그인/회원가입 페이지 UI
 */
const Login = () => {
  // 인증 컨텍스트에서 로그인 성공 함수 가져오기
  const { loginSuccess } = useAuth();
  
  /**
   * 로그인/회원가입 모드 상태
   * true: 로그인 모드, false: 회원가입 모드
   * 
   * @type {boolean}
   */
  const [isLogin, setIsLogin] = useState(true);
  
  /**
   * 폼 데이터 상태
   * 사용자 입력 정보를 저장하는 객체
   * 
   * @type {Object}
   * @property {string} email - 사용자 이메일
   * @property {string} password - 사용자 비밀번호
   * @property {string} username - 사용자 아이디 (회원가입 시)
   * @property {string} name - 사용자 이름 (회원가입 시)
   * @property {string} phone - 사용자 전화번호 (회원가입 시)
   */
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    username: "", 
    name: "", 
    phone: "" 
  });
  
  /**
   * 이메일 저장 체크박스 상태
   * 사용자가 이메일 저장을 원하는지 여부
   * 
   * @type {boolean}
   */
  const [saveEmail, setSaveEmail] = useState(false);
  
  /**
   * 로딩 상태
   * API 요청 중일 때 true
   * 
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * 에러 메시지 상태
   * 로그인/회원가입 실패 시 표시할 에러 메시지
   * 
   * @type {string}
   */
  const [error, setError] = useState("");
  
  /**
   * 비밀번호 표시 상태
   * true: 비밀번호 표시, false: 비밀번호 숨김
   * 
   * @type {boolean}
   */
  const [showPassword, setShowPassword] = useState(false);
  
  /**
   * Caps Lock 상태
   * Caps Lock이 켜져 있는지 여부
   * 
   * @type {boolean}
   */
  const [capsLock, setCapsLock] = useState(false);

  /**
   * 이메일 자동 불러오기
   * 컴포넌트 마운트 시 저장된 이메일 설정을 확인하고 불러오기
   * 
   * 처리 과정:
   * 1. localStorage에서 이메일 저장 설정 확인
   * 2. 저장 설정이 true인 경우 저장된 이메일 불러오기
   * 3. 폼 상태에 이메일 설정
   * 
   * 사용 예시:
   * // 이전에 이메일 저장을 체크했다면 자동으로 이메일이 입력됨
   */
  useEffect(() => {
    const saved = localStorage.getItem(EMAIL_SAVE_KEY) === "true";
    setSaveEmail(saved);
    if (saved) {
      const savedEmail = localStorage.getItem(EMAIL_KEY);
      if (savedEmail) setForm(f => ({ ...f, email: savedEmail }));
    }
  }, []);

  /**
   * 폼 입력 변경 핸들러
   * 사용자 입력에 따라 폼 상태를 업데이트하고 이메일 저장 처리
   * 
   * @param {Event} e - 입력 이벤트 객체
   * @param {string} e.target.name - 입력 필드 이름
   * @param {string} e.target.value - 입력된 값
   * 
   * 처리 과정:
   * 1. 폼 상태 업데이트
   * 2. 이메일 필드이고 저장 체크된 경우 localStorage에 저장
   * 
   * 사용 예시:
   * <input name="email" onChange={handleChange} />
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "email" && saveEmail) {
      localStorage.setItem(EMAIL_KEY, e.target.value);
    }
  };

  /**
   * 이메일 저장 체크박스 변경 핸들러
   * 이메일 저장 설정을 변경하고 localStorage에 저장
   * 
   * @param {Event} e - 체크박스 이벤트 객체
   * @param {boolean} e.target.checked - 체크박스 상태
   * 
   * 처리 과정:
   * 1. 체크박스 상태 업데이트
   * 2. localStorage에 설정 저장
   * 3. 체크 해제 시 저장된 이메일 삭제
   * 4. 체크 시 현재 이메일 저장
   * 
   * 사용 예시:
   * <input type="checkbox" onChange={handleSaveEmailChange} />
   */
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

  /**
   * 비밀번호 입력 시 Caps Lock 감지
   * 키보드 이벤트를 통해 Caps Lock 상태를 확인
   * 
   * @param {KeyboardEvent} e - 키보드 이벤트 객체
   * 
   * 사용 예시:
   * <input onKeyUp={handlePasswordKeyUp} />
   */
  const handlePasswordKeyUp = (e) => {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  };
  
  /**
   * 비밀번호 입력 필드 포커스 아웃 시 Caps Lock 경고 숨김
   * 
   * 사용 예시:
   * <input onBlur={handlePasswordBlur} />
   */
  const handlePasswordBlur = () => setCapsLock(false);

  /**
   * 로그인 처리 함수
   * 사용자 로그인을 처리하고 성공 시 토큰 저장 및 페이지 이동
   * 
   * API 엔드포인트: /api/auth/login (POST)
   * 요청 데이터: { email: string, password: string }
   * 
   * 응답 데이터 형식:
   * {
   *   success: boolean,
   *   data: {
   *     accessToken: string,
   *     refreshToken: string,
   *     user: {
   *       id: string,
   *       email: string,
   *       name: string,
   *       role: string,
   *       ...기타 사용자 정보
   *     }
   *   },
   *   message?: string
   * }
   * 
   * 처리 과정:
   * 1. 폼 제출 이벤트 기본 동작 방지
   * 2. 로딩 상태 활성화 및 에러 초기화
   * 3. 로그인 API 호출
   * 4. 성공 시 토큰을 쿠키에 저장
   * 5. 이메일 저장 설정이 켜진 경우 이메일 저장
   * 6. 전역 인증 상태 업데이트
   * 7. 메인 페이지로 리다이렉트
   * 8. 실패 시 에러 메시지 표시
   * 
   * @param {Event} e - 폼 제출 이벤트 객체
   * @returns {Promise<void>}
   * 
   * 사용 예시:
   * <form onSubmit={handleLogin}>
   */
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
        // 토큰을 쿠키에 저장 (브라우저 재시작 시에도 유지)
        document.cookie = `accessToken=${res.data.data.accessToken}; path=/`;
        document.cookie = `refreshToken=${res.data.data.refreshToken}; path=/`;
        
        // 이메일 저장 설정이 켜진 경우 이메일 저장
        if (saveEmail) localStorage.setItem(EMAIL_KEY, form.email);
        
        // 전역 인증 상태 업데이트
        loginSuccess(res.data.data.user || res.data.data);
        
        // 메인 페이지로 리다이렉트
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

  /**
   * 회원가입 처리 함수
   * 신규 사용자 등록을 처리하고 성공 시 로그인 모드로 전환
   * 
   * API 엔드포인트: /api/auth/register (POST)
   * 요청 데이터: { email: string, password: string, username: string, name: string, phone: string }
   * 
   * 응답 데이터 형식:
   * {
   *   success: boolean,
   *   message: string
   * }
   * 
   * 처리 과정:
   * 1. 폼 제출 이벤트 기본 동작 방지
   * 2. 로딩 상태 활성화 및 에러 초기화
   * 3. 회원가입 API 호출
   * 4. 성공 시 성공 메시지 표시 및 로그인 모드로 전환
   * 5. 실패 시 에러 메시지 표시
   * 
   * @param {Event} e - 폼 제출 이벤트 객체
   * @returns {Promise<void>}
   * 
   * 사용 예시:
   * <form onSubmit={handleRegister}>
   */
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
        {/* 로고 및 제목 영역 */}
        <div className="login-logo">
          <img src={logo} alt="Good Real Admin" />
          <span>Good Real Admin</span>
        </div>
        
        {/* 페이지 제목 */}
        <h2>{isLogin ? "로그인" : "회원가입"}</h2>
        
        {/* 로그인/회원가입 폼 */}
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {/* 회원가입 시에만 표시되는 추가 필드들 */}
          {!isLogin && (
            <>
              <div className="input-group">
                <FiMail />
                <input 
                  name="username" 
                  placeholder="아이디" 
                  value={form.username} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-group">
                <FiMail />
                <input 
                  name="name" 
                  placeholder="이름" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-group">
                <FiMail />
                <input 
                  name="phone" 
                  placeholder="전화번호" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </>
          )}
          
          {/* 이메일 입력 필드 */}
          <div className="input-group">
            <FiMail />
            <input 
              name="email" 
              type="email" 
              placeholder="이메일" 
              value={form.email} 
              onChange={handleChange} 
              required 
              autoComplete="username" 
            />
          </div>
          
          {/* 비밀번호 입력 필드 */}
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
            {/* 비밀번호 표시/숨김 토글 버튼 */}
            <button 
              type="button" 
              className="pw-toggle" 
              onClick={() => setShowPassword(v => !v)} 
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          
          {/* Caps Lock 경고 메시지 */}
          {capsLock && (
            <div className="capslock-warning">
              <FiAlertCircle /> Caps Lock이 켜져 있습니다.
            </div>
          )}
          
          {/* 로그인 시에만 표시되는 이메일 저장 체크박스 */}
          {isLogin && (
            <label className="login-save-email">
              <input 
                type="checkbox" 
                checked={saveEmail} 
                onChange={handleSaveEmailChange} 
              /> 이메일 저장
            </label>
          )}
          
          {/* 에러 메시지 표시 */}
          {error && (
            <div className="login-error">
              <FiAlertCircle style={{marginRight:4}} />
              {error}
            </div>
          )}
          
          {/* 제출 버튼 */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              isLogin ? "로그인" : "회원가입"
            )}
          </button>
        </form>
        
        {/* 로그인/회원가입 모드 전환 */}
        <div className="login-toggle">
          {isLogin ? (
            <span>
              계정이 없으신가요? 
              <button onClick={() => setIsLogin(false)}>회원가입</button>
            </span>
          ) : (
            <span>
              이미 계정이 있으신가요? 
              <button onClick={() => setIsLogin(true)}>로그인</button>
            </span>
          )}
        </div>
        
        {/* 푸터 */}
        <footer className="login-footer">
          © 2025 Real Estate Admin. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Login; 