import { formatDate, formatRelativeTime } from './formatDate';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// 매물 타입 옵션
export const PROPERTY_TYPE_OPTIONS = [
  { value: "APARTMENT", label: "아파트" },
  { value: "VILLA", label: "빌라" },
  { value: "HOUSE", label: "단독주택" },
  { value: "OFFICETEL", label: "오피스텔" },
  { value: "COMMERCIAL", label: "상가" },
  { value: "LAND", label: "토지" },
];

// 거래 타입 옵션
export const DEAL_TYPE_OPTIONS = [
  { value: "SALE", label: "매매" },
  { value: "RENT", label: "전세" },
  { value: "MONTHLY_RENT", label: "월세" },
];

// 상태 옵션
export const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "거래가능" },
  { value: "RESERVED", label: "예약중" },
  { value: "SOLD", label: "거래완료" },
  { value: "UNAVAILABLE", label: "거래불가" },
];

// 검색 타입 옵션
export const SEARCH_TYPE_OPTIONS = [
  { value: "keyword", label: "통합검색" },
  { value: "title", label: "제목" },
  { value: "address", label: "주소" },
];

// 매물 타입 라벨 변환 함수
export const getPropertyTypeLabel = (propertyType) => {
  const propertyTypeMap = {
    APARTMENT: "아파트",
    VILLA: "빌라",
    HOUSE: "단독주택",
    OFFICETEL: "오피스텔",
    COMMERCIAL: "상가",
    LAND: "토지"
  };
  return propertyTypeMap[propertyType] || propertyType;
};

// 거래 타입 라벨 변환 함수
export const getDealTypeLabel = (dealType) => {
  const dealTypeMap = {
    SALE: "매매",
    RENT: "전세",
    MONTHLY_RENT: "월세"
  };
  return dealTypeMap[dealType] || dealType;
};

// 상태 라벨 변환 함수
export const getStatusLabel = (status) => {
  const statusMap = {
    AVAILABLE: "거래가능",
    RESERVED: "예약중",
    SOLD: "거래완료",
    UNAVAILABLE: "거래불가"
  };
  return statusMap[status] || status;
};

// 가격 포맷 함수
export const formatPrice = (price) => {
  if (!price || price === 0) return "-";
  return new Intl.NumberFormat('ko-KR').format(price) + "원";
};

// 면적 포맷 함수
export const formatArea = (area) => {
  if (!area || area === 0) return "-";
  return `${area}㎡`;
};

// 매물 데이터 검증 함수
export const validatePropertyData = (data) => {
  const errors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = '매물 제목을 입력해주세요.';
  }

  if (!data.propertyType) {
    errors.propertyType = '매물 타입을 선택해주세요.';
  }

  if (!data.dealType) {
    errors.dealType = '거래 타입을 선택해주세요.';
  }

  if (!data.address || data.address.trim() === '') {
    errors.address = '주소를 입력해주세요.';
  }

  if (data.area !== null && data.area !== undefined && data.area <= 0) {
    errors.area = '면적은 0보다 커야 합니다.';
  }

  if (data.price !== null && data.price !== undefined && data.price < 0) {
    errors.price = '가격은 0 이상이어야 합니다.';
  }

  if (data.deposit !== null && data.deposit !== undefined && data.deposit < 0) {
    errors.deposit = '보증금은 0 이상이어야 합니다.';
  }

  if (data.rent !== null && data.rent !== undefined && data.rent < 0) {
    errors.rent = '월세는 0 이상이어야 합니다.';
  }

  return errors;
};

// 초기 매물 데이터
export const getInitialPropertyData = () => ({
  title: '',
  propertyType: '',
  dealType: '',
  address: '',
  latitude: null,
  longitude: null,
  area: null,
  price: null,
  deposit: null,
  rent: null,
  status: 'AVAILABLE',
  isActive: true
});

// columns: handleEdit, handleRowClick를 인자로 받는 함수로 export
export const columns = (handleEdit, handleRowClick, handleViewDetail) => [
  { 
    field: "title", 
    headerName: "제목", 
    width: 200,
    renderCell: (params) => (
      <div 
        style={{ 
          cursor: 'pointer', 
          color: '#1976d2',
          fontWeight: 600,
          textDecoration: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            textDecoration: 'underline'
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleRowClick(params.row);
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(25, 118, 210, 0.1)';
          e.target.style.textDecoration = 'underline';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.textDecoration = 'none';
        }}
      >
        {params.value}
      </div>
    )
  },
  { 
    field: "propertyType", 
    headerName: "매물타입", 
    width: 120,
    renderCell: (params) => getPropertyTypeLabel(params.value)
  },
  { 
    field: "dealType", 
    headerName: "거래타입", 
    width: 100,
    renderCell: (params) => getDealTypeLabel(params.value)
  },
  { 
    field: "address", 
    headerName: "주소", 
    width: 250,
    renderCell: (params) => (
      <div style={{ 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap',
        maxWidth: 240
      }}>
        {params.value}
      </div>
    )
  },
  { 
    field: "area", 
    headerName: "면적", 
    width: 100,
    renderCell: (params) => formatArea(params.value)
  },
  { 
    field: "price", 
    headerName: "가격", 
    width: 120,
    renderCell: (params) => formatPrice(params.value)
  },
  { 
    field: "deposit", 
    headerName: "보증금", 
    width: 120,
    renderCell: (params) => formatPrice(params.value)
  },
  { 
    field: "rent", 
    headerName: "월세", 
    width: 120,
    renderCell: (params) => formatPrice(params.value)
  },
  { 
    field: "status", 
    headerName: "상태", 
    width: 120,
    renderCell: (params) => {
      const getStatusConfig = (status) => {
        switch (status) {
          case 'AVAILABLE':
            return {
              bg: '#e8f5e8',
              color: '#2e7d32',
              border: '#4caf50',
              icon: '✓'
            };
          case 'RESERVED':
            return {
              bg: '#fff3e0',
              color: '#f57c00',
              border: '#ff9800',
              icon: '⏳'
            };
          case 'SOLD':
            return {
              bg: '#e3f2fd',
              color: '#1976d2',
              border: '#2196f3',
              icon: '🏠'
            };
          case 'UNAVAILABLE':
            return {
              bg: '#ffebee',
              color: '#d32f2f',
              border: '#f44336',
              icon: '❌'
            };
          default:
            return {
              bg: '#f5f5f5',
              color: '#757575',
              border: '#9e9e9e',
              icon: '❓'
            };
        }
      };

      const config = getStatusConfig(params.value);
      
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: config.bg,
            color: config.color,
            border: `2px solid ${config.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease-in-out',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          >
            <span style={{ fontSize: '14px' }}>{config.icon}</span>
            {getStatusLabel(params.value)}
          </span>
        </div>
      );
    }
  },
  { 
    field: "createdAt", 
    headerName: "등록일", 
    width: 140,
    renderCell: (params) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 500, fontSize: '12px' }}>
          {formatDate(params.value)}
        </span>
        <span style={{ fontSize: '10px', color: '#666' }}>
          {formatRelativeTime(params.value)}
        </span>
      </div>
    )
  },
  {
    field: "actions",
    headerName: "액션",
    width: 140,
    sortable: false,
    renderCell: (params) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <Tooltip title="상세보기">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(params.row);
            }}
            size="small"
            sx={{
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="편집">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row);
            }}
            size="small"
            sx={{
              color: '#2e7d32',
              '&:hover': {
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    )
  }
]; 