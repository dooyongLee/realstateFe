import React, { useState } from "react";

function downloadExcel(columns, rows, fileName = "data.xlsx") {
  // 간단한 엑셀(CSV) 다운로드 구현
  const header = columns.map(col => col.label).join(",");
  const body = rows.map(row => columns.map(col => row[col.key]).join(",")).join("\n");
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

const DataGrid = ({ columns, rows, loading, emptyText, onRowClick, actions, page, pageSize, total, onPageChange }) => {
  const [checked, setChecked] = useState([]);
  const allChecked = rows.length > 0 && checked.length === rows.length;

  const toggleAll = () => {
    setChecked(allChecked ? [] : rows.map(r => r.id));
  };
  const toggleOne = (id) => {
    setChecked(checked.includes(id) ? checked.filter(cid => cid !== id) : [...checked, id]);
  };

  return (
    <div className="data-grid-wrapper">
      <div className="data-grid-actions">
        {actions}
        <button className="data-grid-excel" onClick={() => downloadExcel(columns, rows)}>엑셀 다운로드</button>
      </div>
      <table className="data-grid">
        <thead>
          <tr>
            <th><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
            {columns.map(col => <th key={col.key}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + 1} className="data-grid-loading">로딩중...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length + 1} className="data-grid-empty">{emptyText || "데이터가 없습니다."}</td></tr>
          ) : rows.map(row => (
            <tr key={row.id} onClick={() => onRowClick && onRowClick(row)} className={onRowClick ? "data-grid-row-clickable" : ""}>
              <td><input type="checkbox" checked={checked.includes(row.id)} onChange={e => { e.stopPropagation(); toggleOne(row.id); }} /></td>
              {columns.map(col => <td key={col.key}>{row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
    </div>
  );
};

export default DataGrid; 