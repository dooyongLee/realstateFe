import React from "react";

const PropertyList = () => {
  // 예시 데이터
  const properties = [
    { id: 1, name: "강남 오피스텔" },
    { id: 2, name: "송파 아파트" },
  ];
  return (
    <div>
      <h2>매물 목록</h2>
      <ul>
        {properties.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyList; 