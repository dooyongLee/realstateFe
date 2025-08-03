import React, { useState, useEffect } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import apiClient from "../../api/apiClient";
import { useAlert } from "../../contexts/AlertContext.jsx";
import { useNavigate, useParams } from "react-router-dom";
import {
  PROPERTY_TYPE_OPTIONS,
  DEAL_TYPE_OPTIONS,
  STATUS_OPTIONS,
  validatePropertyData,
  getInitialPropertyData
} from "../../utils/propertyUtils.jsx";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';

const PropertyForm = () => {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(getInitialPropertyData());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/properties/${id}`);
      const property = response.data.data;
      
      // API 응답 구조에 맞게 데이터 매핑
      setFormData({
        title: property.title || '',
        propertyType: property.propertyType || '',
        dealType: property.dealType || '',
        address: property.address || '',
        latitude: property.latitude || null,
        longitude: property.longitude || null,
        area: property.area || null,
        price: property.price || null,
        deposit: property.deposit || null,
        rent: property.rent || null,
        status: property.status || 'AVAILABLE',
        isActive: property.isActive !== false
      });
    } catch (error) {
      showAlert('매물 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validatePropertyData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showAlert('입력 정보를 확인해주세요.', 'error');
      return;
    }

    setSaving(true);
    try {
      // API 스펙에 맞는 데이터 구조로 변환
      const requestData = {
        title: formData.title,
        propertyType: formData.propertyType,
        dealType: formData.dealType,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        area: formData.area,
        price: formData.price,
        deposit: formData.deposit,
        rent: formData.rent,
        status: formData.status,
        isActive: formData.isActive
      };

      if (isEdit) {
        await apiClient.put(`/api/properties/${id}`, requestData);
        showAlert('매물이 성공적으로 수정되었습니다.', 'success');
      } else {
        await apiClient.post('/api/properties', requestData);
        showAlert('매물이 성공적으로 등록되었습니다.', 'success');
      }
      navigate('/properties');
    } catch (error) {
      const message = error.response?.data?.message || '매물 저장 중 오류가 발생했습니다.';
      showAlert(message, 'error');
    } finally {
      setSaving(false);
    }
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

  const handleCancel = () => {
    navigate('/properties');
  };

  if (loading) {
    return (
      <AdminMainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </AdminMainLayout>
    );
  }

  return (
    <AdminMainLayout
      title={isEdit ? "매물 수정" : "매물 등록"}
      description={isEdit ? "매물 정보를 수정하세요" : "새로운 매물을 등록하세요"}
    >
      <Box sx={{ mb: 3, mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          목록으로
        </Button>
        {isEdit && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate(`/properties/detail/${id}`)}
            sx={{ ml: 2 }}
          >
            상세보기
          </Button>
        )}
        {isEdit && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleting}
            sx={{ ml: 2 }}
          >
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        )}
      </Box>

      <Paper elevation={1} sx={{ p: 3, width: '100%', boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', border: '1px solid #e3e8ef', background: '#fff' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 기본 정보 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                기본 정보
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="매물 제목"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.propertyType} required size="small">
                <InputLabel>매물 타입</InputLabel>
                <Select
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange('propertyType', e.target.value)}
                  label="매물 타입"
                >
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.propertyType && (
                  <FormHelperText>{errors.propertyType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.dealType} required size="small">
                <InputLabel>거래 타입</InputLabel>
                <Select
                  value={formData.dealType}
                  onChange={(e) => handleInputChange('dealType', e.target.value)}
                  label="거래 타입"
                >
                  {DEAL_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.dealType && (
                  <FormHelperText>{errors.dealType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.status} size="small">
                <InputLabel>상태</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="상태"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="주소"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!errors.address}
                helperText={errors.address}
                required
                multiline
                rows={2}
                size="small"
              />
            </Grid>

            {/* 위치 정보 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main, mt: 2 }}>
                위치 정보
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="위도"
                type="number"
                value={formData.latitude || ''}
                onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                error={!!errors.latitude}
                helperText={errors.latitude || '예: 37.5665'}
                inputProps={{ step: 0.000001 }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="경도"
                type="number"
                value={formData.longitude || ''}
                onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                error={!!errors.longitude}
                helperText={errors.longitude || '예: 126.9780'}
                inputProps={{ step: 0.000001 }}
                size="small"
              />
            </Grid>

            {/* 가격 정보 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main, mt: 2 }}>
                가격 정보
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="면적 (㎡)"
                type="number"
                value={formData.area || ''}
                onChange={(e) => handleInputChange('area', e.target.value ? parseFloat(e.target.value) : null)}
                error={!!errors.area}
                helperText={errors.area}
                inputProps={{ step: 0.01, min: 0 }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="가격 (원)"
                type="number"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', e.target.value ? parseInt(e.target.value) : null)}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 0 }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="보증금 (원)"
                type="number"
                value={formData.deposit || ''}
                onChange={(e) => handleInputChange('deposit', e.target.value ? parseInt(e.target.value) : null)}
                error={!!errors.deposit}
                helperText={errors.deposit}
                inputProps={{ min: 0 }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="월세 (원)"
                type="number"
                value={formData.rent || ''}
                onChange={(e) => handleInputChange('rent', e.target.value ? parseInt(e.target.value) : null)}
                error={!!errors.rent}
                helperText={errors.rent}
                inputProps={{ min: 0 }}
                size="small"
              />
            </Grid>

            {/* 기타 설정 */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main, mt: 2 }}>
                기타 설정
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    color="primary"
                  />
                }
                label="매물 활성화"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                비활성화된 매물은 목록에서 숨겨집니다.
              </Typography>
            </Grid>

            {/* 버튼 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                  size="medium"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                  size="medium"
                  sx={{ minWidth: 120 }}
                >
                  {saving ? '저장 중...' : (isEdit ? '수정' : '등록')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </AdminMainLayout>
  );
};

export default PropertyForm; 