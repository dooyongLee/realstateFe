import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import { DataGrid as MUIDataGrid, useGridApiRef } from '@mui/x-data-grid';
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
import HomeIcon from '@mui/icons-material/Home';
import AddHomeIcon from '@mui/icons-material/AddHome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import { formatDate, formatRelativeTime } from "../../utils/formatDate";

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
  const apiRef = useGridApiRef();

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

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchProperties();
  }, [fetchProperties]);

  const handleResetFilters = useCallback(() => {
    setPropertyType("");
    setDealType("");
    setStatus("");
    setSearchType("keyword");
    setKeyword("");
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
    const selectedRows = Array.from(apiRef.current.getSelectedRows().values());
    if (!selectedRows || selectedRows.length === 0) {
      setAlert({ open: true, message: '선택된 매물이 없습니다.', severity: 'warning' });
      return;
    }
    try {
      await Promise.all(selectedRows.map(property => {
        return apiClient.put(`/api/properties/${property.id}/status?status=${status}`);
      }));
      setProperties(prev => prev.map(p =>
        selectedRows.some(sel => sel.id === p.id) ? { ...p, status } : p
      ));
      setAlert({ open: true, message: `선택된 매물이 모두 ${getStatusLabel(status)}로 변경되었습니다.`, severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: '일괄 상태 변경 중 오류가 발생했습니다.', severity: 'error' });
    }
  }, [apiRef]);

  const handleEdit = useCallback((property) => {
    navigate(`/properties/edit/${property.id}`);
  }, [navigate]);

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

      {/* 필터/검색 바와 데이터 그리드를 포함하는 컨테이너 */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, width: '100%', boxShadow: '0 1px 4px 0 rgba(30,40,60,0.06)', border: '1px solid #e3e8ef', background: '#fff' }}>
        <Box component="form"
          onSubmit={e => { e.preventDefault(); handleSearch(); }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'nowrap',
            width: '100%',
            minWidth: 0
          }}
        >
          <Select
            value={propertyType}
            onChange={e => setPropertyType(e.target.value)}
            size="small"
            displayEmpty
            sx={{ width: 140, flex: '0 0 140px' }}
            inputProps={{ 'aria-label': '매물유형' }}
          >
            {PROPERTY_TYPE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          <Select
            value={dealType}
            onChange={e => setDealType(e.target.value)}
            size="small"
            displayEmpty
            sx={{ width: 140, flex: '0 0 140px' }}
            inputProps={{ 'aria-label': '거래유형' }}
          >
            {DEAL_TYPE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          <Select
            value={status}
            onChange={e => setStatus(e.target.value)}
            size="small"
            displayEmpty
            sx={{ width: 140, flex: '0 0 140px' }}
            inputProps={{ 'aria-label': '상태' }}
          >
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          <Select
            value={searchType}
            onChange={e => setSearchType(e.target.value)}
            size="small"
            displayEmpty
            sx={{ width: 140, flex: '0 0 140px' }}
            inputProps={{ 'aria-label': '검색타입' }}
          >
            {SEARCH_TYPE_OPTIONS.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          <TextField
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            size="small"
            placeholder="검색어를 입력하세요"
            sx={{ width: 200, flex: '1 1 200px' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" size="small" aria-label="검색">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            inputProps={{ 'aria-label': '검색어' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ minWidth: 80 }}
            type="submit"
            aria-label="검색"
          >
            검색
          </Button>
          <IconButton onClick={handleResetFilters} size="small" title="초기화" aria-label="초기화">
            <UndoIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* 알림 영역 */}
      {alert.open && (
        <Alert severity={alert.severity} sx={{ mb: 2 }} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="success" size="medium" onClick={() => handleBatchStatus('AVAILABLE')} sx={{ minWidth: 140 }} aria-label="선택매물 활성화">
            선택매물 활성화
          </Button>
          <Button variant="contained" color="warning" size="medium" onClick={() => handleBatchStatus('UNAVAILABLE')} sx={{ minWidth: 140 }} aria-label="선택매물 비활성화">
            선택매물 비활성화
          </Button>
          <Button variant="contained" color="info" size="medium" onClick={handleExcelDownload} startIcon={<FaFileExcel />} sx={{ minWidth: 140 }} aria-label="엑셀 다운로드">
            엑셀 다운로드
          </Button>
          <Button variant="contained" color="primary" size="medium" onClick={handleAddProperty} startIcon={<FaPlus />} sx={{ minWidth: 140 }} aria-label="매물추가">
            매물추가
          </Button>
        </Box>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 400,
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              매물 정보를 불러오는 중...
            </Typography>
          </Box>
        ) : (
          <MUIDataGrid
            columns={columns(handleEdit, handleRowClick, handleViewDetail).map(col => ({
              field: col.field,
              headerName: col.headerName,
              flex: 1,
              renderCell: col.renderCell,
              sortable: col.sortable,
              filterable: false,
              width: col.width
            }))}
            rows={properties}
            page={page - 1}
            pageSize={pageSize}
            rowsPerPageOptions={[10, 25, 50, 100]}
            pagination
            paginationMode="server"
            rowCount={total}
            onPageChange={newPage => setPage(newPage + 1)}
            onPageSizeChange={newPageSize => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            autoHeight
            disableSelectionOnClick
            localeText={{ 
              noRowsLabel: (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 2,
                  py: 4
                }}>
                  <HomeIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">
                    조회된 매물이 없습니다
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    검색 조건을 변경하거나 새로운 매물을 등록해보세요
                  </Typography>
                </Box>
              )
            }}
            checkboxSelection
            getRowId={(row) => row.id}
            apiRef={apiRef}
            onRowClick={(params) => handleRowClick(params.row)}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e3e8ef',
                '&:focus': {
                  outline: 'none'
                }
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f8fafc',
                borderBottom: '2px solid #e3e8ef',
                '& .MuiDataGrid-columnHeader': {
                  fontWeight: 700,
                  color: '#374151'
                }
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid #e3e8ef',
                backgroundColor: '#f8fafc'
              }
            }}
          />
        )}
      </Paper>


    </AdminMainLayout>
  );
};

export default PropertyList; 