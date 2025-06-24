import React, { useState, useEffect } from "react";

function downloadExcel(columns, rows, fileName = "data.xlsx") {
  // 간단한 엑셀(CSV) 다운로드 구현
  const header = columns.map(col => col.label).join(",");
  const body = rows.map(row => columns.map(col => {
    const value = row[col.key];
    return col.render ? col.render(value, row) : value;
  }).join(",")).join("\n");
  const csv = [header, body].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="data-grid-pagination">
      <button disabled={page === 1} onClick={() => onPageChange(1)}>{"<<"}</button>
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>{"<"}</button>
      {pages.map(p => (
        <button key={p} className={p === page ? "active" : ""} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>{">"}</button>
      <button disabled={page === totalPages} onClick={() => onPageChange(totalPages)}>{">>"}</button>
    </div>
  );
}

const DataGrid = ({ 
  columns, 
  rows, 
  loading, 
  emptyText, 
  onRowClick, 
  actions, 
  page, 
  pageSize, 
  total, 
  onPageChange,
  onPageSizeChange
}) => {
  // 셀 렌더링 함수
  const renderCell = (col, row) => {
    const value = row[col.key];
    if (col.render) {
      const rendered = col.render(value, row);
      // HTML 문자열인 경우 dangerouslySetInnerHTML 사용
      if (typeof rendered === 'string' && rendered.includes('<')) {
        return <span dangerouslySetInnerHTML={{ __html: rendered }} />;
      }
      return rendered;
    }
    return value;
  };

  return (
    <div className="data-grid-wrapper">
      <div className="data-grid-actions">
        <div className="data-grid-actions-left">
          {actions}
        </div>
        <div className="data-grid-actions-right">
          {/* 페이지당 데이터 개수 선택 */}
          <div className="page-size-selector">
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
              className="page-size-select"
            >
              <option value={10}>10개씩 보기</option>
              <option value={20}>20개씩 보기</option>
              <option value={50}>50개씩 보기</option>
              <option value={100}>100개씩 보기</option>
            </select>
          </div>
          
        </div>
      </div>
      <table className="data-grid">
        <thead>
          <tr>
            <th key="number-col" style={{ textAlign: 'center' }}>번호</th>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
            </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr key="loading">
              <td colSpan={columns.length + 1} className="data-grid-loading">
                로딩중...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr key="empty">
              <td colSpan={columns.length + 1} className="data-grid-empty">
                {emptyText || "데이터가 없습니다."}
              </td>
            </tr>
          ) : rows.map((row, rowIdx) => (
            <tr
              key={row.id}
              data-user-id={row.id}
              className={onRowClick ? "data-grid-row-clickable" : ""}
            >
              <td key={`number_${row.id}`}>{total - ((page - 1) * pageSize + rowIdx)}</td>
              {columns.map((col, colIdx) => {
                // 상태 컬럼(td)만 클릭 이벤트 분리
                if (col.key === 'enabled') {
                  return (
                    <td key={col.key + '_' + row.id} onClick={e => e.stopPropagation()}>
                      {renderCell(col, row)}
                    </td>
                  );
                }
                // 나머지 컬럼(td) 클릭 시 상세 모달
                return (
                  <td key={col.key + '_' + row.id} onClick={() => onRowClick && onRowClick(row)}>
                    {renderCell(col, row)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  );
};

export default DataGrid; 