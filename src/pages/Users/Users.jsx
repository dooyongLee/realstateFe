import React, { useState, useEffect } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import SearchBar from "../../components/SearchBar";
import DataGrid from "../../components/DataGrid";
import apiClient from "../../api/apiClient";
import { FaPlus, FaFileExcel } from "react-icons/fa";
import Modal from "../../components/Modal";
import { columns, getRoleLabel, formatDate, ROLE_OPTIONS, SUBROLE_OPTIONS, SEARCH_TYPE_OPTIONS } from "../../utils/userUtils.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import styles from "../../components/SearchBar.module.css";

const Users = () => {
  const { showAlert } = useAlert();
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

  const fetchUsers = async (pageArg = page) => {
    setLoading(true);
    try {
      const params = { 
        page: pageArg - 1, 
        size: pageSize 
      };
      if (role) params.role = role;
      if (subRole) params.subRole = subRole;
      if (searchType && keyword) params[searchType] = keyword;
      // 전체 회원 데이터(검색/필터 없이)
      const allRes = await apiClient.get("/api/users/page", { params: { page: 0, size: 10000 } });
      setUsersOrigin(
        (allRes.data.data.content || []).map((user, idx) => ({
          ...user,
          id: user.id || user.email || `row_${idx}`
        }))
      );
      // 현재 페이지 데이터
      const res = await apiClient.get("/api/users/page", { params });
      const d = res.data.data;
      setUsers(
        (d.content || []).map((user, idx) => ({
          ...user,
          id: user.id || user.email || `row_${idx}`
        }))
      );
      setPage((d.page || 0) + 1);
      setPageSize(d.size || pageSize);
      setTotal(d.totalElements || 0);
    } catch (error) {
      console.error("회원 목록 조회 실패:", error);
      showAlert('회원 목록 조회 중 오류가 발생했습니다.', 'error');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line
  }, [page, pageSize]);

  const handlePageChange = (p) => {
    setPage(p);
    fetchUsers(p);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem("usersPageSize", newPageSize);
    setPage(1);
  };

  useEffect(() => { 
    setSubRole(""); 
  }, [role]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers(1);
  };

  const handleResetFilters = () => {
    setRole("");
    setSubRole("");
    setSearchType("name");
    setKeyword("");
    setPage(1);
    fetchUsers(1);
  };

  const handleAddUser = () => {
    showAlert("회원 추가 기능은 아직 구현되지 않았습니다.", "info");
  };

  const handleExcelDownload = () => {
    showAlert("엑셀 다운로드 기능은 아직 구현되지 않았습니다.", "info");
  };

  const handleStatusToggle = async (userId, currentEnabled) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      showAlert('사용자 정보를 찾을 수 없습니다.', 'error');
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
      showAlert(`회원이 ${newEnabled ? '활성화' : '비활성화'}되었습니다.`, 'success');
    } catch (error) {
      console.error("회원 상태 변경 실패:", error);
      showAlert("회원 상태 변경 중 오류가 발생했습니다.", "error");
    }
  };

  const handleRowClick = (user) => {
    setDetailUser(user);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailUser(null);
  };

  return (
    <AdminMainLayout
      title="회원관리"
      description="회원 계정을 조회하고 관리할 수 있습니다. 권한별 필터링과 검색을 통해 효율적으로 회원을 관리하세요."
    >
      {/* 상단 통계 영역 */}
      <div className="users-header">
        <div className="users-header-main">
          <div className="users-stats-group compact">
            <div className="users-stat-card total">
              <div className="stat-label">총 회원</div>
              <div className="stat-value">{usersOrigin.length}</div>
            </div>
            <div className="users-stat-card enabled">
              <div className="stat-label">활성</div>
              <div className="stat-value">{usersOrigin.filter(u=>u.enabled).length}</div>
            </div>
            <div className="users-stat-card disabled">
              <div className="stat-label">비활성</div>
              <div className="stat-value">{usersOrigin.filter(u=>!u.enabled).length}</div>
            </div>
            <div className="users-stat-card rate">
              <div className="stat-label">활성률</div>
              <div className="stat-value">
                {usersOrigin.length > 0 ? Math.round(usersOrigin.filter(u=>u.enabled).length / usersOrigin.length * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터/검색 바와 데이터 그리드를 포함하는 컨테이너 */}
      <div className="data-grid-container">
        <div className="users-filter-bar">
          <SearchBar
            keyword={keyword}
            onKeywordChange={setKeyword}
            onSearch={handleSearch}
            onReset={handleResetFilters}
          >
            <select
              className={styles.select}
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              className={styles.select}
              value={subRole}
              onChange={e => setSubRole(e.target.value)}
              disabled={!role}
            >
              {(SUBROLE_OPTIONS[role] || [{ value: '', label: '전체' }]).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              className={styles.select}
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
            >
              {SEARCH_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </SearchBar>
          <div className="filter-bar__actions">
            <button className="btn btn-outline-secondary" onClick={handleExcelDownload}>
              <FaFileExcel /> 엑셀 다운로드
            </button>
            <button className="btn btn-primary" onClick={handleAddUser}>
              <FaPlus /> 회원추가
            </button>
          </div>
        </div>

        <DataGrid
          columns={columns(handleStatusToggle)}
          rows={users}
          loading={loading}
          emptyText="조회된 회원이 없습니다."
          onRowClick={handleRowClick}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* 상세 모달 영역 */}
      <Modal isOpen={detailOpen} onClose={handleDetailClose}>
        {detailUser && (
          <div style={{ minWidth: 320 }}>
            <h2 style={{ marginTop: 0 }}>{detailUser.name} 회원 상세정보</h2>
            <div style={{ marginBottom: 12 }}><b>이메일:</b> {detailUser.email}</div>
            <div style={{ marginBottom: 12 }}><b>아이디:</b> {detailUser.username}</div>
            <div style={{ marginBottom: 12 }}><b>전화번호:</b> {detailUser.phone}</div>
            <div style={{ marginBottom: 12 }}><b>권한:</b> {getRoleLabel(detailUser.role)}</div>
            <div style={{ marginBottom: 12 }}><b>상태:</b> {detailUser.enabled ? '활성' : '비활성'}</div>
            <div style={{ marginBottom: 12 }}><b>가입일:</b> {formatDate(detailUser.createdAt)}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {detailUser.enabled ? (
                <button className="btn btn-warning" onClick={() => handleStatusToggle(detailUser.id, detailUser.enabled)}>비활성화</button>
              ) : (
                <button className="btn btn-success" onClick={() => handleStatusToggle(detailUser.id, detailUser.enabled)}>활성화</button>
              )}
              <button className="btn btn-primary" onClick={handleDetailClose}>닫기</button>
            </div>
          </div>
        )}
      </Modal>
    </AdminMainLayout>
  );
};

export default Users; 