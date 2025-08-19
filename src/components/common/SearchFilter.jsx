/**
 * 공통 검색 필터 컴포넌트 (SearchFilter.jsx)
 * 
 * 이 컴포넌트는 매물관리, 회원관리, 구독관리 등 각 페이지에서
 * 공통으로 사용할 수 있는 검색 및 필터 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 동적 검색 필드 생성
 * - 검색어 입력 및 검색 타입 선택
 * - 필터 조건 설정
 * - 검색 및 초기화 기능
 * - 반응형 디자인 지원
 * 
 * 비즈니스 규칙:
 * - 검색 조건은 props로 전달받아 동적으로 생성
 * - 검색어 입력 시 Enter 키로 검색 실행
 * - 초기화 버튼으로 모든 조건 리셋
 * - 검색 실행 시 부모 컴포넌트에 콜백 전달
 * 
 * 데이터 형식:
 * - searchFields: Array<{ type: string, key: string, label: string, options?: Array, placeholder?: string }>
 * - filterFields: Array<{ key: string, label: string, options: Array }>
 * - searchValues: Object (현재 검색 값들)
 * - onSearch: Function (검색 실행 콜백)
 * - onReset: Function (초기화 콜백)
 */

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  InputAdornment,
  Box,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import './SearchFilter.css';

/**
 * 공통 검색 필터 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Array} props.searchFields - 검색 필드 설정 배열
 * @param {Array} props.filterFields - 필터 필드 설정 배열
 * @param {Object} props.searchValues - 현재 검색 값들
 * @param {Function} props.onSearch - 검색 실행 콜백
 * @param {Function} props.onReset - 초기화 콜백
 * @param {Object} props.sx - 추가 스타일
 * @returns {JSX.Element} 검색 필터 UI
 * 
 * 사용 예시:
 * <SearchFilter
 *   searchFields=[
 *     { type: 'text', key: 'keyword', placeholder: '검색어 입력' },
 *     { type: 'select', key: 'searchType', label: '검색타입', options: [
 *       { value: 'name', label: '이름' },
 *       { value: 'email', label: '이메일' }
 *     ]}
 *   ]
 *   filterFields=[
 *     { key: 'status', label: '상태', options: [
 *       { value: '', label: '전체' },
 *       { value: 'active', label: '활성' }
 *     ]}
 *   ]
 *   searchValues={searchValues}
 *   onSearch={handleSearch}
 *   onReset={handleReset}
 * />
 */
const SearchFilter = ({
  searchFields = [],
  filterFields = [],
  searchValues = {},
  onSearch,
  onReset,
  sx = {}
}) => {
  /**
   * 내부 검색 값 상태
   * 부모 컴포넌트의 searchValues와 동기화
   */
  const [internalValues, setInternalValues] = useState(searchValues);

  /**
   * 부모 컴포넌트의 searchValues가 변경될 때 내부 상태 동기화
   */
  useEffect(() => {
    setInternalValues(searchValues);
  }, [searchValues]);

  /**
   * 검색 값 변경 핸들러
   * 
   * @param {string} key - 변경할 필드 키
   * @param {any} value - 새로운 값
   */
  const handleValueChange = (key, value) => {
    setInternalValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = () => {
    if (onSearch) {
      onSearch(internalValues);
    }
  };

  /**
   * 초기화 핸들러
   */
  const handleReset = () => {
    const resetValues = {};
    
    // 모든 필드 값을 빈 값으로 초기화
    [...searchFields, ...filterFields].forEach(field => {
      resetValues[field.key] = field.type === 'select' ? '' : '';
    });
    
    setInternalValues(resetValues);
    
    if (onReset) {
      onReset(resetValues);
    }
  };

  /**
   * Enter 키 입력 핸들러
   * 
   * @param {KeyboardEvent} e - 키보드 이벤트
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * 검색 필드 렌더링
   * 
   * @param {Object} field - 검색 필드 설정
   * @param {number} index - 필드 인덱스
   * @returns {JSX.Element} 검색 필드 컴포넌트
   */
  const renderSearchField = (field, index) => {
    const { type, key, label, placeholder, options = [] } = field;
    const value = internalValues[key] || '';

    if (type === 'select') {
      return (
        <Grid item xs={12} sm={6} md={3} lg={2} key={`search-${index}`}>
          <FormControl fullWidth size="small">
            <InputLabel id={`${key}-label`}>{label}</InputLabel>
            <Select
              labelId={`${key}-label`}
              value={value}
              onChange={(e) => handleValueChange(key, e.target.value)}
              label={label}
              inputProps={{ 'aria-label': label }}
            >
              {options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      );
    }

    if (type === 'text') {
      return (
        <Grid item xs={12} sm={6} md={4} lg={3} key={`search-${index}`}>
          <TextField
            fullWidth
            placeholder={placeholder || '검색어를 입력하세요'}
            value={value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} size="small" aria-label="검색">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            inputProps={{ 'aria-label': label || placeholder }}
          />
        </Grid>
      );
    }

    return null;
  };

  /**
   * 필터 필드 렌더링
   * 
   * @param {Object} field - 필터 필드 설정
   * @param {number} index - 필드 인덱스
   * @returns {JSX.Element} 필터 필드 컴포넌트
   */
  const renderFilterField = (field, index) => {
    const { key, label, options = [] } = field;
    const value = internalValues[key] || '';

    return (
      <Grid item xs={12} sm={6} md={3} lg={2} key={`filter-${index}`}>
        <FormControl fullWidth size="small">
          <InputLabel id={`${key}-label`}>{label}</InputLabel>
          <Select
            labelId={`${key}-label`}
            value={value}
            onChange={(e) => handleValueChange(key, e.target.value)}
            label={label}
          >
            {options.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    );
  };

  return (
    <Paper 
      className="search-filter"
      sx={sx}
    >
      <Grid container spacing={2} alignItems="center">
        {/* 검색 필드들 */}
        {searchFields.map((field, index) => renderSearchField(field, index))}
        
        {/* 필터 필드들 */}
        {filterFields.map((field, index) => renderFilterField(field, index))}
        
        {/* 검색 및 초기화 버튼 */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Box className="search-actions">
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              className="search-button"
            >
              검색
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<UndoIcon />}
              className="reset-button"
            >
              초기화
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchFilter;
