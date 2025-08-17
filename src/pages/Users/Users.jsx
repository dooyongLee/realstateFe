import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Grid,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  CircularProgress,
  Box,
  Chip,
  IconButton,
  Checkbox,
  TextField,
  InputAdornment,
  MenuItem,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search as SearchIcon, Refresh as UndoIcon } from '@mui/icons-material';
import { FaFileExcel } from 'react-icons/fa';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../App';
import { formatDate } from '../../utils/userUtils';
import AdminMainLayout from '../../components/AdminMainLayout';
import apiClient from '../../api/apiClient';
import StatsCard from '../../components/cards/StatsCard';
import SearchFilter from '../../components/common/SearchFilter';

const roleOptions = [
  { value: '', label: '전체' },
  { value: 'ADMIN', label: '관리자' },
  { value: 'AGENCY', label: '에이전시' },
  { value: 'AGENT', label: '에이전트' }
];

const statusOptions = [
  { value: '', label: '전체' },
  { value: 'true', label: '활성' },
  { value: 'false', label: '비활성' }
];

const getRoleLabel = (role) => {
  switch (role) {
    case 'ADMIN': return '관리자';
    case 'AGENCY': return '에이전시';
    case 'AGENT': return '에이전트';
    default: return role;
  }
};

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  
  // 선택 관련 상태
  const [selected, setSelected] = useState([]);
  
  // 모달 상태
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 사용자 데이터 가져오기
  const fetchUsers = useCallback(async () => {
    if (!user || user.role !== 'ADMIN') return;
    
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pageSize
      };
      
      if (searchKeyword) params.search = searchKeyword;
      if (searchRole) params.role = searchRole;
      if (searchStatus !== '') params.enabled = searchStatus === 'true';
      
      const response = await apiClient.get('/api/users/page', { params });
      const data = response.data.data;
      
      setUsers(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user, page, pageSize, searchKeyword, searchRole, searchStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 전체 사용자 데이터 (통계용)
  const [allUsers, setAllUsers] = useState([]);
  
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!user || user.role !== 'ADMIN') return;
      
      try {
        const response = await apiClient.get('/api/users/page', { 
          params: { page: 0, size: 10000 } 
        });
        setAllUsers(response.data.data.content || []);
      } catch (error) {
        console.error('전체 사용자 조회 실패:', error);
        setAllUsers([]);
      }
    };
    
    fetchAllUsers();
  }, [user]);

  // 통계 카드 데이터
  const stats = useMemo(() => {
    const total = allUsers.length;
    const enabled = allUsers.filter(u => u.enabled).length;
    const disabled = allUsers.filter(u => !u.enabled).length;
    const admin = allUsers.filter(u => u.role === 'ADMIN').length;
    const agency = allUsers.filter(u => u.role === 'AGENCY' || u.role === 'AGENT').length;
    
    return [
      { 
        label: '총 회원', 
        value: total, 
        color: '#23408e', 
        subtitle: '전체 회원 수',
        icon: <PersonIcon fontSize="medium" />,
        avatarColor: '#23408e'
      },
      { 
        label: '활성 회원', 
        value: enabled, 
        color: '#10b981', 
        subtitle: '현재 활성',
        icon: <CheckCircleIcon fontSize="medium" />,
        avatarColor: '#10b981'
      },
      { 
        label: '비활성 회원', 
        value: disabled, 
        color: '#ef4444', 
        subtitle: '관리 필요',
        icon: <GroupIcon fontSize="medium" />,
        avatarColor: '#ef4444'
      },
      { 
        label: '관리자', 
        value: admin, 
        color: '#1976d2', 
        subtitle: '시스템 관리자',
        icon: <AdminPanelSettingsIcon fontSize="medium" />,
        avatarColor: '#1976d2'
      },
      { 
        label: '에이전시', 
        value: agency, 
        color: '#f57c00', 
        subtitle: '에이전시/에이전트',
        icon: <BusinessIcon fontSize="medium" />,
        avatarColor: '#f57c00'
      }
    ];
  }, [allUsers]);

  // 선택 관련 함수들
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const currentPageUsers = users.slice((page - 1) * pageSize, page * pageSize);
      setSelected(currentPageUsers.map(user => user.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (userId) => {
    setSelected(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const isSelected = (userId) => selected.includes(userId);

  // 행 클릭 핸들러
  const handleRowClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  /**
   * 검색 실행 핸들러
   * 공통 검색 컴포넌트에서 호출되는 검색 함수
   * 
   * @param {Object} searchValues - 검색 조건 값들
   */
  const handleSearch = (searchValues) => {
    setSearchKeyword(searchValues.searchKeyword || '');
    setSearchRole(searchValues.searchRole || '');
    setSearchStatus(searchValues.searchStatus || '');
    setPage(1);
    fetchUsers();
  };

  /**
   * 검색 필터 초기화 핸들러
   * 공통 검색 컴포넌트에서 호출되는 초기화 함수
   * 
   * @param {Object} resetValues - 초기화된 검색 값들
   */
  const handleResetFilters = (resetValues) => {
    setSearchKeyword(resetValues.searchKeyword || '');
    setSearchRole(resetValues.searchRole || '');
    setSearchStatus(resetValues.searchStatus || '');
    setPage(1);
    fetchUsers();
  };

  // 일괄 처리 함수들
  const handleBatchStatus = (enabled) => {
    if (!selected.length) {
      alert('선택된 회원이 없습니다.');
      return;
    }
    alert(`일괄 ${enabled ? '활성화' : '비활성화'}는 데모입니다.`);
  };

  const handleExcelDownload = () => {
    alert('엑셀 다운로드는 데모입니다.');
  };

  // 권한 체크
  if (!user || user.role !== 'ADMIN') {
    return (
      <AdminMainLayout title="회원 관리" description="시스템 회원을 관리할 수 있습니다.">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          권한이 없습니다.
        </div>
      </AdminMainLayout>
    );
  }

  return (
    <AdminMainLayout title="회원 관리" description="시스템 회원을 관리할 수 있습니다.">
      {/* 상단 통계 카드 */}
      <StatsCard stats={stats} />
      
      {/* 검색/필터 영역 */}
      <SearchFilter
        searchFields={[
          {
            type: 'text',
            key: 'searchKeyword',
            placeholder: '이메일, 이름, 전화번호 검색'
          }
        ]}
        filterFields={[
          {
            key: 'searchRole',
            label: '권한',
            options: roleOptions
          },
          {
            key: 'searchStatus',
            label: '상태',
            options: statusOptions
          }
        ]}
        searchValues={{
          searchKeyword: searchKeyword,
          searchRole: searchRole,
          searchStatus: searchStatus
        }}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

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
              <Table sx={{ minWidth: 650 }} aria-label="회원 목록">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selected.length > 0 && selected.length < users.slice((page - 1) * pageSize, page * pageSize).length}
                        checked={users.slice((page - 1) * pageSize, page * pageSize).length > 0 && selected.length === users.slice((page - 1) * pageSize, page * pageSize).length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>이메일</TableCell>
                    <TableCell sx={{ minWidth: 150 }}>에이전시명</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>이름</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>전화번호</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>권한</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>상태</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>가입일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice((page - 1) * pageSize, page * pageSize).map((user) => {
                    const isItemSelected = isSelected(user.id);
                    return (
                      <TableRow
                        key={user.id}
                        onClick={() => handleRowClick(user)}
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
                            onChange={() => handleSelectRow(user.id)}
                          />
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.agencyName || '-'}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getRoleLabel(user.role)} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.enabled ? '활성' : '비활성'} 
                            size="small" 
                            color={user.enabled ? 'success' : 'error'} 
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
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
          </>
        )}
      </Paper>

      {/* 상세 정보 모달 */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>회원 상세 정보</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">이메일</Typography>
                  <Typography variant="body1">{selectedUser.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">이름</Typography>
                  <Typography variant="body1">{selectedUser.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">에이전시명</Typography>
                  <Typography variant="body1">{selectedUser.agencyName || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">전화번호</Typography>
                  <Typography variant="body1">{selectedUser.phone || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">권한</Typography>
                  <Chip 
                    label={getRoleLabel(selectedUser.role)} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">상태</Typography>
                  <Chip 
                    label={selectedUser.enabled ? '활성' : '비활성'} 
                    size="small" 
                    color={selectedUser.enabled ? 'success' : 'error'} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">가입일</Typography>
                  <Typography variant="body1">{formatDate(selectedUser.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">수정일</Typography>
                  <Typography variant="body1">{formatDate(selectedUser.updatedAt)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>닫기</Button>
        </DialogActions>
      </Dialog>
    </AdminMainLayout>
  );
};

export default Users;

