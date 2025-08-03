import React, { useState, useEffect } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import apiClient from "../../api/apiClient";
import { useAlert } from "../../contexts/AlertContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPropertyTypeLabel,
  getDealTypeLabel,
  getStatusLabel,
  formatPrice,
  formatArea
} from "../../utils/propertyUtils.jsx";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatDate, formatDateTime, formatRelativeTime } from "../../utils/formatDate";
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import ImageIcon from '@mui/icons-material/Image';

const PropertyDetail = () => {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/properties/${id}`);
      setProperty(response.data.data);
    } catch (error) {
      console.error('매물 상세 조회 오류:', error);
      showAlert('매물 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/properties/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 매물을 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.delete(`/api/properties/${id}`);
      showAlert('매물이 성공적으로 삭제되었습니다.', 'success');
      navigate('/properties');
    } catch (error) {
      const message = error.response?.data?.message || '매물 삭제 중 오류가 발생했습니다.';
      showAlert(message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate('/properties');
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    setUpdatingStatus(true);
    try {
      await apiClient.put(`/api/properties/${id}/status?status=${newStatus}`);
      setProperty(prev => ({ ...prev, status: newStatus }));
      showAlert('매물 상태가 성공적으로 변경되었습니다.', 'success');
      setStatusDialogOpen(false);
      setNewStatus('');
    } catch (error) {
      showAlert('매물 상태 변경 중 오류가 발생했습니다.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'RESERVED': return 'warning';
      case 'SOLD': return 'info';
      case 'UNAVAILABLE': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircleIcon />;
      case 'RESERVED': return <WarningIcon />;
      case 'SOLD': return <TrendingUpIcon />;
      case 'UNAVAILABLE': return <CancelIcon />;
      default: return <HomeIcon />;
    }
  };

  if (loading) {
    return (
      <AdminMainLayout>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            매물 정보를 불러오는 중...
          </Typography>
        </Box>
      </AdminMainLayout>
    );
  }

  if (!property) {
    return (
      <AdminMainLayout>
        <Alert severity="error" sx={{ mb: 2 }}>
          매물을 찾을 수 없습니다.
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          목록으로 돌아가기
        </Button>
      </AdminMainLayout>
    );
  }



  return (
    <AdminMainLayout
      title="매물 상세정보"
      description={`${property.title} 매물의 상세 정보를 확인하세요`}
    >
      {/* 액션 버튼 영역 */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, width: '100%', boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', border: '1px solid #e3e8ef', background: '#fff' }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ minWidth: 120 }}
          >
            목록으로
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ minWidth: 120 }}
          >
            편집
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<UpdateIcon />}
            onClick={() => {
              setNewStatus(property.status);
              setStatusDialogOpen(true);
            }}
            sx={{ minWidth: 140 }}
          >
            상태 변경
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleting}
            sx={{ minWidth: 120 }}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </Box>
      </Paper>

      {/* 매물 헤더 정보 */}
      <Paper elevation={1} sx={{ 
        p: 3, 
        mb: 3, 
        width: '100%', 
        boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', 
        border: '1px solid #e3e8ef', 
        background: '#fff',
        borderRadius: 3
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: theme.palette.primary.main
            }}>
              {property.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip 
                label={getPropertyTypeLabel(property.propertyType)} 
                color="primary"
                variant="outlined"
                icon={<HomeIcon />}
              />
              <Chip 
                label={getDealTypeLabel(property.dealType)} 
                color="secondary"
                variant="outlined"
                icon={<AttachMoneyIcon />}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="action" />
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                {property.address}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip 
              label={getStatusLabel(property.status)} 
              icon={getStatusIcon(property.status)}
              color={getStatusColor(property.status)}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 매물 이미지 영역 */}
      <Paper elevation={1} sx={{ 
        p: 3, 
        mb: 3, 
        width: '100%', 
        boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', 
        border: '1px solid #e3e8ef', 
        background: '#fff',
        borderRadius: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ 
            bgcolor: theme.palette.warning.main, 
            mr: 2,
            width: 40,
            height: 40
          }}>
            <ImageIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
            매물 이미지
          </Typography>
        </Box>
        {property.images && property.images.length > 0 ? (
          <Grid container spacing={2}>
            {property.images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Paper 
                  elevation={2}
                  sx={{
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '1px solid #e3e8ef',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={image.url || image}
                    alt={`매물 이미지 ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 4,
            gap: 2
          }}>
            <ImageIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              등록된 이미지가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              매물 편집에서 이미지를 추가할 수 있습니다
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 상세 정보 카드들 */}
      <Grid container spacing={3}>
        {/* 기본 정보 카드 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ 
            p: 3, 
            width: '100%', 
            boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', 
            border: '1px solid #e3e8ef', 
            background: '#fff',
            borderRadius: 3,
            height: 'fit-content'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.primary.main, 
                mr: 2,
                width: 40,
                height: 40
              }}>
                <HomeIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                기본 정보
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">매물 ID</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {property.id}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">등록일</Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(property.createdAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(property.createdAt)}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">수정일</Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(property.updatedAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(property.updatedAt)}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">활성화 상태</Typography>
                <Chip 
                  label={property.isActive ? '활성' : '비활성'} 
                  color={property.isActive ? 'success' : 'default'} 
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 위치 정보 카드 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ 
            p: 3, 
            width: '100%', 
            boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', 
            border: '1px solid #e3e8ef', 
            background: '#fff',
            borderRadius: 3,
            height: 'fit-content'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.secondary.main, 
                mr: 2,
                width: 40,
                height: 40
              }}>
                <LocationOnIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
                위치 정보
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  주소
                </Typography>
                <Typography variant="body1" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontWeight: 500,
                  p: 2,
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: '1px solid #e3e8ef'
                }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  {property.address}
                </Typography>
              </Box>
              {property.latitude && property.longitude && (
                <>
                  <Divider />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">위도</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {property.latitude}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">경도</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                        {property.longitude}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 가격 정보 카드 */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ 
            p: 3, 
            width: '100%', 
            boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', 
            border: '1px solid #e3e8ef', 
            background: '#fff',
            borderRadius: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ 
                bgcolor: theme.palette.success.main, 
                mr: 2,
                width: 40,
                height: 40
              }}>
                <AttachMoneyIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                가격 정보
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: theme.palette.grey[50],
                  border: '1px solid #e3e8ef',
                  borderRadius: 2
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    면적
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {formatArea(property.area)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: theme.palette.grey[50],
                  border: '1px solid #e3e8ef',
                  borderRadius: 2
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    가격
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {formatPrice(property.price)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: theme.palette.grey[50],
                  border: '1px solid #e3e8ef',
                  borderRadius: 2
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    보증금
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {formatPrice(property.deposit)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  background: theme.palette.grey[50],
                  border: '1px solid #e3e8ef',
                  borderRadius: 2
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    월세
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    {formatPrice(property.rent)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 상세 설명 카드 */}
        {property.description && (
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ 
              p: 3, 
              width: '100%', 
              boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', 
              border: '1px solid #e3e8ef', 
              background: '#fff',
              borderRadius: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ 
                  bgcolor: theme.palette.info.main, 
                  mr: 2,
                  width: 40,
                  height: 40
                }}>
                  <VisibilityIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                  상세 설명
                </Typography>
              </Box>
              <Paper variant="outlined" sx={{ 
                p: 3, 
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                border: '1px solid #e3e8ef'
              }}>
                <Typography variant="body1" sx={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  color: theme.palette.text.primary
                }}>
                  {property.description}
                </Typography>
              </Paper>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* 상태 변경 다이얼로그 */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            매물 상태 변경
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            현재 상태: <strong>{getStatusLabel(property.status)}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>새로운 상태</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="새로운 상태"
            >
              <MenuItem value="AVAILABLE">거래가능</MenuItem>
              <MenuItem value="RESERVED">예약중</MenuItem>
              <MenuItem value="SOLD">거래완료</MenuItem>
              <MenuItem value="UNAVAILABLE">거래불가</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)}>
            취소
          </Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained"
            disabled={!newStatus || updatingStatus}
          >
            {updatingStatus ? '변경 중...' : '변경'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminMainLayout>
  );
};

export default PropertyDetail; 