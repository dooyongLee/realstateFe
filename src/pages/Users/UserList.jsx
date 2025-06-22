import React from "react";

const UserList = () => {
  // 예시 데이터
  const users = [
    { id: 1, name: "홍길동" },
    { id: 2, name: "김철수" },
  ];
  return (
    <div>
      <h2>회원 목록</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList; 