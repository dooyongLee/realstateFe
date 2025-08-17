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

  // DOM이 완전히 마운트된 후 컨테이너 상태 확인
  useLayoutEffect(() => {
    const checkContainer = () => {
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          console.log('컨테이너 준비 완료:', rect.width, 'x', rect.height);
          setContainerReady(true);
          return true;
        }
      }
      return false;
    };

    // 즉시 체크
    if (!checkContainer()) {
      // 약간의 지연 후 다시 체크
      const timer = setTimeout(() => {
        if (checkContainer()) {
          clearTimeout(timer);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
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
      
      // 카카오맵 API 확인
      if (!window.kakao || !window.kakao.maps) {
        throw new Error('카카오맵 API가 로드되지 않았습니다.');
      }

      // API 초기화
      if (!window.kakao.maps.isLoaded()) {
        console.log('카카오맵 API 초기화 중...');
        await new Promise((resolve) => {
          window.kakao.maps.load(() => {
            console.log('카카오맵 API 초기화 완료');
            resolve();
          });
        });
      }

      // 지도 생성
      console.log('지도 생성 시작...');
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 기본 좌표
        level: zoomLevel
      };

      const newMap = new window.kakao.maps.Map(mapContainer.current, options);
      setMap(newMap);
      console.log('지도 객체 생성 완료');

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

        geocoder.addressSearch(cleanAddress, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            console.log('주소 검색 성공, 좌표:', coords);

            // 지도 중심 이동
            newMap.setCenter(coords);

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
            console.error('주소 검색 실패:', status);
            setError('주소를 찾을 수 없습니다. 주소를 확인해주세요.');
            setLoading(false);
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

  // 로딩 중일 때
  if (loading) {
    return (
      <Box sx={{ 
        height, 
        width, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
        ...sx
      }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          지도를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  // 에러가 있을 때
  if (error) {
    return (
      <Box sx={{ 
        height, 
        width, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: 1,
        p: 2,
        ...sx
      }}>
        <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => window.location.reload()}
          startIcon={<LocationIcon />}
        >
          다시 시도
        </Button>
      </Box>
    );
  }

  // 지도가 성공적으로 로드되었을 때
  return (
    <Box 
      ref={mapContainer}
      sx={{ 
        height, 
        width, 
        borderRadius: 1,
        overflow: 'hidden',
        ...sx
      }}
    />
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
