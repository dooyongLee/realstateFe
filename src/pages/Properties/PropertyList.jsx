import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";

import apiClient from "../../api/apiClient";
import { FaPlus, FaFileExcel } from "react-icons/fa";

import { columns, getPropertyTypeLabel, getDealTypeLabel, getStatusLabel, formatPrice, formatArea, PROPERTY_TYPE_OPTIONS, DEAL_TYPE_OPTIONS, STATUS_OPTIONS, SEARCH_TYPE_OPTIONS } from "../../utils/propertyUtils.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import AddHomeIcon from '@mui/icons-material/AddHome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import { formatDate, formatRelativeTime } from "../../utils/formatDate";
import SearchFilter from '../../components/common/SearchFilter';
import DataGrid from '../../components/common/DataGrid';

const PropertyList = () => {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const theme = useTheme();
  const [propertyType, setPropertyType] = useState("");
  const [dealType, setDealType] = useState("");
  const [status, setStatus] = useState("");
  const [searchType, setSearchType] = useState("keyword");
  const [keyword, setKeyword] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [propertiesOrigin, setPropertiesOrigin] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [selected, setSelected] = useState([]);


  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      // 기본 파라미터만으로 시작
      const params = {
        page: page - 1,
        size: pageSize || 10
      };
      
      console.log('API 요청 파라미터:', params);
      
      // 페이징된 매물 목록 요청
      const res = await apiClient.get("/api/properties", { params });
      console.log('API 응답:', res.data);
      
      const d = res.data.data;

      // API 응답 구조에 맞게 데이터 추출
      const currentProperties = d.content || [];
      
      setProperties(
        currentProperties.map((property, idx) => ({
          ...property,
          id: String(property.id || `row_${idx}`)
        }))
      );
      setTotal(d.totalElements || 0);
      
      // 통계용 데이터는 현재 페이지 데이터로 초기화 (간단한 방식)
      setPropertiesOrigin(
        currentProperties.map((property, idx) => ({
          ...property,
          id: String(property.id || `row_${idx}`)
        }))
      );
    } catch (error) {
      console.error('매물 목록 조회 오류:', error);
      console.error('오류 상세:', error.response?.data);
      console.error('요청 URL:', error.config?.url);
      console.error('요청 파라미터:', error.config?.params);
      
      let errorMessage = '매물 목록 조회 중 오류가 발생했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.response?.status === 404) {
        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
      }
      
      setAlert({ open: true, message: errorMessage, severity: 'error' });
      setProperties([]);
      setTotal(0);
      setPropertiesOrigin([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handlePageChange = useCallback((p) => {
    setPage(p);
    fetchProperties();
  }, [fetchProperties]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem("propertiesPageSize", newPageSize);
    setPage(1);
    fetchProperties();
  }, [fetchProperties]);

  /**
   * 검색 실행 핸들러
   * 공통 검색 컴포넌트에서 호출되는 검색 함수
   * 
   * @param {Object} searchValues - 검색 조건 값들
   */
  const handleSearch = useCallback((searchValues) => {
    setPropertyType(searchValues.propertyType || "");
    setDealType(searchValues.dealType || "");
    setStatus(searchValues.status || "");
    setSearchType(searchValues.searchType || "keyword");
    setKeyword(searchValues.keyword || "");
    setPage(1);
    fetchProperties();
  }, [fetchProperties]);

  /**
   * 검색 필터 초기화 핸들러
   * 공통 검색 컴포넌트에서 호출되는 초기화 함수
   * 
   * @param {Object} resetValues - 초기화된 검색 값들
   */
  const handleResetFilters = useCallback((resetValues) => {
    setPropertyType(resetValues.propertyType || "");
    setDealType(resetValues.dealType || "");
    setStatus(resetValues.status || "");
    setSearchType(resetValues.searchType || "keyword");
    setKeyword(resetValues.keyword || "");
    setPage(1);
    fetchProperties();
  }, [fetchProperties]);

  const handleAddProperty = useCallback(() => {
    navigate('/properties/add');
  }, [navigate]);

  const handleExcelDownload = useCallback(() => {
    setAlert({ open: true, message: '엑셀 다운로드 기능은 아직 구현되지 않았습니다.', severity: 'info' });
  }, []);

  const handleStatusToggle = useCallback(async (propertyId, currentStatus) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) {
      setAlert({ open: true, message: '매물 정보를 찾을 수 없습니다.', severity: 'error' });
      return;
    }
    try {
      const newStatus = currentStatus === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
      await apiClient.put(`/api/properties/${property.id}/status?status=${newStatus}`);
      setProperties(prevProperties => 
        prevProperties.map(p => 
          p.id === propertyId ? { ...p, status: newStatus } : p
        )
      );
      setPropertiesOrigin(prev =>
        prev.map(p =>
          p.id === propertyId ? { ...p, status: newStatus } : p
        )
      );
      setAlert({ open: true, message: `매물이 ${newStatus === 'AVAILABLE' ? '거래가능' : '거래불가'}로 변경되었습니다.`, severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: '매물 상태 변경 중 오류가 발생했습니다.', severity: 'error' });
    }
  }, [properties]);

  const handleRowClick = useCallback((property) => {
    // 매물 상세페이지로 이동
    navigate(`/properties/detail/${property.id}`);
  }, [navigate]);

  const handleViewDetail = useCallback((property) => {
    // 상세보기 버튼 클릭 시
    navigate(`/properties/detail/${property.id}`);
  }, [navigate]);



  const handleBatchStatus = useCallback(async (status) => {
    if (!selected.length) {
      setAlert({ open: true, message: '선택된 매물이 없습니다.', severity: 'warning' });
      return;
    }
    try {
      await Promise.all(selected.map(propertyId => {
        const property = properties.find(p => p.id === propertyId);
        return apiClient.put(`/api/properties/${property.id}/status?status=${status}`);
      }));
      setProperties(prev => prev.map(p =>
        selected.includes(p.id) ? { ...p, status } : p
      ));
      setAlert({ open: true, message: `선택된 매물이 모두 ${getStatusLabel(status)}로 변경되었습니다.`, severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: '일괄 상태 변경 중 오류가 발생했습니다.', severity: 'error' });
    }
  }, [selected, properties]);

  const handleEdit = useCallback((property) => {
    navigate(`/properties/edit/${property.id}`);
  }, [navigate]);

  // 공통 그리드 컬럼 설정
  const columns = [
    {
      field: 'title',
      headerName: '제목',
      width: 250,
      renderCell: (value, row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
          {getPropertyTypeLabel(row.propertyType)} 매물 {row.id}
        </Typography>
      )
    },
    {
      field: 'propertyType',
      headerName: '매물타입',
      width: 120,
      renderCell: (value) => (
        <Chip 
          label={getPropertyTypeLabel(value)} 
          size="small" 
          variant="outlined"
          sx={{ 
            backgroundColor: '#f3f4f6',
            borderColor: '#d1d5db',
            color: '#374151'
          }}
        />
      )
    },
    {
      field: 'dealType',
      headerName: '거래타입',
      width: 100,
      renderCell: (value) => getDealTypeLabel(value) || '-'
    },
    {
      field: 'address',
      headerName: '주소',
      width: 200,
      renderCell: (value) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
          {value || '-'}
        </Typography>
      )
    },
    {
      field: 'area',
      headerName: '면적',
      width: 100,
      renderCell: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value ? `${value}㎡` : '-'}
        </Typography>
      )
    },
    {
      field: 'price',
      headerName: '가격',
      width: 150,
      renderCell: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
          {value ? `${value.toLocaleString()}원` : '-'}
        </Typography>
      )
    },
    {
      field: 'deposit',
      headerName: '보증금',
      width: 150,
      renderCell: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#7c3aed' }}>
          {value ? `${value.toLocaleString()}원` : '-'}
        </Typography>
      )
    },
    {
      field: 'monthlyRent',
      headerName: '월세',
      width: 100,
      renderCell: (value) => value ? `${value.toLocaleString()}원` : '-'
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      renderCell: (value) => (
        <Chip 
          label={getStatusLabel(value)} 
          size="small" 
          color={value === 'ACTIVE' ? 'success' : value === 'INACTIVE' ? 'error' : 'warning'}
        />
      )
    },
    {
      field: 'createdAt',
      headerName: '등록일',
      width: 120,
      renderCell: (value) => formatDate(value)
    }
  ];

  // 통계 데이터 useMemo로 최적화
  const stats = useMemo(() => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      
      // 현재 페이지 데이터로 통계 계산 (임시)
      const todayCount = propertiesOrigin.filter(p => {
        if (!p.createdAt) return false;
        try {
          const createdAt = new Date(p.createdAt);
          return !isNaN(createdAt.getTime()) && createdAt.toISOString().slice(0, 10) === todayStr;
        } catch {
          return false;
        }
      }).length;
      
      const yesterdayCount = propertiesOrigin.filter(p => {
        if (!p.createdAt) return false;
        try {
          const createdAt = new Date(p.createdAt);
          return !isNaN(createdAt.getTime()) && createdAt.toISOString().slice(0, 10) === yesterdayStr;
        } catch {
          return false;
        }
      }).length;
      
      const percentChange = yesterdayCount === 0 ? (todayCount > 0 ? 100 : 0) : Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
      const availableCount = propertiesOrigin.filter(p => p.status === 'AVAILABLE').length;
      const soldCount = propertiesOrigin.filter(p => p.status === 'SOLD').length;
      const reservedCount = propertiesOrigin.filter(p => p.status === 'RESERVED').length;

      return {
        total: total, // API에서 받은 전체 개수 사용
        today: todayCount,
        yesterday: yesterdayCount,
        percentChange,
        available: availableCount,
        sold: soldCount,
        reserved: reservedCount
      };
    } catch (error) {
      console.error('통계 계산 오류:', error);
      return {
        total: total,
        today: 0,
        yesterday: 0,
        percentChange: 0,
        available: 0,
        sold: 0,
        reserved: 0
      };
    }
  }, [propertiesOrigin, total]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'success';
      case 'RESERVED': return 'warning';
      case 'SOLD': return 'error';
      case 'UNAVAILABLE': return 'default';
      default: return 'default';
    }
  };

  return (
    <AdminMainLayout
      title="매물관리"
      description="부동산 매물을 체계적으로 관리하고 모니터링하세요. 매물 타입별 필터링과 검색을 통해 효율적으로 매물을 관리하세요."
    >
      {/* 상단 통계 영역 */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          {[
            {
              label: '총 매물',
              value: stats.total,
              color: '#23408e',
              icon: <HomeIcon fontSize="medium" />, 
              avatarColor: '#23408e',
            },
            {
              label: '신규 등록',
              value: stats.today,
              color: '#1976d2',
              icon: <AddHomeIcon fontSize="medium" />, 
              avatarColor: '#1976d2',
              percentChange: stats.percentChange
            },
            {
              label: '거래가능',
              value: stats.available,
              color: '#10b981',
              icon: <CheckCircleIcon fontSize="medium" />, 
              avatarColor: '#10b981',
            },
            {
              label: '거래완료',
              value: stats.sold,
              color: '#8e24aa',
              icon: <TrendingUpIcon fontSize="medium" />, 
              avatarColor: '#8e24aa',
            }
          ].map((card, idx) => (
            <Grid item key={card.label} xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper elevation={3} sx={{
                p: 1.5,
                width: '100%',
                maxWidth: 180,
                minWidth: 110,
                borderRadius: 3,
                boxShadow: '0 2px 12px 0 rgba(30,40,60,0.10)',
                background: 'linear-gradient(135deg, #f8fafc 60%, #f1f5f9 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                mb: 1,
                height: 90
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <Avatar sx={{ bgcolor: card.avatarColor, width: 28, height: 28, mr: 1 }}>
                    {card.icon}
                  </Avatar>
                  <Typography fontWeight={700} fontSize={14} color={card.color}>{card.label}</Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} color={card.color} sx={{ fontSize: 22 }}>{card.value}</Typography>
                {card.percentChange !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    {card.percentChange >= 0 ? (
                      <TrendingUpIcon fontSize="small" sx={{ color: '#10b981' }} />
                    ) : (
                      <TrendingDownIcon fontSize="small" sx={{ color: '#ef4444' }} />
                    )}
                    <Typography fontSize={12} color={card.percentChange >= 0 ? '#10b981' : '#ef4444'} ml={0.5} fontWeight={700}>
                      {card.percentChange >= 0 ? '+' : ''}{card.percentChange}%
                    </Typography>
                    <Typography fontSize={11} color="text.secondary" ml={0.5}>전일 대비</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 검색 및 필터 영역 */}
      <SearchFilter
        searchFields={[
          {
            type: 'select',
            key: 'searchType',
            label: '검색타입',
            options: SEARCH_TYPE_OPTIONS
          },
          {
            type: 'text',
            key: 'keyword',
            placeholder: '검색어를 입력하세요'
          }
        ]}
        filterFields={[
          {
            key: 'propertyType',
            label: '매물유형',
            options: PROPERTY_TYPE_OPTIONS
          },
          {
            key: 'dealType',
            label: '거래유형',
            options: DEAL_TYPE_OPTIONS
          },
          {
            key: 'status',
            label: '상태',
            options: STATUS_OPTIONS
          }
        ]}
        searchValues={{
          propertyType: propertyType,
          dealType: dealType,
          status: status,
          searchType: searchType,
          keyword: keyword
        }}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      {/* 알림 영역 */}
      {alert.open && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      )}

      {/* 액션 버튼 영역 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="success" 
          size="medium" 
          onClick={() => handleBatchStatus('AVAILABLE')} 
          sx={{ minWidth: 140 }} 
          disabled={selected.length === 0}
        >
          선택매물 활성화
        </Button>
        <Button 
          variant="contained" 
          color="warning" 
          size="medium" 
          onClick={() => handleBatchStatus('UNAVAILABLE')} 
          sx={{ minWidth: 140 }} 
          disabled={selected.length === 0}
        >
          선택매물 비활성화
        </Button>
        <Button 
          variant="contained" 
          color="info" 
          size="medium" 
          onClick={handleExcelDownload} 
          startIcon={<FaFileExcel />} 
          sx={{ minWidth: 140 }}
        >
          엑셀 다운로드
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          size="medium" 
          onClick={handleAddProperty} 
          startIcon={<FaPlus />} 
          sx={{ minWidth: 140 }}
        >
          매물추가
        </Button>
      </Box>

      {/* 공통 데이터 그리드 */}
      <DataGrid
        columns={columns}
        rows={properties}
        loading={loading}
        pagination={{
          page: page - 1,
          pageSize: pageSize,
          total: total
        }}
        selectedRows={selected}
        onRowClick={handleRowClick}
        onSelectionChange={setSelected}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
        selectable={true}
        clickable={true}
      />


    </AdminMainLayout>
  );
};

export default PropertyList; 