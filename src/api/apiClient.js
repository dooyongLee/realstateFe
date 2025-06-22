import axios from "axios";

// 토큰 저장/가져오기 유틸
function getAccessToken() {
  const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
  return match ? match[2] : null;
}
function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}
function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}
function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// 모든 요청에 Authorization 헤더 자동 추가
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

// accessToken 만료 시 refreshToken으로 자동 재발급 및 재시도
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(
          '/api/auth/refresh',
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` }, baseURL: 'http://localhost:8080' }
        );
        setTokens(res.data.data);
        originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 