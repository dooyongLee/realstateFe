/**
 * 공통 데이터 그리드 컴포넌트 (DataGrid.jsx)
 * 
 * 이 컴포넌트는 매물관리, 회원관리, 구독관리 등 각 페이지에서
 * 공통으로 사용할 수 있는 데이터 그리드 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 동적 컬럼 설정
 * - 페이지네이션
 * - 정렬 기능
 * - 체크박스 선택
 * - 행 클릭 이벤트
 * - 로딩 상태 표시
 * - 빈 데이터 처리
 * - 반응형 디자인
 * 
 * 비즈니스 규칙:
 * - 컬럼 설정은 props로 전달받아 동적으로 생성
 * - 페이지네이션은 서버 사이드로 처리
 * - 체크박스 선택 시 부모 컴포넌트에 콜백 전달
 * - 행 클릭 시 상세 정보 모달 또는 페이지 이동
 * 
 * 데이터 형식:
 * - columns: Array<{ field: string, headerName: string, width?: number, renderCell?: Function, sortable?: boolean }>
 * - rows: Array<Object> (데이터 행 배열)
 * - loading: boolean (로딩 상태)
 * - pagination: Object (페이지네이션 정보)
 * - selectedRows: Array<string> (선택된 행 ID 배열)
 * - onRowClick: Function (행 클릭 콜백)
 * - onSelectionChange: Function (선택 변경 콜백)
 * - onPageChange: Function (페이지 변경 콜백)
 * - onPageSizeChange: Function (페이지 크기 변경 콜백)
 */

import React, { useState, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  CircularProgress,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TableSortLabel,
  Alert
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { formatDate } from '../../utils/formatDate';

/**
 * 공통 데이터 그리드 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.columns - 컬럼 설정 배열
 * @param {Array} props.rows - 데이터 행 배열
 * @param {boolean} props.loading - 로딩 상태
 * @param {Object} props.pagination - 페이지네이션 정보
 * @param {Array} props.selectedRows - 선택된 행 ID 배열
 * @param {Function} props.onRowClick - 행 클릭 콜백
 * @param {Function} props.onSelectionChange - 선택 변경 콜백
 * @param {Function} props.onPageChange - 페이지 변경 콜백
 * @param {Function} props.onPageSizeChange - 페이지 크기 변경 콜백
 * @param {Function} props.onSort - 정렬 변경 콜백
 * @param {Object} props.sortConfig - 정렬 설정
 * @param {boolean} props.selectable - 체크박스 선택 가능 여부
 * @param {boolean} props.clickable - 행 클릭 가능 여부
 * @param {Object} props.sx - 추가 스타일
 * @returns {JSX.Element} 데이터 그리드 UI
 * 
 * 사용 예시:
 * <DataGrid
 *   columns={[
 *     { field: 'id', headerName: 'ID', width: 100 },
 *     { field: 'name', headerName: '이름', width: 200 },
 *     { field: 'status', headerName: '상태', width: 120, renderCell: (value) => <Chip label={value} /> }
 *   ]}
 *   rows={data}
 *   loading={loading}
 *   pagination={{ page: 0, pageSize: 10, total: 100 }}
 *   selectedRows={selected}
 *   onRowClick={handleRowClick}
 *   onSelectionChange={handleSelectionChange}
 *   onPageChange={handlePageChange}
 *   onPageSizeChange={handlePageSizeChange}
 * />
 */
const DataGrid = ({
  columns = [],
  rows = [],
  loading = false,
  pagination = { page: 0, pageSize: 10, total: 0 },
  selectedRows = [],
  onRowClick,
  onSelectionChange,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortConfig = { field: '', direction: 'asc' },
  selectable = true,
  clickable = true,
  sx = {}
}) => {
  /**
   * 전체 선택/해제 핸들러
   * 
   * @param {Event} event - 체크박스 이벤트
   */
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.id);
      onSelectionChange?.(newSelected);
    } else {
      onSelectionChange?.([]);
    }
  };

  /**
   * 개별 행 선택/해제 핸들러
   * 
   * @param {string} id - 행 ID
   */
  const handleSelectRow = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1),
      );
    }

    onSelectionChange?.(newSelected);
  };

  /**
   * 행 선택 여부 확인
   * 
   * @param {string} id - 행 ID
   * @returns {boolean} 선택 여부
   */
  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  /**
   * 행 클릭 핸들러
   * 
   * @param {Object} row - 클릭된 행 데이터
   */
  const handleRowClick = (row) => {
    if (clickable && onRowClick) {
      onRowClick(row);
    }
  };

  /**
   * 정렬 핸들러
   * 
   * @param {string} field - 정렬할 필드
   */
  const handleSort = (field) => {
    if (onSort) {
      const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
      onSort(field, direction);
    }
  };

  /**
   * 기본 액션 컬럼 렌더링
   * 
   * @param {Object} row - 행 데이터
   * @returns {JSX.Element} 액션 버튼들
   */
  const renderActions = (row) => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="상세보기">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick?.(row);
          }}
          sx={{ color: '#3b82f6' }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="수정">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: 수정 기능 구현
          }}
          sx={{ color: '#10b981' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="삭제">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: 삭제 기능 구현
          }}
          sx={{ color: '#ef4444' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  /**
   * 기본 컬럼 설정
   * 액션 컬럼이 없는 경우 자동으로 추가
   */
  const finalColumns = useMemo(() => {
    const hasActions = columns.some(col => col.field === 'actions');
    if (!hasActions) {
      return [
        ...columns,
        {
          field: 'actions',
          headerName: '액션',
          width: 120,
          sortable: false,
          renderCell: (value, row) => renderActions(row)
        }
      ];
    }
    return columns;
  }, [columns]);

  /**
   * 빈 데이터 메시지
   */
  const EmptyDataMessage = () => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 8,
      color: 'text.secondary'
    }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        데이터가 없습니다
      </Typography>
      <Typography variant="body2">
        검색 조건을 변경하거나 다른 페이지를 확인해보세요.
      </Typography>
    </Box>
  );

  return (
    <Paper 
      sx={{ 
        width: '100%',
        overflow: 'hidden',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        ...sx 
      }}
    >
      {/* 로딩 상태 */}
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400 
        }}>
          <CircularProgress />
        </Box>
      )}

      {/* 데이터 테이블 */}
      {!loading && (
        <>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              {/* 테이블 헤더 */}
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  {/* 체크박스 컬럼 */}
                  {selectable && (
                    <TableCell padding="checkbox" sx={{ backgroundColor: '#f8fafc' }}>
                      <Checkbox
                        color="primary"
                        indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                        checked={rows.length > 0 && selectedRows.length === rows.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                  )}

                  {/* 데이터 컬럼들 */}
                  {finalColumns.map((column) => (
                    <TableCell
                      key={column.field}
                      sx={{
                        backgroundColor: '#f8fafc',
                        fontWeight: 600,
                        color: '#374151',
                        borderBottom: '2px solid #e5e7eb',
                        minWidth: column.width || 150,
                        ...column.headerStyle
                      }}
                    >
                      {column.sortable !== false && onSort ? (
                        <TableSortLabel
                          active={sortConfig.field === column.field}
                          direction={sortConfig.field === column.field ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort(column.field)}
                          sx={{ fontWeight: 600 }}
                        >
                          {column.headerName}
                        </TableSortLabel>
                      ) : (
                        column.headerName
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              {/* 테이블 바디 */}
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={finalColumns.length + (selectable ? 1 : 0)}>
                      <EmptyDataMessage />
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const isItemSelected = isSelected(row.id);
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => handleRowClick(row)}
                        selected={isItemSelected}
                        sx={{
                          cursor: clickable ? 'pointer' : 'default',
                          '&:hover': {
                            backgroundColor: clickable ? '#f3f4f6' : 'inherit'
                          },
                          '&.Mui-selected': {
                            backgroundColor: '#dbeafe',
                            '&:hover': {
                              backgroundColor: '#bfdbfe'
                            }
                          }
                        }}
                      >
                        {/* 체크박스 셀 */}
                        {selectable && (
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => handleSelectRow(row.id)}
                            />
                          </TableCell>
                        )}

                        {/* 데이터 셀들 */}
                        {finalColumns.map((column) => (
                          <TableCell
                            key={column.field}
                            sx={{
                              borderBottom: '1px solid #f3f4f6',
                              ...column.cellStyle
                            }}
                          >
                            {column.renderCell ? (
                              column.renderCell(row[column.field], row)
                            ) : (
                              <Typography variant="body2" noWrap>
                                {column.field === 'createdAt' || column.field === 'updatedAt' || column.field === 'startDate' || column.field === 'endDate'
                                  ? formatDate(row[column.field])
                                  : row[column.field] || '-'}
                              </Typography>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 페이지네이션 */}
          {pagination.total > 0 && (
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={pagination.total}
              rowsPerPage={pagination.pageSize}
              page={pagination.page}
              onPageChange={(event, newPage) => onPageChange?.(newPage)}
              onRowsPerPageChange={(event) => onPageSizeChange?.(parseInt(event.target.value, 10))}
              labelRowsPerPage="페이지당 행 수:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              sx={{
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}
            />
          )}
        </>
      )}
    </Paper>
  );
};

export default DataGrid;
