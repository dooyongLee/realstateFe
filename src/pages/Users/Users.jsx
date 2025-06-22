import React, { useState, useEffect } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import SearchBar from "../../components/SearchBar";
import DataGrid from "../../components/DataGrid";
import apiClient from "../../api/apiClient";

const columns = [
  { key: "email", label: "이메일" },
  { key: "username", label: "아이디" },
  { key: "name", label: "이름" },
  { key: "phone", label: "전화번호" },
  { key: "role", label: "권한" },
];

const PAGE_SIZE = 10;
const ROLE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "ADMIN", label: "관리자" },
  { value: "USER", label: "회원" },
];
const SUBROLE_OPTIONS = {
  ADMIN: [
    { value: "AGENT", label: "중개사" },
    { value: "AGENT_LEADER", label: "중개사장" },
  ],
  USER: [
    { value: "LANDLORD", label: "임대인" },
    { value: "TENANT", label: "임차인" },
  ],
};
const SEARCH_TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "name", label: "이름" },
  { value: "email", label: "이메일" },
];

const Users = () => {
  const [role, setRole] = useState("");
  const [subRole, setSubRole] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const fetchUsers = async (pageArg = page) => {
    setLoading(true);
    try {
      const params = { page: pageArg - 1, size: PAGE_SIZE, role };
      if (role && subRole) params.subRole = subRole;
      if (searchType && keyword) params[searchType] = keyword;
      const res = await apiClient.get("/api/users/page", { params });
      const d = res.data.data;
      setUsers(d.content || []);
      setPage((d.page || 0) + 1);
      setPageSize(d.size || PAGE_SIZE);
      setTotal(d.totalElements || 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handlePageChange = (p) => {
    setPage(p);
    fetchUsers(p);
  };

  useEffect(() => { setSubRole(""); }, [role]);

  return (
    <AdminMainLayout
      title="회원관리"
      description="회원 계정 목록을 조회/관리할 수 있습니다."
      actions={null}
    >
      <SearchBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={() => { setPage(1); fetchUsers(1); }}
      >
        <select
          className="search-bar-select"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          {ROLE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {role && SUBROLE_OPTIONS[role] && (
          <select
            className="search-bar-select"
            value={subRole}
            onChange={e => setSubRole(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="">하위 역할 전체</option>
            {SUBROLE_OPTIONS[role].map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        <select
          className="search-bar-select"
          value={searchType}
          onChange={e => setSearchType(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          {SEARCH_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </SearchBar>
      <DataGrid
        columns={columns}
        rows={users}
        loading={loading}
        emptyText="회원이 없습니다."
        onRowClick={user => alert(user.name + ' 상세보기')}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
      />
    </AdminMainLayout>
  );
};

export default Users; 