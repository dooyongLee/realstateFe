// 권한 옵션
export const ROLE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "ADMIN", label: "관리자" },
  { value: "USER", label: "일반회원" },
];

// 세부 권한 옵션
export const SUBROLE_OPTIONS = {
  ADMIN: [
    { value: "", label: "전체" },
    { value: "AGENT", label: "중개사" },
    { value: "AGENT_LEADER", label: "중개사장" },
  ],
  USER: [
    { value: "", label: "전체" },
    { value: "LANDLORD", label: "임대인" },
    { value: "TENANT", label: "임차인" },
  ],
};

// 검색 타입 옵션
export const SEARCH_TYPE_OPTIONS = [
  { value: "", label: "전체" },
  { value: "name", label: "이름" },
  { value: "email", label: "이메일" },
  { value: "phone", label: "전화번호" },
];

// 권한 라벨 변환 함수
export const getRoleLabel = (role) => {
  const roleMap = {
    ADMIN: "관리자",
    USER: "일반회원"
  };
  return roleMap[role] || role;
};

// 날짜 포맷 함수
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// columns: handleStatusToggle을 인자로 받는 함수로 export
export const columns = (handleStatusToggle) => [
  { key: "email", label: "이메일" },
  { key: "username", label: "아이디" },
  { key: "name", label: "이름" },
  { key: "phone", label: "전화번호" },
  { key: "role", label: "권한", render: (value) => getRoleLabel(value) },
  { key: "enabled", label: "상태", render: (enabled, row) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button
        onClick={e => {
          e.stopPropagation();
          handleStatusToggle(row.id, enabled);
        }}
        className="status-toggle-btn"
        data-user-id={row.id}
        data-enabled={enabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
        title={enabled ? '비활성화로 변경' : '활성화로 변경'}
      >
        <span style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: enabled ? '#1976d2' : '#b0bec5',
          position: 'relative',
          display: 'inline-block',
          transition: 'background 0.2s',
          marginRight: 10,
        }}>
          <span style={{
            position: 'absolute',
            left: enabled ? 22 : 2,
            top: 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            transition: 'left 0.2s',
            border: enabled ? '2px solid #1976d2' : '2px solid #b0bec5',
          }} />
        </span>
        <span style={{
          fontWeight: 700,
          color: enabled ? '#1976d2' : '#b0bec5',
          fontSize: 15,
          minWidth: 48,
          textAlign: 'left',
        }}>
          {enabled ? '활성' : '비활성'}
        </span>
      </button>
    </div>
  )},
  { key: "createdAt", label: "가입일", render: (value) => formatDate(value) },
]; 