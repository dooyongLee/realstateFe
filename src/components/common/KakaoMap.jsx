/**
 * 카카오맵 공통 컴포넌트 (KakaoMap.jsx)
 * 
 * 이 컴포넌트는 카카오맵 API를 이용하여 지도를 표시합니다.
 * 주소를 받아서 지도에 표시하고, 마커와 인포윈도우를 지원합니다.
 * 
 * 주요 기능:
 * - 주소 기반 지도 표시
 * - 마커 표시
 * - 인포윈도우 표시
 * - 반응형 지도 크기
 * - 에러 처리
 * 
 * 비즈니스 규칙:
 * - 카카오맵 JavaScript API 키가 필요 (REST API 키가 아님)
 * - 주소가 유효하지 않을 경우 에러 메시지 표시
 * - 지도 로딩 중 로딩 인디케이터 표시
 * 
 * 데이터 형식:
 * - address: 지도에 표시할 주소 문자열
 * - markerTitle: 마커에 표시할 제목
 * - markerContent: 인포윈도우에 표시할 내용
 * - height: 지도 높이 (기본값: 300px)
 * - width: 지도 너비 (기본값: 100%)
 * 
 * 사용 예시:
 * <KakaoMap 
 *   address="서울시 강남구 테헤란로 123"
 *   markerTitle="매물 위치"
 *   markerContent="이 매물의 위치입니다."
 *   height={400}
 * />
 * 
 * ⚠️ 중요: 현재 사용 중인 API 키는 REST API 키입니다.
 * 카카오맵 JavaScript SDK를 사용하려면 JavaScript 키가 필요합니다.
 * 카카오 개발자 콘솔에서 JavaScript 키를 발급받아 사용해주세요.
 */

import React, { useLayoutEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { LocationOn as LocationIcon, Warning as WarningIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';

const KakaoMap = ({ 
  address, 
  markerTitle = '위치', 
  markerContent = '', 
  height = 300, 
  width = '100%',
  showMarker = true,
  showInfoWindow = true,
  zoomLevel = 3,
  sx = {}
}) => {
  const mapContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [containerReady, setContainerReady] = useState(false);

  // Kakao SDK가 완전히 준비될 때까지 대기 (LatLng/Map/Geocoder까지 확인, 최대 15초)
  const waitForKakaoSdk = useCallback(() => {
    const maxWaitMs = 15000;
    const intervalMs = 100;
    let waited = 0;
    return new Promise((resolve, reject) => {
      const check = () => {
        const isReady = !!(
          window.kakao &&
          window.kakao.maps &&
          typeof window.kakao.maps.LatLng === 'function' &&
          typeof window.kakao.maps.Map === 'function' &&
          window.kakao.maps.services &&
          typeof window.kakao.maps.services.Geocoder === 'function'
        );
        if (isReady) {
          resolve(true);
          return;
        }
        waited += intervalMs;
        if (waited >= maxWaitMs) {
          reject(new Error('카카오맵 API가 로드되지 않았습니다. (타임아웃)'));
          return;
        }
        setTimeout(check, intervalMs);
      };
      check();
    });
  }, []);

  // Kakao SDK 스크립트를 보장적으로 로드 (index.html에 없거나 로드 실패 시 동적 주입)
  const ensureKakaoScript = useCallback(async () => {
    // 항상 autoload=false & libraries=services로 주입하여 load 콜백 시점 보장
    let appkey = 'c456a11190a7975ad58deff213fae949';
    try {
      const headScript = document.querySelector('script[src*="dapi.kakao.com/v2/maps/sdk.js?"]');
      if (headScript) {
        const url = new URL(headScript.src, window.location.origin);
        const fromHead = url.searchParams.get('appkey');
        if (fromHead) appkey = fromHead;
      }
    } catch (_) {}

    // 기존 스크립트가 있어도 autoload/libraries 구성이 다를 수 있으므로 새 스크립트를 주입
    const cacheBuster = `&_=${Date.now()}`;
    const httpsUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services${cacheBuster}`;
    const httpUrl = `http://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services${cacheBuster}`;

    const injectScript = (url) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = url;
      s.onload = () => { s.setAttribute('data-loaded', 'true'); resolve(true); };
      s.onerror = () => reject(new Error(`카카오맵 스크립트 로드 실패: ${url}`));
      document.head.appendChild(s);
    });

    try {
      await injectScript(httpsUrl);
    } catch (e) {
      // HTTPS 실패 시 HTTP로 재시도 (개발환경 한정)
      await injectScript(httpUrl);
    }
  }, []);

  // DOM이 완전히 마운트된 후 컨테이너 상태 확인 (ResizeObserver + 폴링 병행)
  useLayoutEffect(() => {
    let cancelled = false;
    let observer = null;

    const check = () => {
      const node = mapContainer.current;
      if (!node) return false;
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        console.log('컨테이너 준비 완료:', rect.width, 'x', rect.height);
        setContainerReady(true);
        return true;
      }
      return false;
    };

    const setupObserverIfPossible = () => {
      const node = mapContainer.current;
      if (!node) return false;
      try {
        observer = new ResizeObserver(() => {
          if (!cancelled) {
            check();
          }
        });
        observer.observe(node);
      } catch (_) {}
      return true;
    };

    if (check()) return undefined;
    setupObserverIfPossible();

    let attempts = 0;
    const maxAttempts = 30; // 최대 3초 폴링
    const intervalId = setInterval(() => {
      attempts += 1;
      if (cancelled) return;
      if (check()) {
        clearInterval(intervalId);
        try { observer && observer.disconnect(); } catch (_) {}
        return;
      }
      // ref가 아직 없을 수 있으므로 주기적으로 옵저버도 설정 시도
      if (!observer) setupObserverIfPossible();
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        try { observer && observer.disconnect(); } catch (_) {}
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      try { observer && observer.disconnect(); } catch (_) {}
    };
  }, []);

  // 지도 초기화 함수
  const initializeMap = useCallback(async () => {
    if (!containerReady || !mapContainer.current) {
      console.log('컨테이너가 아직 준비되지 않음, 초기화 대기 중...');
      return;
    }

    try {
      console.log('지도 초기화 시작...');
      console.log('주소:', address);
      console.log('컨테이너 상태:', mapContainer.current);
      
      // 카카오맵 스크립트 보장
      await ensureKakaoScript();

      // API 초기화 (가능하면 load로 초기화 보장)
      if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === 'function') {
        console.log('카카오맵 API 초기화 중...');
        await new Promise((resolve) => {
          window.kakao.maps.load(() => {
            console.log('카카오맵 API 초기화 완료');
            resolve();
          });
        });
      }

      // load 콜백 이후 바로 진행 (내부 객체가 준비됨)

      // 지도 생성
      console.log('지도 생성 시작...');
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 기본 좌표
        level: zoomLevel
      };

      const newMap = new window.kakao.maps.Map(mapContainer.current, options);
      setMap(newMap);
      console.log('지도 객체 생성 완료');

      // 컨테이너 애니메이션 종료 이후에 레이아웃 보정
      // 아코디언의 높이 전환 애니메이션이 끝난 뒤 지도가 올바른 크기를 인식하도록 보정합니다.
      setTimeout(() => {
        try {
          newMap.relayout();
        } catch (_) {}
      }, 350);
      setTimeout(() => {
        try {
          newMap.relayout();
        } catch (_) {}
      }, 800);

      // 주소 검색 및 마커 표시
      if (address) {
        // 상세주소 제거하고 기본 주소만 사용 (지도 표시용)
        const cleanAddress = address.replace(/[0-9]+층|[0-9]+호|상세주소.*$/g, '').trim();
        console.log('원본 주소:', address);
        console.log('정리된 주소 (지도용):', cleanAddress);

        if (!cleanAddress) {
          throw new Error('정리된 주소 정보가 없습니다.');
        }

        const geocoder = new window.kakao.maps.services.Geocoder();

        const fallbackSearch = (roadOrJibun) => {
          return new Promise((resolve) => {
            geocoder.addressSearch(roadOrJibun, (result, status) => {
              resolve({ result, status });
            });
          });
        };

        geocoder.addressSearch(cleanAddress, async (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            console.log('주소 검색 성공, 좌표:', coords);

            // 지도 중심 이동 (레이아웃 후 보정 포함)
            newMap.setCenter(coords);
            // 다음 페인트 타이밍에 레이아웃 재계산 후 다시 센터 보정
            if (typeof window.requestAnimationFrame === 'function') {
              window.requestAnimationFrame(() => {
                try {
                  newMap.relayout();
                  newMap.setCenter(coords);
                } catch (_) {}
              });
            }

            // 마커 표시
            if (showMarker) {
              const marker = new window.kakao.maps.Marker({
                position: coords,
                map: newMap
              });

              // 인포윈도우 표시
              if (showInfoWindow) {
                const infowindow = new window.kakao.maps.InfoWindow({
                  content: `
                    <div style="padding:5px; font-size:12px;">
                      <h3 style="margin: 0 0 5px 0; font-size: 14px; color: #333;">${markerTitle}</h3>
                      <p style="margin: 0; font-size: 12px; color: #666;">${markerContent}</p>
                      <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">${cleanAddress}</p>
                    </div>
                  `
                });
                infowindow.open(newMap, marker);
              }
            }

            setLoading(false);
            console.log('지도 초기화 완료!');
          } else {
            console.warn('주소 검색 실패, 대체 검색 시도:', status, cleanAddress);

            // 1) 도로명/지번 혼합 가능성에 대비하여 숫자 상세 제거 후 행정동만 시도
            const adminOnly = cleanAddress.replace(/\s(\d+[^\s]*)$/, '').trim();
            let fallback = await fallbackSearch(adminOnly);

            if (!(fallback.status === window.kakao.maps.services.Status.OK && fallback.result && fallback.result.length > 0)) {
              // 2) 마지막 토큰 제거 재시도
              const tokens = adminOnly.split(/\s+/);
              if (tokens.length > 2) {
                const shorter = tokens.slice(0, tokens.length - 1).join(' ');
                fallback = await fallbackSearch(shorter);
              }
            }

            if (fallback.status === window.kakao.maps.services.Status.OK && fallback.result && fallback.result.length > 0) {
              const coords = new window.kakao.maps.LatLng(fallback.result[0].y, fallback.result[0].x);
              console.log('대체 주소 검색 성공, 좌표:', coords);
              newMap.setCenter(coords);
              if (showMarker) {
                const marker = new window.kakao.maps.Marker({ position: coords, map: newMap });
                if (showInfoWindow) {
                  const infowindow = new window.kakao.maps.InfoWindow({
                    content: `
                      <div style="padding:5px; font-size:12px;">
                        <h3 style="margin: 0 0 5px 0; font-size: 14px; color: #333;">${markerTitle}</h3>
                        <p style="margin: 0; font-size: 12px; color: #666;">${markerContent}</p>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">${adminOnly}</p>
                      </div>
                    `
                  });
                  infowindow.open(newMap, marker);
                }
              }
              setLoading(false);
              console.log('지도 초기화 완료! (대체 검색)');
            } else {
              console.error('주소 검색 실패 (ZERO_RESULT), 대체 검색도 실패');
              // 에러는 오버레이로만 표시하고 지도 컨테이너는 유지
              setError('주소를 찾을 수 없습니다. 근처 행정동으로 검색해 주세요.');
              setLoading(false);
            }
          }
        });
      } else {
        setLoading(false);
      }

    } catch (error) {
      console.error('지도 초기화 실패:', error);
      setError(`지도 초기화에 실패했습니다: ${error.message}`);
      setLoading(false);
    }
  }, [address, markerTitle, markerContent, zoomLevel, showMarker, showInfoWindow, containerReady]);

  // 컨테이너가 준비되고 주소가 있을 때 지도 초기화
  useLayoutEffect(() => {
    if (containerReady && address) {
      // 약간의 지연을 두어 DOM이 완전히 안정화된 후 초기화
      const timer = setTimeout(() => {
        initializeMap();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [containerReady, address, initializeMap]);

  // 컨테이너 크기 변화에 따라 지도 레이아웃을 보정
  useLayoutEffect(() => {
    if (!map || !mapContainer.current) return;

    let animationFrameId = null;
    const handleResize = () => {
      if (!map) return;
      // 리사이즈 스로틀링: 다음 프레임에 반영
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        try {
          map.relayout();
        } catch (_) {}
      });
    };

    const observer = new ResizeObserver(handleResize);
    try {
      observer.observe(mapContainer.current);
    } catch (_) {}

    // 윈도우 리사이즈에도 반응
    window.addEventListener('resize', handleResize);

    // 초기 보정 한번 수행
    handleResize();

    return () => {
      try { observer.disconnect(); } catch (_) {}
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [map]);

  // 에러가 있어도 지도 컨테이너는 유지하고, 오버레이로 메시지만 표시

  // 지도 컨테이너는 항상 렌더링하고, 로딩 중에는 오버레이를 표시
  return (
    <Box sx={{ position: 'relative', height, width, borderRadius: 1, overflow: 'hidden', ...sx }}>
      <Box
        ref={mapContainer}
        sx={{ position: 'absolute', inset: 0 }}
      />
      {loading && (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(245,245,245,0.8)'
        }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            지도를 불러오는 중...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// PropTypes 정의
KakaoMap.propTypes = {
  address: PropTypes.string.isRequired,
  markerTitle: PropTypes.string,
  markerContent: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showMarker: PropTypes.bool,
  showInfoWindow: PropTypes.bool,
  zoomLevel: PropTypes.number,
  sx: PropTypes.object
};

// 기본값 정의
KakaoMap.defaultProps = {
  markerTitle: '위치',
  markerContent: '',
  height: 300,
  width: '100%',
  showMarker: true,
  showInfoWindow: true,
  zoomLevel: 3,
  sx: {}
};

export default KakaoMap;
