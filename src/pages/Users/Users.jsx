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

const Users = () => {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async (pageArg = page) => {
    setLoading(true);
    try {
      // 실제 API에 맞게 쿼리 파라미터 등 수정
      const res = await apiClient.get("/api/users", { params: { keyword, page: pageArg, size: PAGE_SIZE } });
      setUsers(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
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
      />
      <DataGrid
        columns={columns}
        rows={users}
        loading={loading}
        emptyText="회원이 없습니다."
        onRowClick={user => alert(user.name + ' 상세보기')}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={handlePageChange}
      />
    </AdminMainLayout>
  );
};

export default Users; 