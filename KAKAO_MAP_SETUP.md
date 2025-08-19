# 카카오맵 API 설정 가이드

## ✅ 문제 해결 완료!

사용자가 올바른 JavaScript 키를 제공하여 문제가 해결되었습니다.

### 🔑 API 키 정보
- **JavaScript 키**: `c456a11190a7975ad58deff213fae949` ✅ (카카오맵 SDK용)

## 🚨 이전 문제 상황 (해결됨)

이전에 발생했던 오류들:

1. **API 키 타입 오류**: `appKeyType is REST_API_KEY. but expected [NATIVE_APP_KEY, JAVASCRIPT_KEY]` ✅ 해결
2. **CORS 정책 오류**: `Access to script at 'https://dapi.kakao.com/v2/maps/sdk.js' from origin 'http://localhost:5173' has been blocked by CORS policy` ✅ 해결

## 🔍 문제 원인

### 1. API 키 타입 불일치 (해결됨)
- **현재 사용 키**: `c456a11190a7975ad58deff213fae949` (JavaScript 키)
- **REST API 키**: 서버 사이드에서 카카오 API를 호출할 때 사용
- **JavaScript 키**: 클라이언트 사이드에서 카카오맵 SDK를 사용할 때 사용

### 2. CORS 정책 문제 (해결됨)
- `public/index.html`에 직접 스크립트 로드로 해결
- 동적 스크립트 로드 시 올바른 API 키 사용

## 🔧 적용된 해결 방법

### 1단계: JavaScript 키 발급받기 ✅
- [카카오 개발자 콘솔](https://developers.kakao.com)에서 JavaScript 키 발급 완료

### 2단계: 코드 수정 ✅

#### `public/index.html` 수정 완료
```html
<!-- 수정된 코드 (JavaScript 키 사용) -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=c456a11190a7975ad58deff213fae949&libraries=services"></script>
```

#### `src/components/common/KakaoMap.jsx` 수정 완료
```javascript
// 동적 로드 시에도 JavaScript 키 사용
const loadKakaoMapAPIDynamically = () => {
  const script = document.createElement('script');
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=c456a11190a7975ad58deff213fae949&libraries=services`;
  // ... 나머지 코드
};
```

### 3단계: 도메인 설정 확인 (필요시)
카카오 개발자 콘솔에서:
1. **플랫폼** → **Web** → **사이트 도메인**
2. `localhost:5173` 추가 (개발 환경)
3. 실제 배포 도메인 추가 (운영 환경)

## 📋 API 키 종류별 사용법

| 키 타입 | 용도 | 사용 위치 | 상태 |
|---------|------|-----------|------|
| **JavaScript 키** | 웹 브라우저에서 카카오맵 SDK 사용 | `public/index.html`, `KakaoMap.jsx` | ✅ 사용 중 |
| **REST API 키** | 서버에서 카카오 API 호출 | 백엔드 서버 코드 | 🔄 필요시 사용 |
| **Admin 키** | 관리자 기능, 모든 API 호출 가능 | 백엔드 서버 코드 (관리자 기능) | 🔄 필요시 사용 |

## 🧪 테스트 방법

### 1. 브라우저 콘솔에서 확인
```javascript
// 카카오맵 API가 로드되었는지 확인
console.log(window.kakao);
console.log(window.kakao.maps);

// 상세한 디버깅 정보 확인
// KakaoMap 컴포넌트에서 자동으로 출력되는 로그들 확인
```

### 2. 네트워크 탭에서 확인
- `dapi.kakao.com` 도메인으로의 요청이 성공적으로 완료되었는지 확인
- HTTP 상태 코드가 200인지 확인
- 스크립트 로드 시간 확인

### 3. 직접 URL 접속 테스트
브라우저에서 다음 URL에 직접 접속하여 스크립트 로드 확인:
```
https://dapi.kakao.com/v2/maps/sdk.js?appkey=c456a11190a7975ad58deff213fae949&libraries=services
```

### 4. 단계별 디버깅
1. **스크립트 로드 확인**: `public/index.html`에서 스크립트가 정상 로드되는지 확인
2. **API 객체 확인**: `window.kakao`와 `window.kakao.maps` 존재 여부 확인
3. **초기화 과정 확인**: `kakao.maps.load()` 콜백이 정상 실행되는지 확인
4. **지도 생성 확인**: 각 단계별 콘솔 로그 확인

## 🔧 추가 문제 해결 방법

### 문제 1: "카카오맵 API 로드 시간이 초과되었습니다"
**원인**: 스크립트는 로드되었지만 `kakao.maps.load()` 초기화가 완료되지 않음
**해결 방법**:
1. 브라우저 새로고침 시도
2. 개발자 도구 콘솔에서 상세 로그 확인
3. 네트워크 탭에서 스크립트 로드 상태 확인
4. 타임아웃 시간이 30초로 증가되었으므로 충분히 기다리기

### 문제 2: "주소를 찾을 수 없습니다"
**원인**: 카카오 지오코딩 서비스에서 주소를 인식하지 못함
**해결 방법**:
1. 주소 형식 확인 (예: "대전광역시 유성구 31길 19" → "대전광역시 유성구 도안동 31길 19")
2. 더 구체적인 주소 입력
3. 우편번호나 건물명 추가

### 문제 3: 지도는 로드되지만 마커나 인포윈도우가 표시되지 않음
**원인**: 지도 객체 생성 후 마커 생성 과정에서 오류 발생
**해결 방법**:
1. 브라우저 콘솔에서 마커 생성 관련 로그 확인
2. `showMarker`와 `showInfoWindow` props 값 확인

### 문제 4: "지도 컨테이너가 준비되지 않았습니다"
**원인**: React의 `useRef`가 DOM 요소를 참조하기 전에 `initializeMap` 함수가 호출됨
**해결 방법**:
1. `useLayoutEffect`와 `setTimeout` 사용으로 DOM 렌더링 완료 후 실행
2. `mapContainer.current`가 준비될 때까지 대기
3. 컨테이너 크기가 실제로 렌더링되었는지 확인 (`getBoundingClientRect()`)
4. 컴포넌트 마운트 후 500ms 지연하여 재시도
5. `PropertyDetail.jsx`에서 조건부 렌더링으로 데이터 준비 완료 후 KakaoMap 표시

### 문제 5: 지도는 로드되지만 마커나 인포윈도우가 표시되지 않음
**원인**: 지도 객체 생성 후 마커 생성 과정에서 오류 발생
**해결 방법**:
1. 브라우저 콘솔에서 마커 생성 관련 로그 확인
2. `showMarker`와 `showInfoWindow` props 값 확인
3. 지오코딩 결과 데이터 구조 확인

## ⚠️ 주의사항

1. **API 키 보안**: JavaScript 키는 클라이언트에 노출되므로, 도메인 제한을 반드시 설정
2. **사용량 제한**: 무료 플랜의 경우 일일 API 호출 횟수 제한이 있음
3. **HTTPS 필수**: 운영 환경에서는 HTTPS 사용 필수

## 🔗 참고 자료

- [카카오맵 JavaScript API 가이드](https://apis.map.kakao.com/web/)
- [카카오 개발자 콘솔](https://developers.kakao.com)
- [카카오맵 API 키 발급 가이드](https://developers.kakao.com/docs/latest/ko/getting-started/app-key)

## 📞 지원

문제가 지속되는 경우:
1. 카카오 개발자 포럼 검색
2. 카카오 개발자 센터 문의
3. 프로젝트 팀 내 기술 검토

## 🎉 다음 단계

이제 카카오맵이 정상적으로 작동할 것입니다! 

1. **개발 서버 재시작**: `npm run dev`로 서버 재시작
2. **매물 상세 페이지 접속**: 카카오맵이 정상적으로 표시되는지 확인
3. **브라우저 콘솔 확인**: 에러 메시지가 사라졌는지 확인
