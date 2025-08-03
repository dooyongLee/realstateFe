import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import { DataGrid as MUIDataGrid, useGridApiRef } from '@mui/x-data-grid';
import apiClient from "../../api/apiClient";
import { FaPlus, FaFileExcel } from "react-icons/fa";
import Modal from "../../components/Modal";
import { columns, getRoleLabel, formatDate, ROLE_OPTIONS, SUBROLE_OPTIONS, SEARCH_TYPE_OPTIONS } from "../../utils/userUtils.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const AGENCY_ROLES = ['AGENT', 'AGENCY', 'AGENCY_LEADER'];

const UsersManage = () => {
  const { showAlert } = useAlert();
  const theme = useTheme();
  const [role, setRole] = useState("");
  const [subRole, setSubRole] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [detailUser, setDetailUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [usersOrigin, setUsersOrigin] = useState([]); // 전체 회원 데이터
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const apiRef = useGridApiRef();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pageSize
      };
      if (role) params.role = role;
      if (subRole) params.subRole = subRole;
      if (searchType && keyword) params[searchType] = keyword;
      const allRes = await apiClient.get("/api/users/page", { params: { page: 0, size: 10000 } });
      const res = await apiClient.get("/api/users/page", { params });
      const d = res.data.data;

      const allUsers = (allRes.data.data.content || []).map((user, idx) => ({
        ...user,
        id: String(user.id || user.email || `row_${idx}`),
        currentSubscription: user.subscription || null
      }));

      const paginatedUsers = (d.content || []).map((user, idx) => ({
        ...user,
        id: String(user.id || user.email || `row_${idx}`),
        currentSubscription: user.subscription || null
      }));

      setUsersOrigin(allUsers);
      setUsers(paginatedUsers);
      setTotal(d.totalElements || 0);
    } catch (error) {
      setAlert({ open: true, message: '회원 목록 조회 중 오류가 발생했습니다.', severity: 'error' });
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, role, subRole, searchType, keyword]);

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, role, subRole, searchType, keyword]);

  // 구독 상태 표시를 위한 컬럼 확장
  const getSubscriptionColumns = useCallback(() => {
    const baseColumns = columns(handleStatusToggle)
      .filter(col => !['subscriptionName', 'subscriptionStartDate', 'subscriptionEndDate'].includes(col.key))
      .map(col => {
        const dataGridCol = {
          field: col.key,
          headerName: col.label,
          width: col.key === 'email' ? 200 : col.key === 'name' ? 150 : col.key === 'phone' ? 150 : col.key === 'role' ? 120 : col.key === 'enabled' ? 120 : col.key === 'createdAt' ? 120 : 150,
          renderCell: col.render ? (params) => col.render(params.value, params.row) : undefined
        };
        if (col.key === 'role') {
          return {
            ...dataGridCol,
            renderCell: (params) => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body2">
                  {getRoleLabel(params.value)}
                </Typography>
                {params.row.currentSubscription && (
                  <Chip
                    label={params.row.currentSubscription.subscriptionPlan?.name || '구독중'}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 0.5, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            )
          };
        }
        return dataGridCol;
      });
    return baseColumns;
  }, []);

  const handlePageChange = useCallback((p) => {
    setPage(p);
    fetchUsers();
  }, [fetchUsers]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem("usersPageSize", newPageSize);
    setPage(1);
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => { setSubRole(""); }, [role]);

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchUsers();
  }, [fetchUsers]);

  const handleResetFilters = useCallback(() => {
    setRole("");
    setSubRole("");
    setSearchType("name");
    setKeyword("");
    setPage(1);
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = useCallback(() => {
    setAlert({ open: true, message: '회원 추가 기능은 아직 구현되지 않았습니다.', severity: 'info' });
  }, []);

  const handleExcelDownload = useCallback(() => {
    setAlert({ open: true, message: '엑셀 다운로드 기능은 아직 구현되지 않았습니다.', severity: 'info' });
  }, []);

  const handleStatusToggle = useCallback(async (userId, currentEnabled) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      setAlert({ open: true, message: '사용자 정보를 찾을 수 없습니다.', severity: 'error' });
      return;
    }
    try {
      const newEnabled = !currentEnabled;
      await apiClient.patch(`/api/users/${user.email}/status`, { enabled: newEnabled });
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, enabled: newEnabled } : u
        )
      );
      setUsersOrigin(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, enabled: newEnabled } : u
        )
      );
      setAlert({ open: true, message: `회원이 ${newEnabled ? '활성화' : '비활성화'}되었습니다.`, severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: '회원 상태 변경 중 오류가 발생했습니다.', severity: 'error' });
    }
  }, [users]);

  const handleRowClick = useCallback((user) => {
    setDetailUser(user);
    setDetailOpen(true);
  }, []);

  const handleDetailClose = useCallback(() => {
    setDetailOpen(false);
    setDetailUser(null);
  }, []);

  const handleBatchStatus = useCallback(async (enabled) => {
    const selectedRows = Array.from(apiRef.current.getSelectedRows().values());
    if (!selectedRows || selectedRows.length === 0) {
      setAlert({ open: true, message: '선택된 회원이 없습니다.', severity: 'warning' });
      return;
    }
    try {
      await Promise.all(selectedRows.map(user => {
        return apiClient.patch(`/api/users/${user.email}/status`, { enabled });
      }));
      setUsers(prev => prev.map(u =>
        selectedRows.some(sel => sel.id === u.id) ? { ...u, enabled } : u
      ));
      setAlert({ open: true, message: `선택된 회원이 모두 ${enabled ? '활성화' : '비활성화'}되었습니다.`, severity: 'success' });
    } catch (error) {
      setAlert({ open: true, message: '일괄 상태 변경 중 오류가 발생했습니다.', severity: 'error' });
    }
  }, [apiRef]);

  // 통계 데이터 useMemo로 최적화
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const todayCount = usersOrigin.filter(u => u.createdAt && u.createdAt.slice(0, 10) === todayStr).length;
    const yesterdayCount = usersOrigin.filter(u => u.createdAt && u.createdAt.slice(0, 10) === yesterdayStr).length;
    const percentChange = yesterdayCount === 0 ? 100 : Math.round(((todayCount - yesterdayCount) / (yesterdayCount || 1)) * 100);
    const adminCount = usersOrigin.filter(u => u.role === 'ADMIN').length;
    const agencyCount = usersOrigin.filter(u => u.role === 'AGENCY').length;
    const activeSubscriptions = usersOrigin.filter(u => u.currentSubscription && u.currentSubscription.active).length;
    
    const joinTrend = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const dStr = d.toISOString().slice(0, 10);
      return {
        date: dStr.slice(5),
        count: usersOrigin.filter(u => u.createdAt && u.createdAt.slice(0, 10) === dStr).length
      };
    });
    return {
      total: usersOrigin.length,
      today: todayCount,
      percentChange,
      enabled: usersOrigin.filter(u => u.enabled).length,
      admin: adminCount,
      agency: agencyCount,
      activeSubscriptions,
      joinTrend
    };
  }, [usersOrigin]);

  return (
    <AdminMainLayout
      title="회원관리"
      description="회원 계정을 조회하고 관리할 수 있습니다. 권한별 필터링과 검색을 통해 효율적으로 회원을 관리하세요."
    >
      {/* 상단 통계 영역 */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Grid container spacing={2} justifyContent="center">
          {[
            {
              label: '총 회원',
              value: stats.total,
              color: '#23408e',
              icon: <PersonIcon fontSize="medium" />, 
              avatarColor: '#23408e',
            },
            {
              label: '신규 가입',
              value: stats.today,
              color: '#1976d2',
              icon: <PersonAddIcon fontSize="medium" />, 
              avatarColor: '#1976d2',
              percentChange: stats.percentChange
            },
            {
              label: '활성 회원',
              value: stats.enabled,
              color: '#10b981',
              icon: <CheckCircleIcon fontSize="medium" />, 
              avatarColor: '#10b981',
            },
            {
              label: '에이전시',
              value: stats.agency,
              color: '#8e24aa',
              icon: <AdminPanelSettingsIcon fontSize="medium" />, 
              avatarColor: '#8e24aa',
            },
            {
              label: '활성 구독',
              value: stats.activeSubscriptions,
              color: '#f57c00',
              icon: <CheckCircleIcon fontSize="medium" />, 
              avatarColor: '#f57c00',
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Card sx={{ 
                height: '100%', 
                background: `linear-gradient(135deg, ${stat.avatarColor}15, ${stat.avatarColor}05)`,
                border: `1px solid ${stat.avatarColor}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${stat.avatarColor}30`
                }
              }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: stat.avatarColor, 
                    width: 48, 
                    height: 48, 
                    mx: 'auto', 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h4" component="div" sx={{ 
                    fontWeight: 'bold', 
                    color: stat.color,
                    mb: 0.5
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {stat.label}
                  </Typography>
                  {stat.percentChange !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {stat.percentChange >= 0 ? (
                        <TrendingUpIcon sx={{ color: '#10b981', fontSize: 16 }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 16 }} />
                      )}
                      <Typography variant="caption" sx={{ 
                        color: stat.percentChange >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {Math.abs(stat.percentChange)}%
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 검색 및 필터 영역 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <Select
              fullWidth
              value={role}
              onChange={(e) => setRole(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">전체 권한</MenuItem>
              {ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Select
              fullWidth
              value={subRole}
              onChange={(e) => setSubRole(e.target.value)}
              displayEmpty
              size="small"
              disabled={!role}
            >
              <MenuItem value="">전체 세부권한</MenuItem>
              {(SUBROLE_OPTIONS[role] || []).map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Select
              fullWidth
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              size="small"
            >
              {SEARCH_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                sx={{ flex: 1 }}
              >
                검색
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                startIcon={<UndoIcon />}
                sx={{ flex: 1 }}
              >
                초기화
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 액션 버튼 영역 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={handleAddUser}
          sx={{ minWidth: 120 }}
        >
          회원 추가
        </Button>
        <Button
          variant="outlined"
          startIcon={<FaFileExcel />}
          onClick={handleExcelDownload}
          sx={{ minWidth: 120 }}
        >
          엑셀 다운로드
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={() => handleBatchStatus(true)}
          sx={{ minWidth: 120 }}
        >
          일괄 활성화
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleBatchStatus(false)}
          sx={{ minWidth: 120 }}
        >
          일괄 비활성화
        </Button>
      </Box>

      {/* 데이터 그리드 */}
      <Paper sx={{ height: 600, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <MUIDataGrid
            rows={users}
            columns={getSubscriptionColumns()}
            apiRef={apiRef}
            pagination
            paginationMode="server"
            rowCount={total}
            page={page - 1}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowClick={(params) => handleRowClick(params.row)}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          />
        )}
      </Paper>

      {/* 알림 */}
      {alert.open && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, minWidth: 300 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* 회원 상세 모달 */}
      <Modal
        open={detailOpen}
        onClose={handleDetailClose}
        title="회원 상세 정보"
        maxWidth="md"
      >
        {detailUser && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailUser.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">이름</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailUser.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">권한</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{getRoleLabel(detailUser.role)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">계정 상태</Typography>
                <Chip 
                  label={detailUser.enabled ? '활성' : '비활성'} 
                  color={detailUser.enabled ? 'success' : 'error'} 
                  sx={{ mb: 2 }}
                />
              </Grid>
              {detailUser.role === 'AGENCY' && detailUser.currentSubscription && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>구독 정보</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">구독 플랜</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {detailUser.currentSubscription.subscriptionPlan?.name || '알 수 없음'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">구독 상태</Typography>
                    <Box sx={{ mb: 2 }}>
                      {detailUser.currentSubscription.active ? (
                        <Chip label="활성" color="success" />
                      ) : (
                        <Chip label="비활성" color="error" />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">시작일</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(new Date(detailUser.currentSubscription.startDate))}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">만료일</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {formatDate(new Date(detailUser.currentSubscription.endDate))}
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">가입일</Typography>
                <Typography variant="body1">{formatDate(new Date(detailUser.createdAt))}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Modal>
    </AdminMainLayout>
  );
};

export default UsersManage; 