import React, { useEffect, useState, useCallback, useMemo } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import apiClient from "../../api/apiClient";
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/userUtils";
import MenuItem from '@mui/material/MenuItem';
import { FaFileExcel } from 'react-icons/fa';
import { getAllSubscriptions, getAllAgencyUserCounts } from "../../api/subscription";
import { useAuth } from "../../App";
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';

const statusMap = {
  ACTIVE: { label: '활성', color: 'success' },
  EXPIRED: { label: '만료', color: 'warning' },
  INACTIVE: { label: '비활성', color: 'error' },
  NONE: { label: '구독 없음', color: 'default' }
};

const statusOptions = [
  { value: '', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'EXPIRED', label: '만료' },
  { value: 'INACTIVE', label: '비활성' },
  { value: 'NONE', label: '구독 없음' }
];

const AGENCY_ROLES = ['AGENT', 'AGENCY', 'AGENCY_LEADER'];

const SubscriptionsManage = () => {
  const { user } = useAuth();
  // usersOrigin을 직접 fetch
  const [usersOrigin, setUsersOrigin] = useState([]);
  const [agencyUserCounts, setAgencyUserCounts] = useState({});
  
  useEffect(() => {
    apiClient.get("/api/users/page", { params: { page: 0, size: 10000 } })
      .then(res => {
        setUsersOrigin((res.data.data.content || []).map((user, idx) => ({
          ...user,
          id: String(user.id || user.email || `row_${idx}`)
        })));
      });
  }, []);

  // 에이전시별 사용자 수 가져오기 - 임시로 비활성화
  // useEffect(() => {
  //   const fetchAgencyUserCounts = async () => {
  //     try {
  //       const counts = await getAllAgencyUserCounts();
  //       const countMap = {};
  //       counts.forEach(count => {
  //         countMap[count.agencyId] = count.userCount;
  //       });
  //       setAgencyUserCounts(countMap);
  //     } catch (error) {
  //       console.error('에이전시 사용자 수 조회 실패:', error);
  //       setAgencyUserCounts({});
  //     }
  //   };
    
  //   if (user?.role === 'ADMIN') {
  //     fetchAgencyUserCounts();
  //   }
  // }, [user]);

  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAgency, setSearchAgency] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [selected, setSelected] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSub, setDetailSub] = useState(null);

  // 체크박스 관련 함수들
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = subs.slice((page - 1) * pageSize, page * pageSize).map((sub) => sub.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // 전체 에이전시 목록 추출
  const agencyUsers = useMemo(() => usersOrigin.filter(u => u.agencyId && AGENCY_ROLES.includes(u.role)), [usersOrigin]);

  // fetch 구독 데이터 (ADMIN이면 전체, 아니면 기존대로)
  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      let results = [];
      if (user?.role === 'ADMIN') {
        // ADMIN: 전체 구독 목록 API 호출
        const allSubs = await getAllSubscriptions();
        results = (allSubs || []).map(sub => {
          return {
            id: sub.id,
            agencyId: sub.agencyId,
            agencyName: sub.agencyName,
            planName: sub.planName || '알 수 없음',
            planType: sub.planType || 'UNKNOWN',
            maxUsers: sub.maxUsers || 0,
            currentUsers: sub.currentAgentCount || 0,
            price: sub.price || 0,
            status: sub.isManualActive ? (new Date(sub.endDate) < new Date() ? 'EXPIRED' : 'ACTIVE') : 'INACTIVE',
            startDate: sub.startDate,
            endDate: sub.endDate,
            isManualActive: sub.isManualActive,
            isOverLimit: sub.isOverLimit
          };
        });
      } else {
        // 기존 per-agency 방식
        results = await Promise.all(
          agencyUsers.map(async (user) => {
            try {
              const res = await apiClient.get(`/api/subscription-management/agency/${user.agencyId}/status`);
              return {
                agencyId: user.agencyId,
                agencyName: user.name,
                planName: res.data.data.planName || '-',
                planType: res.data.data.planType || '-',
                maxUsers: res.data.data.maxUsers || 0,
                currentUsers: res.data.data.currentAgentCount || agencyUserCounts[user.agencyId] || 0,
                price: res.data.data.price || 0,
                status: res.data.data.status || 'NONE',
                startDate: res.data.data.startDate,
                endDate: res.data.data.endDate,
                isManualActive: res.data.data.isManualActive
              };
            } catch (err) {
              return {
                agencyId: user.agencyId,
                agencyName: user.name,
                planName: '-',
                planType: '-',
                maxUsers: 0,
                currentUsers: 0,
                price: 0,
                status: 'NONE',
                startDate: null,
                endDate: null,
                isManualActive: false
              };
            }
          })
        );
      }
      // 검색/필터
      let filtered = results;
      if (searchAgency) {
        const kw = searchAgency.toLowerCase();
        filtered = filtered.filter(sub => String(sub.agencyName).toLowerCase().includes(kw) || String(sub.agencyId).includes(kw));
      }
      if (searchStatus) {
        filtered = filtered.filter(sub => sub.status === searchStatus);
      }
      setTotal(filtered.length);
      setSubs(filtered.slice((page - 1) * pageSize, (page) * pageSize));
    } catch (e) {
      setSubs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user, agencyUsers, searchAgency, searchStatus, page, pageSize]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  // 통계 카드
  const stats = useMemo(() => {
    const total = subs.length;
    const active = subs.filter(s => s.status === 'ACTIVE').length;
    const expired = subs.filter(s => s.status === 'EXPIRED').length;
    const inactive = subs.filter(s => s.status === 'INACTIVE').length;
    const none = subs.filter(s => s.status === 'NONE').length;
    
    // 사용량 통계
    const totalMaxUsers = subs.reduce((sum, s) => sum + (s.maxUsers || 0), 0);
    const totalCurrentUsers = subs.reduce((sum, s) => sum + (s.currentUsers || 0), 0);
    const usageRate = totalMaxUsers > 0 ? Math.round((totalCurrentUsers / totalMaxUsers) * 100) : 0;
    
    // 수익 통계
    const totalRevenue = subs.reduce((sum, s) => sum + (s.price || 0), 0);
    
    return [
      { 
        label: '총 구독', 
        value: total, 
        color: '#23408e', 
        subtitle: '전체 구독 수',
        icon: <PersonIcon fontSize="medium" />,
        avatarColor: '#23408e'
      },
      { 
        label: '활성 구독', 
        value: active, 
        color: '#10b981', 
        subtitle: '현재 활성',
        icon: <CheckCircleIcon fontSize="medium" />,
        avatarColor: '#10b981'
      },
      { 
        label: '총 사용자', 
        value: totalCurrentUsers, 
        color: '#1976d2', 
        subtitle: `${usageRate}% 사용률`,
        icon: <GroupIcon fontSize="medium" />,
        avatarColor: '#1976d2'
      },
      { 
        label: '총 수익', 
        value: `₩${totalRevenue.toLocaleString()}`, 
        color: '#f57c00', 
        subtitle: '월 구독료 합계',
        icon: <AttachMoneyIcon fontSize="medium" />,
        avatarColor: '#f57c00'
      },
      { 
        label: '만료/비활성', 
        value: expired + inactive, 
        color: '#ef4444', 
        subtitle: '관리 필요',
        icon: <WarningIcon fontSize="medium" />,
        avatarColor: '#ef4444'
      }
    ];
  }, [subs]);

  // 플랜 타입 매핑
  const planTypeMap = {
    'FREE': { label: 'Free Plan', color: 'default' },
    'STANDARD': { label: 'Standard Plan', color: 'primary' },
    'PREMIUM': { label: 'Premium Plan', color: 'secondary' }
  };

  // 일괄 활성/비활성화 (예시)
  const handleBatchStatus = (enabled) => {
    if (!selected.length) {
      setAlert({ open: true, message: '선택된 구독이 없습니다.', severity: 'warning' });
      return;
    }
    setAlert({ open: true, message: `일괄 ${enabled ? '활성화' : '비활성화'}는 데모입니다.`, severity: 'info' });
  };

  // 엑셀 다운로드 (예시)
  const handleExcelDownload = () => {
    setAlert({ open: true, message: '엑셀 다운로드 기능은 아직 구현되지 않았습니다.', severity: 'info' });
  };

  // 상세 모달
  const handleRowClick = (row) => {
    setDetailSub(row);
    setDetailOpen(true);
  };
  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailSub(null);
  };

  // 검색 초기화
  const handleResetFilters = () => {
    setSearchAgency("");
    setSearchStatus("");
    setPage(1);
    fetchSubs();
  };

  // 구독 연장
  const handleExtendSubscription = (subscription) => {
    setAlert({ 
      open: true, 
      message: `${subscription.agencyName}의 구독을 연장하시겠습니까?`, 
      severity: 'info' 
    });
    // TODO: 실제 연장 API 호출
    console.log('구독 연장:', subscription);
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <AdminMainLayout title="구독 관리">
        <div style={{ padding: 40, textAlign: 'center', color: '#d32f2f', fontSize: 20 }}>
          권한이 없습니다.
        </div>
      </AdminMainLayout>
    );
  }

  return (
    <AdminMainLayout title="구독 관리" description="에이전시 구독 현황을 확인할 수 있습니다.">
      {/* 상단 통계 카드 */}
      <Box sx={{ mb: 2, mt: 1 }}>
        <Grid container spacing={1.5} justifyContent="center">
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={idx}>
              <Card sx={{
                height: 'auto',
                minHeight: 90,
                background: `linear-gradient(135deg, ${stat.avatarColor}15, ${stat.avatarColor}05)`,
                border: `1px solid ${stat.avatarColor}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${stat.avatarColor}30`
                }
              }}>
                <CardContent sx={{ p: 1, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: stat.avatarColor, 
                    width: 32, 
                    height: 32, 
                    mx: 'auto', 
                    mb: 0.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h6" component="div" sx={{ 
                    fontWeight: 'bold', 
                    color: stat.color,
                    mb: 0.25
                  }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25, fontSize: '0.8rem' }}>
                    {stat.label}
                  </Typography>
                  {stat.subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7, fontSize: '0.7rem' }}>
                      {stat.subtitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* 검색/필터 영역 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="에이전시명, ID 검색"
              value={searchAgency}
              onChange={e => { setSearchAgency(e.target.value); setPage(1); }}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={fetchSubs}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={e => e.key === 'Enter' && fetchSubs()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              value={searchStatus}
              onChange={e => { setSearchStatus(e.target.value); setPage(1); }}
              size="small"
              label="구독상태"
            >
              {statusOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={fetchSubs}
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
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {selected.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {selected.length}개 선택됨
          </Typography>
        )}
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
          disabled={selected.length === 0}
        >
          일괄 활성화
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleBatchStatus(false)}
          sx={{ minWidth: 120 }}
          disabled={selected.length === 0}
        >
          일괄 비활성화
        </Button>
      </Box>
      {/* 데이터 그리드 */}
      <Paper sx={{ height: 400, width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>


            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="구독 목록">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selected.length > 0 && selected.length < subs.slice((page - 1) * pageSize, page * pageSize).length}
                        checked={subs.slice((page - 1) * pageSize, page * pageSize).length > 0 && selected.length === subs.slice((page - 1) * pageSize, page * pageSize).length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>에이전시명</TableCell>
                    <TableCell>플랜 타입</TableCell>
                    <TableCell align="right">최대 사용자</TableCell>
                    <TableCell align="right">현재 사용자</TableCell>
                    <TableCell align="right">가격</TableCell>
                    <TableCell>구독 상태</TableCell>
                    <TableCell>시작일</TableCell>
                    <TableCell>만료일</TableCell>
                    <TableCell align="center">액션</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subs.slice((page - 1) * pageSize, page * pageSize).map((sub) => {
                    const isItemSelected = isSelected(sub.id);
                    return (
                      <TableRow
                        key={sub.id}
                        onClick={() => handleRowClick(sub)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                          backgroundColor: isItemSelected ? '#e3f2fd' : 'inherit'
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleSelectRow(sub.id)}
                          />
                        </TableCell>
                        <TableCell>{sub.agencyName}</TableCell>
                        <TableCell>
                          {(() => {
                            const info = planTypeMap[sub.planType] || { label: sub.planType, color: 'default' };
                            return <Chip label={info.label} color={info.color} size='small' variant="outlined" />;
                          })()}
                        </TableCell>
                        <TableCell align="right">{sub.maxUsers || 0}</TableCell>
                        <TableCell align="right">{sub.currentUsers || 0}</TableCell>
                        <TableCell align="right">
                          {!sub.price || sub.price === 0 ? '무료' : `₩${sub.price.toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const info = statusMap[sub.status] || { label: sub.status, color: 'default' };
                            return <Chip label={info.label} color={info.color} size='small' />;
                          })()}
                        </TableCell>
                        <TableCell>{sub.startDate ? formatDate(sub.startDate) : '-'}</TableCell>
                        <TableCell>{sub.endDate ? formatDate(sub.endDate) : '-'}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtendSubscription(sub);
                            }}
                            sx={{ minWidth: 80 }}
                          >
                            연장
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={subs.length}
                rowsPerPage={pageSize}
                page={page - 1}
                onPageChange={(event, newPage) => setPage(newPage + 1)}
                onRowsPerPageChange={(event) => {
                  setPageSize(parseInt(event.target.value, 10));
                  setPage(1);
                }}
                labelRowsPerPage="페이지당 행 수:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              />
            </TableContainer>
          </>
        )}
      </Paper>
      {/* 알림 */}
      {alert.open && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, minWidth: 300 }}
        >
          {alert.message}
        </Alert>
      )}
      {/* 상세 모달 */}
      <Modal
        open={detailOpen}
        onClose={handleDetailClose}
        title="구독 상세 정보"
        maxWidth="md"
      >
        {detailSub && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">에이전시명</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.agencyName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">구독 플랜</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.planName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">플랜 타입</Typography>
                <Box sx={{ mb: 2 }}>
                  {(() => {
                    const planTypeMap = {
                      'FREE': { label: 'Free Plan', color: 'default' },
                      'STANDARD': { label: 'Standard Plan', color: 'primary' },
                      'PREMIUM': { label: 'Premium Plan', color: 'secondary' }
                    };
                    const info = planTypeMap[detailSub.planType] || { label: detailSub.planType, color: 'default' };
                    return <Chip label={info.label} color={info.color} variant="outlined" />;
                  })()}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">구독 상태</Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip label={statusMap[detailSub.status]?.label || detailSub.status} color={statusMap[detailSub.status]?.color || 'default'} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">최대 사용자</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.maxUsers || 0}명</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">현재 사용자</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.currentUsers || 0}명</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">가격</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {!detailSub.price || detailSub.price === 0 ? '무료' : `₩${detailSub.price.toLocaleString()}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">시작일</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.startDate ? formatDate(detailSub.startDate) : '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">만료일</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.endDate ? formatDate(detailSub.endDate) : '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">수동 활성화</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {detailSub.isManualActive ? '활성화됨' : '비활성화됨'}
                </Typography>
              </Grid>

            </Grid>
          </Box>
        )}
      </Modal>
    </AdminMainLayout>
  );
};

export default SubscriptionsManage; 