/**
 * API 클라이언트 설정 (apiClient.js)
 * 
 * 이 파일은 부동산 관리 시스템의 HTTP API 통신을 담당하는 axios 인스턴스를 설정합니다.
 * 토큰 기반 인증, 자동 토큰 갱신, 에러 처리 등의 기능을 제공합니다.
 * 
 * 주요 기능:
 * - axios 인스턴스 생성 및 기본 설정
 * - 자동 Authorization 헤더 추가
 * - 토큰 만료 시 자동 갱신
 * - 토큰 저장/관리 유틸리티 함수
 * - 에러 처리 및 로그아웃 자동화
 * 
 * 비즈니스 규칙:
 * - 모든 API 요청에 자동으로 Authorization 헤더 추가
 * - 401 에러 발생 시 refreshToken으로 자동 토큰 갱신 시도
 * - 토큰 갱신 실패 시 자동 로그아웃 및 로그인 페이지로 이동
 * - accessToken은 쿠키에, refreshToken은 localStorage에 저장
 * 
 * 데이터 형식:
 * - API 응답: { success: boolean, data: any, message?: string }
 * - 토큰 정보: { accessToken: string, refreshToken: string }
 * - 요청 헤더: { Authorization: "Bearer {token}", Content-Type: "application/json" }
 * 
 * 사용 예시:
 * 1. 일반 API 호출: apiClient.get('/api/users')
 * 2. POST 요청: apiClient.post('/api/auth/login', { email, password })
 * 3. PUT 요청: apiClient.put('/api/properties/123', { name, price })
 * 4. DELETE 요청: apiClient.delete('/api/properties/123')
 */

import axios from "axios";

/**
 * 토큰 관리 유틸리티 함수들
 * 인증 토큰의 저장, 조회, 삭제를 담당하는 헬퍼 함수들
 */

/**
 * 쿠키에서 accessToken을 읽어오는 함수
 * 브라우저 재시작 시에도 토큰이 유지되도록 쿠키에 저장
 * 
 * @returns {string|null} accessToken 또는 null (존재하지 않는 경우)
 * 
 * 사용 예시:
 * const token = getAccessToken();
 * if (token) { /* 토큰이 존재하는 경우 처리 *\/ }
 */
function getAccessToken() {
  const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * localStorage에서 refreshToken을 읽어오는 함수
 * refreshToken은 보안상 localStorage에 저장하여 쿠키와 분리
 * 
 * @returns {string|null} refreshToken 또는 null (존재하지 않는 경우)
 * 
 * 사용 예시:
 * const refreshToken = getRefreshToken();
 * if (refreshToken) { /* 토큰 갱신 시도 *\/ }
 */
function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

/**
 * 새로운 토큰을 저장하는 함수
 * 로그인 성공 시 또는 토큰 갱신 시 호출
 * 
 * @param {Object} tokens - 저장할 토큰 객체
 * @param {string} tokens.accessToken - 새로운 accessToken
 * @param {string} tokens.refreshToken - 새로운 refreshToken
 * 
 * 저장 방식:
 * - accessToken: 쿠키에 저장 (브라우저 재시작 시 유지)
 * - refreshToken: localStorage에 저장 (보안상 분리)
 * 
 * 사용 예시:
 * setTokens({ accessToken: 'new-access-token', refreshToken: 'new-refresh-token' });
 */
function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

/**
 * 로그아웃 처리 함수
 * 모든 토큰을 삭제하고 로그인 페이지로 리다이렉트
 * 
 * 처리 과정:
 * 1. localStorage에서 모든 토큰 삭제
 * 2. 로그인 페이지로 강제 이동
 * 
 * 사용 예시:
 * logout(); // 토큰 삭제 및 로그인 페이지로 이동
 */
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

/**
 * axios 인스턴스 생성
 * 기본 설정과 인터셉터를 포함한 HTTP 클라이언트
 * 
 * 설정 내용:
 * - baseURL: API 서버 기본 주소
 * - headers: 기본 요청 헤더 설정
 * - withCredentials: 쿠키 포함 여부 (CORS 설정)
 * 
 * @type {axios.AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: "http://localhost:8080", // API 서버 주소
  headers: {
    "Content-Type": "application/json", // JSON 형식으로 통신
  },
  withCredentials: true // 쿠키 포함 (CORS 설정)
});

/**
 * 요청 인터셉터
 * 모든 API 요청 전에 자동으로 Authorization 헤더를 추가
 * 
 * 처리 과정:
 * 1. 쿠키에서 accessToken 확인
 * 2. 토큰이 존재하면 Authorization 헤더에 추가
 * 3. 요청 로그 출력 (디버깅용)
 * 
 * @param {Object} config - axios 요청 설정 객체
 * @returns {Object} 수정된 요청 설정 객체
 * 
 * 사용 예시:
 * // 자동으로 Authorization 헤더가 추가됨
 * apiClient.get('/api/users'); // Bearer {token} 헤더 자동 추가
 */
apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[apiClient] Authorization 헤더 추가:', config.headers.Authorization);
  } else {
    console.log('[apiClient] Authorization 헤더 없음');
  }
  return config;
});

/**
 * 응답 인터셉터
 * API 응답을 처리하고 토큰 만료 시 자동 갱신을 시도
 * 
 * 처리 과정:
 * 1. 정상 응답은 그대로 반환
 * 2. 401 에러 발생 시 refreshToken으로 토큰 갱신 시도
 * 3. 토큰 갱신 성공 시 원래 요청을 새로운 토큰으로 재시도
 * 4. 토큰 갱신 실패 시 자동 로그아웃
 * 
 * API 엔드포인트: /api/auth/refresh (POST)
 * 요청 헤더: Authorization: Bearer {refreshToken}
 * 
 * 응답 데이터 형식:
 * {
 *   success: boolean,
 *   data: {
 *     accessToken: string,
 *     refreshToken: string
 *   }
 * }
 * 
 * @param {Object} response - 성공 응답 객체
 * @param {Object} error - 에러 객체
 * @returns {Promise} 처리된 응답 또는 에러
 * 
 * 사용 예시:
 * // 토큰이 만료되어도 자동으로 갱신 후 재시도됨
 * apiClient.get('/api/protected-data');
 */
apiClient.interceptors.response.use(
  response => response, // 성공 응답은 그대로 반환
  async error => {
    const originalRequest = error.config;
    
    // 401 에러이고 아직 재시도하지 않은 경우에만 토큰 갱신 시도
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정
      
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        
        // refreshToken으로 새로운 토큰 요청
        const res = await axios.post(
          '/api/auth/refresh',
          {},
          { 
            headers: { Authorization: `Bearer ${refreshToken}` }, 
            baseURL: 'http://localhost:8080' 
          }
        );
        
        // 새로운 토큰 저장
        setTokens(res.data.data);
        
        // 원래 요청에 새로운 토큰으로 헤더 업데이트
        originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
        
        // 원래 요청을 새로운 토큰으로 재시도
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    // 401이 아닌 에러는 그대로 반환
    return Promise.reject(error);
  }
);

export default apiClient; 