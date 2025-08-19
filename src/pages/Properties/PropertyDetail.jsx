/**
 * 매물 상세 페이지 (PropertyDetail.jsx)
 * 
 * 이 컴포넌트는 선택된 매물의 상세 정보를 표시합니다.
 * 부동산 매물관리 비즈니스 프로세스에 맞춰 정보를 카테고리화하여 표시합니다.
 * 
 * 주요 기능:
 * - 매물 기본 정보 표시 (매물 개요, 위치 정보, 가격 정보)
 * - 매물 상세 정보 (건물 정보, 편의시설, 특징)
 * - 매물 이미지 갤러리
 * - 연락처 및 관리 정보
 * - 편집/삭제 기능
 * 
 * 비즈니스 규칙:
 * - 매물 ID를 URL 파라미터로 받아서 해당 매물 정보 조회
 * - 권한에 따라 편집/삭제 버튼 표시
 * - 이미지가 없는 경우 기본 이미지 표시
 * - 중요 정보는 상단에 배치하여 빠른 확인 가능
 * 
 * 데이터 형식:
 * - 매물 정보: id, title, propertyType, dealType, address, area, price, deposit, monthlyRent, status, description, features, images, contactInfo
 * - 사용자 권한: ADMIN, AGENCY, AGENT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminMainLayout from '../../components/AdminMainLayout';
import apiClient from '../../api/apiClient';
import { useAlert } from '../../contexts/AlertContext';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Rating,
  Badge,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PhotoCamera as PhotoIcon,
  Map as MapIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  Apartment as ApartmentIcon,
  LocalParking as ParkingIcon,
  Elevator as ElevatorIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { formatDate } from '../../utils/formatDate';
import KakaoMap from '../../components/common/KakaoMap';

/**
 * 매물 상세 페이지 메인 컴포넌트
 * 
 * @returns {JSX.Element} 매물 상세 페이지 UI
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // 상태 관리
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('panel1');
  const [showKakaoMap, setShowKakaoMap] = useState(false); // 카카오맵 표시 여부 (기본값: false)
  const [imageModalOpen, setImageModalOpen] = useState(false); // 이미지 모달 상태
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 선택된 이미지 인덱스
  const [mapModalOpen, setMapModalOpen] = useState(false); // 지도 확대 모달 상태

  /**
   * 이미지 정렬 함수 (썸네일 우선, 나머지는 순차)
   */
  const getSortedImages = useCallback(() => {
    if (!property?.images || property.images.length === 0) return [];
    
    const images = [...property.images];
    const thumbnailIndex = images.findIndex(img => img.is_thumbnail);
    
    if (thumbnailIndex !== -1) {
      // 썸네일 이미지를 첫 번째로 이동
      const thumbnail = images.splice(thumbnailIndex, 1)[0];
      return [thumbnail, ...images];
    }
    
    return images;
  }, [property?.images]);

  /**
   * 이미지 모달 열기
   */
  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setImageModalOpen(true);
  };

  /**
   * 이미지 모달 닫기
   */
  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedImageIndex(0);
  };

  /**
   * 다음 이미지로 이동
   */
  const handleNextImage = () => {
    const sortedImages = getSortedImages();
    setSelectedImageIndex((prev) => (prev + 1) % sortedImages.length);
  };

  /**
   * 이전 이미지로 이동
   */
  const handlePrevImage = () => {
    const sortedImages = getSortedImages();
    setSelectedImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  /**
   * 매물 상세 정보 조회
   */
  const fetchPropertyDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/api/properties/${id}`);
      console.log('매물 상세 정보 응답:', response.data);
      setProperty(response.data.data);
    } catch (err) {
      console.error('매물 상세 정보 조회 오류:', err);
      console.error('에러 응답:', err.response?.data);
      setError(`매물 정보를 불러오는데 실패했습니다. (${err.response?.status || '알 수 없는 오류'})`);
      showAlert(`매물 정보 조회 중 오류가 발생했습니다: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showAlert]);

  /**
   * 매물 삭제 핸들러
   */
  const handleDelete = async () => {
    try {
      await apiClient.delete(`/api/properties/${id}`);
      showAlert('매물이 성공적으로 삭제되었습니다.', 'success');
      navigate('/properties');
    } catch (err) {
      console.error('매물 삭제 오류:', err);
      showAlert('매물 삭제 중 오류가 발생했습니다.', 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  /**
   * 편집 페이지로 이동
   */
  const handleEdit = () => {
    navigate(`/properties/edit/${id}`);
  };

  /**
   * 목록으로 돌아가기
   */
  const handleBack = () => {
    navigate('/properties');
  };

  /**
   * 아코디언 확장/축소 핸들러
   */
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
    
    // 위치정보 아코디언(panel3)이 열릴 때만 카카오맵 표시
    if (panel === 'panel3') {
      if (isExpanded) {
        // 위치정보 아코디언이 열릴 때
        if (property && (property.fullAddress || property.address)) {
          console.log('PropertyDetail - 위치정보 아코디언 열림, 카카오맵 표시 준비');
          // 약간의 지연 후 카카오맵 표시 (DOM 렌더링 완료 대기)
          setTimeout(() => {
            setShowKakaoMap(true);
          }, 300);
        }
      } else {
        // 위치정보 아코디언이 닫힐 때
        console.log('PropertyDetail - 위치정보 아코디언 닫힘, 카카오맵 숨김');
        setShowKakaoMap(false);
      }
    }
  };

  // 컴포넌트 마운트 시 매물 정보 조회
  useEffect(() => {
    fetchPropertyDetail();
  }, [fetchPropertyDetail]);

  // 로딩 상태
  if (loading) {
    return (
      <AdminMainLayout title="매물 상세">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </AdminMainLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <AdminMainLayout title="매물 상세">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Alert severity="error" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {error}
          </Alert>
        </Box>
      </AdminMainLayout>
    );
  }

  // 매물 정보가 없는 경우
  if (!property) {
    return (
      <AdminMainLayout title="매물 상세">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Alert severity="warning" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            매물 정보를 찾을 수 없습니다.
          </Alert>
        </Box>
      </AdminMainLayout>
    );
  }

  // 정렬된 이미지 배열 가져오기
  const sortedImages = getSortedImages();
  const hasImages = sortedImages.length > 0;

  return (
    <AdminMainLayout title="매물 상세">
      {/* 헤더 영역 */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' }, 
          justifyContent: 'space-between', 
          mb: 2,
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBack} sx={{ mr: { xs: 1, sm: 2 } }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 'bold', 
                color: '#1f2937',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}>
                {property?.title || `${property?.type || '매물'} 상세`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                mt: 0.5,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}>
                매물번호: {property?.propertyNumber || property?.id || '-'}
              </Typography>
            </Box>
          </Box>
          
          {/* 액션 버튼들 */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 1, sm: 1 }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
          <Button
            variant="outlined"
              startIcon={<PrintIcon />}
              size="small"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              인쇄
          </Button>
          <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              다운로드
            </Button>
            <Button
              variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            편집
          </Button>
          <Button
              variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
              삭제
          </Button>
          </Stack>
        </Box>
      </Box>

      {/* 메인 콘텐츠 */}
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {/* 왼쪽 컬럼 - 이미지 및 상세 정보 */}
        <Grid item xs={12} lg={8}>
          {/* 매물 이미지 갤러리 */}
          <Paper sx={{ 
            mb: { xs: 2, sm: 3 }, 
            overflow: 'hidden', 
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: { xs: 1, sm: 2 }
          }}>
            {!hasImages ? (
              // 이미지가 없는 경우
              <Box sx={{ 
                height: { xs: 200, sm: 250, md: 300, lg: 350, xl: 400 },
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                flexDirection: 'column',
                gap: 2
              }}>
                <PhotoIcon sx={{ fontSize: 60, color: '#ccc' }} />
                <Typography variant="body1" color="text.secondary">
                  등록된 이미지가 없습니다
                </Typography>
              </Box>
            ) : (
              // 이미지가 있는 경우
              <Box sx={{ position: 'relative' }}>
                {/* 메인 이미지 */}
                <Box
                  component="img"
                  src={sortedImages[selectedImage]}
                  alt={`매물 이미지 ${selectedImage + 1}`}
                  sx={{ 
                    width: '100%',
                    height: { xs: 200, sm: 250, md: 300, lg: 350, xl: 400 },
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                  onClick={() => handleImageClick(selectedImage)}
                />
                
                {/* 이미지 인디케이터 */}
                {sortedImages.length > 1 && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: { xs: 8, sm: 12, md: 16 }, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: { xs: 0.5, sm: 0.75, md: 1 }
                  }}>
                    {sortedImages.map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: { xs: 6, sm: 8, md: 10, lg: 12 },
                          height: { xs: 6, sm: 8, md: 10, lg: 12 },
                          borderRadius: '50%',
                          backgroundColor: index === selectedImage ? '#fff' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                        onClick={() => setSelectedImage(index)}
                      />
                    ))}
                  </Box>
                )}
                
                {/* 이전/다음 버튼 */}
                {sortedImages.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => setSelectedImage((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)}
                      sx={{
                        position: 'absolute',
                        left: { xs: 8, sm: 12, md: 16 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#333',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,1)'
                        }
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setSelectedImage((prev) => (prev + 1) % sortedImages.length)}
                      sx={{
                        position: 'absolute',
                        right: { xs: 8, sm: 12, md: 16 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#333',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,1)'
                        }
                      }}
                    >
                      <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                  </>
                )}
              </Box>
            )}
            
            {/* 썸네일 이미지들 */}
            {hasImages && sortedImages.length > 1 && (
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 0.5, sm: 0.75, md: 1 }, 
                p: { xs: 1, sm: 1.5, md: 2 }, 
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: { xs: 4, sm: 6 }
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: 2
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: 2
                }
              }}>
                {sortedImages.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`썸네일 ${index + 1}`}
                    sx={{
                      width: { xs: 50, sm: 60, md: 70, lg: 80 },
                      height: { xs: 37.5, sm: 45, md: 52.5, lg: 60 },
                      objectFit: 'cover',
                      borderRadius: { xs: 0.5, sm: 1 },
                      cursor: 'pointer',
                      border: index === selectedImage ? '2px solid #1976d2' : '2px solid transparent',
                      transition: 'all 0.2s',
                      flexShrink: 0,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* 매물 정보 아코디언 */}
          <Paper sx={{ 
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: { xs: 1, sm: 2 }
          }}>
            {/* 매물 기본 정보 */}
            <Accordion 
              expanded={expandedAccordion === 'panel1'} 
              onChange={handleAccordionChange('panel1')}
              sx={{ 
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: { xs: 48, sm: 56, md: 64 },
                  px: { xs: 2, sm: 3 }
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                  <HomeIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' }
                  }}>
                    매물 기본 정보
              </Typography>
            </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <HomeIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="매물 타입" 
                          secondary={property?.type || '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <MoneyIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="거래 타입" 
                          secondary={property?.transactionType || property?.dealType || '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <LocationIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="면적" 
                          secondary={property?.area ? `${property.area}㎡` : '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <CheckIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="상태" 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                        />
                <Chip 
                          label={property?.status || '-'} 
                  size="small"
                          color={property?.status === '판매중' || property?.status === 'ACTIVE' ? 'success' : 'warning'}
                          sx={{ 
                            fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                            height: { xs: 20, sm: 24, md: 28 }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <TimeIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="등록일" 
                          secondary={formatDate(property?.registrationDate || property?.createdAt)} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <BusinessIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="에이전시" 
                          secondary={property?.agencyName || '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                    </List>
        </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* 건물 상세 정보 */}
            <Accordion 
              expanded={expandedAccordion === 'panel2'} 
              onChange={handleAccordionChange('panel2')}
              sx={{ 
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: { xs: 48, sm: 56, md: 64 },
                  px: { xs: 2, sm: 3 }
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                  <ApartmentIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' }
                  }}>
                    건물 상세 정보
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <HomeIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="방 개수" 
                          secondary={property?.rooms ? `${property.rooms}개` : '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <HomeIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="욕실 개수" 
                          secondary={property?.bathrooms ? `${property.bathrooms}개` : '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <HomeIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="층수" 
                          secondary={property?.floor && property?.totalFloors ? `${property.floor}층 / ${property.totalFloors}층` : '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense sx={{ py: 0 }}>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <ParkingIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="주차 가능" 
                          secondary={property?.parkingAvailable !== undefined ? (property.parkingAvailable ? '가능' : '불가능') : '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <ElevatorIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="엘리베이터" 
                          secondary={property?.elevator !== undefined ? (property.elevator ? '있음' : '없음') : '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                      <ListItem sx={{ 
                        px: { xs: 0, sm: 0.5, md: 1 },
                        py: { xs: 0.5, sm: 0.75 }
                      }}>
                        <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                          <CalendarIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="준공년도" 
                          secondary={property?.buildingYear ? `${property.buildingYear}년` : '-'} 
                          primaryTypographyProps={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            fontWeight: 500
                          }}
                          secondaryTypographyProps={{ 
                            fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                          }}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* 위치 정보 */}
            <Accordion 
              expanded={expandedAccordion === 'panel3'} 
              onChange={handleAccordionChange('panel3')}
              sx={{ 
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: { xs: 48, sm: 56, md: 64 },
                  px: { xs: 2, sm: 3 }
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                  <LocationIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' }
                  }}>
                위치 정보
              </Typography>
            </Box>
              </AccordionSummary>
                            <AccordionDetails sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                {/* 카카오맵 지도 */}
                <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                  {/* 확대보기 버튼 */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    mb: 1 
                  }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setMapModalOpen(true)}
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        px: { xs: 1, sm: 1.5 }
                      }}
                    >
                      확대보기
                    </Button>
                  </Box>
                  
                  {(() => {
                    // 상세주소를 제외한 주소만 사용 (지도 표시용)
                    const address = property?.fullAddress || property?.address;
                    console.log('PropertyDetail - KakaoMap 렌더링 조건 확인');
                    console.log('PropertyDetail - showKakaoMap:', showKakaoMap);
                    console.log('PropertyDetail - expandedAccordion:', expandedAccordion);
                    console.log('PropertyDetail - property 객체:', property);
                    console.log('PropertyDetail - address (지도용):', address);
                    
                    // 위치정보 아코디언(panel3)이 열려있고, showKakaoMap이 true이고, 
                    // property 데이터와 주소가 완전히 로드된 후에만 KakaoMap 렌더링
                    if (expandedAccordion !== 'panel3' || !showKakaoMap || !property || !address || typeof address !== 'string' || address.trim() === '') {
                      console.log('PropertyDetail - KakaoMap 렌더링 조건 미충족');
                      return (
                        <Box sx={{ 
                          height: { xs: 200, sm: 250, md: 300, lg: 350, xl: 400 },
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}>
                          <Typography variant="body2" color="text.secondary">
                            {expandedAccordion !== 'panel3' ? '위치정보를 클릭하여 지도를 확인하세요' : 
                             !property ? '매물 정보를 불러오는 중...' : '주소 정보를 불러오는 중...'}
                          </Typography>
                        </Box>
                      );
                    }
                    
                    console.log('PropertyDetail - KakaoMap 렌더링 시작');
                    return (
                      <KakaoMap
                        //key={`kakao-map-${property.id || 'unknown'}`} // 고유 키 추가
                        address={address}
                        markerTitle={property?.title || '매물 위치'}
                        markerContent={`${property?.type || '매물'} - ${property?.transactionType || property?.dealType || '거래'}`}
                        height={{ xs: 200, sm: 250, md: 300, lg: 350, xl: 400 }}
                        width="100%"
                        showMarker={true}
                        showInfoWindow={true}
                        zoomLevel={3}
                        sx={{ 
                          borderRadius: { xs: 0.5, sm: 1 },
                          boxShadow: { xs: 1, sm: 2 }
                        }}
                      />
                    );
                  })()}
                </Box>
                
                {/* 주소 정보 */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ 
                    mb: 1, 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    fontWeight: 500
                  }}>
                    <strong>주소:</strong> {property?.fullAddress || property?.address || '주소 정보 없음'}
                  </Typography>
                  {property?.detailAddress && (
                    <Typography variant="body1" sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    }}>
                      <strong>상세주소:</strong> {property.detailAddress}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* 매물 설명 */}
            <Accordion 
              expanded={expandedAccordion === 'panel4'} 
              onChange={handleAccordionChange('panel4')}
              sx={{ 
                '&:before': { display: 'none' },
                '& .MuiAccordionSummary-root': {
                  minHeight: { xs: 48, sm: 56, md: 64 },
                  px: { xs: 2, sm: 3 }
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                  <DescriptionIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24, md: 28 } }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem', lg: '1.25rem' }
                  }}>
                    매물 설명
              </Typography>
            </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Typography variant="body1" sx={{ 
                  mb: 2, 
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  lineHeight: 1.6
                }}>
                  {property?.description || '매물 설명이 없습니다.'}
                  </Typography>
              </AccordionDetails>
            </Accordion>
                </Paper>
              </Grid>

        {/* 오른쪽 컬럼 - 가격 정보 및 연락처 */}
        <Grid item xs={12} lg={4}>
          {/* 가격 정보 카드 */}
          <Card sx={{ 
            mb: { xs: 2, sm: 2.5, md: 3 }, 
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: { xs: 1, sm: 2 }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography variant="h5" sx={{ 
                mb: { xs: 1.5, sm: 2 }, 
                fontWeight: 'bold', 
                color: '#059669',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem', xl: '2.25rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                {property?.priceFormatted || (property?.price ? `${property.price.toLocaleString()}원` : '-')}
                  </Typography>
              
              <List dense sx={{ py: 0 }}>
                {property?.deposit && (
                  <ListItem sx={{ 
                    px: { xs: 0, sm: 0.5, md: 1 },
                    py: { xs: 0.5, sm: 0.75 }
                  }}>
                    <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                      <MoneyIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="보증금" 
                      secondary={`${property.deposit.toLocaleString()}원`} 
                      primaryTypographyProps={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{ 
                        fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                      }}
                    />
                  </ListItem>
                )}
                {property?.monthlyRent && (
                  <ListItem sx={{ 
                    px: { xs: 0, sm: 0.5, md: 1 },
                    py: { xs: 0.5, sm: 0.75 }
                  }}>
                    <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                      <MoneyIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="월세" 
                      secondary={`${property.monthlyRent.toLocaleString()}원`} 
                      primaryTypographyProps={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{ 
                        fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* 연락처 정보 카드 */}
          <Card sx={{ 
            mb: { xs: 2, sm: 2.5, md: 3 }, 
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: { xs: 1, sm: 2 }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 1.5, sm: 2 }, 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.375rem' }
              }}>
                연락처 정보
                  </Typography>
              
              <List dense sx={{ py: 0 }}>
                <ListItem sx={{ 
                  px: { xs: 0, sm: 0.5, md: 1 },
                  py: { xs: 0.5, sm: 0.75 }
                }}>
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                    <PersonIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="등록자" 
                    secondary={property?.registeredBy || '-'} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                    }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  px: { xs: 0, sm: 0.5, md: 1 },
                  py: { xs: 0.5, sm: 0.75 }
                }}>
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                    <PhoneIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="등록자 연락처" 
                    secondary={property?.registrantPhone || '-'} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                    }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  px: { xs: 0, sm: 0.5, md: 1 },
                  py: { xs: 0.5, sm: 0.75 }
                }}>
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                    <BusinessIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="에이전시" 
                    secondary={property?.agencyName || '-'} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                    }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  px: { xs: 0, sm: 0.5, md: 1 },
                  py: { xs: 0.5, sm: 0.75 }
                }}>
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                    <PhoneIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="에이전시 연락처" 
                    secondary={property?.agencyPhone || '-'} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* 매물 상태 정보 카드 */}
          <Card sx={{ 
            mb: { xs: 2, sm: 2.5, md: 3 }, 
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: { xs: 1, sm: 2 }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 1.5, sm: 2 }, 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.375rem' }
              }}>
                매물 상태
                </Typography>
              
              <List dense sx={{ py: 0 }}>
                <ListItem sx={{ 
                  px: { xs: 0, sm: 0.5, md: 1 },
                  py: { xs: 0.5, sm: 0.75 }
                }}>
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                    <InfoIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="매물 번호" 
                    secondary={property?.propertyNumber || property?.id || '-'} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                    }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  px: { xs: 0, sm: 0.5, md: 1 },
                  py: { xs: 0.5, sm: 0.75 }
                }}>
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                    <CheckIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="상태" 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 500
                    }}
                  />
                  <Chip 
                    label={property.status} 
                    size="small" 
                    color={property.status === '판매중' ? 'success' : 'warning'}
                    sx={{ 
                      fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                      height: { xs: 20, sm: 24, md: 28 }
                    }}
                  />
                </ListItem>
                <ListItem sx={{ 
                  px: { xs: 0, sm: 0.5, md: 1 },
                  py: { xs: 0.5, sm: 0.75 }
                }}>
                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 36, md: 40 } }}>
                    <TimeIcon color="primary" sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="등록일" 
                    secondary={formatDate(property?.registrationDate || property?.createdAt)} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' }
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* 빠른 액션 카드 */}
          <Card sx={{ 
            borderRadius: { xs: 1, sm: 2 },
            boxShadow: { xs: 1, sm: 2 }
          }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 1.5, sm: 2 }, 
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem', lg: '1.375rem' }
              }}>
                빠른 액션
                </Typography>
              
              <Stack spacing={{ xs: 1, sm: 1.25, md: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  fullWidth
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' },
                    py: { xs: 0.75, sm: 1 },
                    minHeight: { xs: 32, sm: 36, md: 40 }
                  }}
                >
                  공유하기
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FavoriteIcon />}
                  fullWidth
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' },
                    py: { xs: 0.75, sm: 1 },
                    minHeight: { xs: 32, sm: 36, md: 40 }
                  }}
                >
                  관심매물 등록
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  fullWidth
                  size="small"
                  sx={{ 
                    fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.875rem' },
                    py: { xs: 0.75, sm: 1 },
                    minHeight: { xs: 32, sm: 36, md: 40 }
                  }}
                >
                  인쇄하기
                </Button>
              </Stack>
            </CardContent>
          </Card>
          </Grid>
      </Grid>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>매물 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 이 매물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 이미지 모달 */}
      <Dialog
        open={imageModalOpen}
        onClose={handleImageModalClose}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">
            매물 이미지 {selectedImageIndex + 1} / {sortedImages.length}
          </Typography>
          <IconButton onClick={handleImageModalClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {/* 메인 이미지 */}
          <Box
            component="img"
            src={sortedImages[selectedImageIndex]}
            alt={`매물 이미지 ${selectedImageIndex + 1}`}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
          
          {/* 이전/다음 버튼 */}
          {sortedImages.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 지도 확대 모달 */}
      <Dialog
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'white',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">
            매물 위치 정보
          </Typography>
          <IconButton onClick={() => setMapModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {property && (property.fullAddress || property.address) ? (
            <KakaoMap
              address={property.fullAddress || property.address}
              markerTitle={property?.title || '매물 위치'}
              markerContent={`${property?.type || '매물'} - ${property?.transactionType || property?.dealType || '거래'}`}
              height={600}
              width="100%"
              showMarker={true}
              showInfoWindow={true}
              zoomLevel={2}
              sx={{ 
                borderRadius: 0,
                border: 'none'
              }}
            />
          ) : (
            <Box sx={{ 
              height: 400,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f5f5f5'
            }}>
              <Typography variant="body1" color="text.secondary">
                주소 정보가 없습니다.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </AdminMainLayout>
  );
};

export default PropertyDetail; 