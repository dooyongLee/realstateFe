/**
 * 구독 관리 페이지 (SubscriptionsManage.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 구독 관리를 담당합니다.
 * 관리자(ADMIN) 권한을 가진 사용자만 접근 가능하며, 모든 에이전시의 구독 현황을
 * 조회, 관리할 수 있습니다.
 * 
 * 주요 기능:
 * - 전체 에이전시 구독 현황 조회
 * - 구독 상태별 필터링 및 검색
 * - 구독 통계 대시보드
 * - 일괄 구독 관리 (활성화/비활성화)
 * - 구독 상세 정보 모달
 * - 엑셀 다운로드 (예정)
 * 
 * 비즈니스 규칙:
 * - ADMIN 권한만 접근 가능
 * - 구독 상태: ACTIVE(활성), EXPIRED(만료), INACTIVE(비활성), NONE(구독 없음)
 * - 플랜 타입: FREE, STANDARD, PREMIUM
 * - 사용자 수 제한 및 초과 여부 확인
 * 
 * 데이터 형식:
 * - 구독 정보: id, agencyId, agencyName, planName, planType, maxUsers, currentUsers, price, status, startDate, endDate, isManualActive
 * - 사용자 정보: id, email, name, role, agencyId
 * - 통계 정보: 총 구독 수, 활성 구독 수, 총 사용자 수, 총 수익, 만료/비활성 수
 * 
 * 사용 예시:
 * 1. 관리자가 로그인 후 구독 관리 페이지 접근
 * 2. 상단 통계 카드에서 전체 현황 확인
 * 3. 검색/필터 기능으로 특정 에이전시 또는 상태별 조회
 * 4. 테이블에서 구독 정보 확인 및 상세 모달 열기
 * 5. 일괄 선택 후 활성화/비활성화 작업 수행
 */

/**
 * 구독 관리 페이지 (SubscriptionsManage.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 구독 관리를 담당합니다.
 * 관리자(ADMIN) 권한을 가진 사용자만 접근 가능하며, 모든 에이전시의 구독 현황을
 * 조회, 관리할 수 있습니다.
 * 
 * 주요 기능:
 * - 전체 에이전시 구독 현황 조회
 * - 구독 상태별 필터링 및 검색
 * - 구독 통계 대시보드
 * - 일괄 구독 관리 (활성화/비활성화)
 * - 구독 상세 정보 모달
 * - 엑셀 다운로드 (예정)
 * 
 * 비즈니스 규칙:
 * - ADMIN 권한만 접근 가능
 * - 구독 상태: ACTIVE(활성), EXPIRED(만료), INACTIVE(비활성), NONE(구독 없음)
 * - 플랜 타입: FREE, STANDARD, PREMIUM
 * - 사용자 수 제한 및 초과 여부 확인
 * 
 * 데이터 형식:
 * - 구독 정보: id, agencyId, agencyName, planName, planType, maxUsers, currentUsers, price, status, startDate, endDate, isManualActive
 * - 사용자 정보: id, email, name, role, agencyId
 * - 통계 정보: 총 구독 수, 활성 구독 수, 총 사용자 수, 총 수익, 만료/비활성 수
 * 
 * 사용 예시:
 * 1. 관리자가 로그인 후 구독 관리 페이지 접근
 * 2. 상단 통계 카드에서 전체 현황 확인
 * 3. 검색/필터 기능으로 특정 에이전시 또는 상태별 조회
 * 4. 테이블에서 구독 정보 확인 및 상세 모달 열기
 * 5. 일괄 선택 후 활성화/비활성화 작업 수행
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import AdminMainLayout from "../../components/AdminMainLayout";
import apiClient from "../../api/apiClient";
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/userUtils";
import MenuItem from '@mui/material/MenuItem';
import { FaFileExcel } from 'react-icons/fa';
import { getAllSubscriptions, getAllAgencyUserCounts } from "../../api/subscription";
import { useAuth } from "../../App";
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import StatsCard from '../../components/cards/StatsCard';
import SearchFilter from '../../components/common/SearchFilter';
import DataGrid from '../../components/common/DataGrid';

/**
 * 구독 상태 매핑 객체
 * 각 상태별로 표시할 라벨과 색상을 정의
 * 
 * @type {Object}
 * @property {Object} ACTIVE - 활성 상태 (초록색)
 * @property {Object} EXPIRED - 만료 상태 (주황색)
 * @property {Object} INACTIVE - 비활성 상태 (빨간색)
 * @property {Object} NONE - 구독 없음 상태 (기본색)
 */
const statusMap = {
  ACTIVE: { label: '활성', color: 'success' },
  EXPIRED: { label: '만료', color: 'warning' },
  INACTIVE: { label: '비활성', color: 'error' },
  NONE: { label: '구독 없음', color: 'default' }
};

/**
 * 구독 상태 필터 옵션
 * 검색/필터 드롭다운에서 사용할 옵션 목록
 * 
 * @type {Array<Object>}
 * @property {string} value - API에서 사용하는 상태 값
 * @property {string} label - 사용자에게 표시할 라벨
 */
const statusOptions = [
  { value: '', label: '전체' },
  { value: 'ACTIVE', label: '활성' },
  { value: 'EXPIRED', label: '만료' },
  { value: 'INACTIVE', label: '비활성' },
  { value: 'NONE', label: '구독 없음' }
];

/**
 * 에이전시 관련 역할 상수
 * 에이전시 사용자를 식별하기 위한 역할 목록
 * 
 * @type {Array<string>}
 */
const AGENCY_ROLES = ['AGENT', 'AGENCY', 'AGENCY_LEADER'];

/**
 * 구독 관리 메인 컴포넌트
 * 
 * @returns {JSX.Element} 구독 관리 페이지 UI
 */
const SubscriptionsManage = () => {
  // 인증 정보 가져오기
  const { user } = useAuth();
  
  /**
   * 전체 사용자 목록 상태
   * 에이전시 사용자 필터링을 위해 사용
   * 
   * @type {Array<Object>} 사용자 정보 배열
   * @property {string} id - 사용자 고유 ID
   * @property {string} email - 사용자 이메일
   * @property {string} name - 사용자 이름
   * @property {string} role - 사용자 역할
   * @property {string} agencyId - 소속 에이전시 ID
   */
  const [usersOrigin, setUsersOrigin] = useState([]);
  
  /**
   * 에이전시별 사용자 수 상태
   * 각 에이전시의 현재 사용자 수를 저장
   * 
   * @type {Object} 에이전시 ID를 키로 하는 사용자 수 객체
   */
  const [agencyUserCounts, setAgencyUserCounts] = useState({});
  
  /**
   * 전체 사용자 목록 조회
   * 컴포넌트 마운트 시 한 번만 실행
   * 
   * API 엔드포인트: /api/users/page
   * 요청 파라미터: page=0, size=10000 (전체 조회)
   * 
   * 응답 데이터 형식:
   * {
   *   data: {
   *     content: [
   *       {
   *         id: number,
   *         email: string,
   *         name: string,
   *         role: string,
   *         agencyId: string
   *       }
   *     ]
   *   }
   * }
   */
  useEffect(() => {
    apiClient.get("/api/users/page", { params: { page: 0, size: 10000 } })
      .then(res => {
        // 응답 데이터를 컴포넌트에서 사용할 수 있도록 변환
        // id가 없는 경우 email이나 인덱스를 사용하여 고유 ID 생성
        setUsersOrigin((res.data.data.content || []).map((user, idx) => ({
          ...user,
          id: String(user.id || user.email || `row_${idx}`)
        })));
      });
  }, []);

  /**
   * 구독 목록 상태
   * 현재 페이지에 표시할 구독 정보 배열
   * 
   * @type {Array<Object>} 구독 정보 배열
   * @property {string} id - 구독 고유 ID
   * @property {string} agencyId - 에이전시 ID
   * @property {string} agencyName - 에이전시명
   * @property {string} planName - 플랜명
   * @property {string} planType - 플랜 타입 (FREE/STANDARD/PREMIUM)
   * @property {number} maxUsers - 최대 사용자 수
   * @property {number} currentUsers - 현재 사용자 수
   * @property {number} price - 구독료
   * @property {string} status - 구독 상태
   * @property {string} startDate - 시작일
   * @property {string} endDate - 만료일
   * @property {boolean} isManualActive - 수동 활성화 여부
   * @property {boolean} isOverLimit - 사용자 수 초과 여부
   */
  const [subs, setSubs] = useState([]);
  
  /**
   * 로딩 상태
   * 데이터 조회 중일 때 true
   * 
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);
  
  /**
   * 에이전시 검색어 상태
   * 에이전시명 또는 ID로 검색할 때 사용
   * 
   * @type {string}
   */
  const [searchAgency, setSearchAgency] = useState("");
  
  /**
   * 구독 상태 필터 상태
   * 특정 구독 상태로 필터링할 때 사용
   * 
   * @type {string}
   */
  const [searchStatus, setSearchStatus] = useState("");
  
  /**
   * 현재 페이지 번호
   * 페이지네이션에서 사용 (1부터 시작)
   * 
   * @type {number}
   */
  const [page, setPage] = useState(1);
  
  /**
   * 페이지당 표시할 행 수
   * 페이지네이션에서 사용
   * 
   * @type {number}
   */
  const [pageSize, setPageSize] = useState(10);
  
  /**
   * 전체 데이터 수
   * 페이지네이션 계산에 사용
   * 
   * @type {number}
   */
  const [total, setTotal] = useState(0);
  
  /**
   * 알림 상태
   * 사용자에게 메시지를 표시할 때 사용
   * 
   * @type {Object}
   * @property {boolean} open - 알림 표시 여부
   * @property {string} message - 알림 메시지
   * @property {string} severity - 알림 타입 (info/success/warning/error)
   */
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  
  /**
   * 선택된 구독 ID 배열
   * 일괄 작업을 위해 선택된 구독들의 ID를 저장
   * 
   * @type {Array<string>}
   */
  const [selected, setSelected] = useState([]);
  
  /**
   * 상세 모달 열림 상태
   * 구독 상세 정보 모달의 표시 여부
   * 
   * @type {boolean}
   */
  const [detailOpen, setDetailOpen] = useState(false);
  
  /**
   * 상세 모달에 표시할 구독 정보
   * 선택된 구독의 상세 정보를 저장
   * 
   * @type {Object|null}
   */
  const [detailSub, setDetailSub] = useState(null);

  /**
   * 전체 선택/해제 핸들러
   * 현재 페이지의 모든 구독을 선택하거나 해제
   * 
   * @param {Event} event - 체크박스 이벤트 객체
   */
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // 현재 페이지의 모든 구독 ID를 선택 배열에 추가
      const newSelected = subs.slice((page - 1) * pageSize, page * pageSize).map((sub) => sub.id);
      setSelected(newSelected);
    } else {
      // 모든 선택 해제
      setSelected([]);
    }
  };

  /**
   * 개별 행 선택/해제 핸들러
   * 특정 구독을 선택하거나 해제
   * 
   * @param {string} id - 선택/해제할 구독의 ID
   */
  const handleSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      // 선택되지 않은 경우: 선택 배열에 추가
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      // 첫 번째 항목인 경우: 첫 번째 항목 제거
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      // 마지막 항목인 경우: 마지막 항목 제거
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      // 중간 항목인 경우: 해당 항목만 제거
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  /**
   * 구독 선택 여부 확인
   * 특정 구독이 현재 선택되어 있는지 확인
   * 
   * @param {string} id - 확인할 구독의 ID
   * @returns {boolean} 선택 여부
   */
  const isSelected = (id) => selected.indexOf(id) !== -1;

  /**
   * 에이전시 사용자 목록
   * 전체 사용자 중 에이전시 관련 역할을 가진 사용자만 필터링
   * 
   * @type {Array<Object>} 에이전시 사용자 배열
   */
  const agencyUsers = useMemo(() => usersOrigin.filter(u => u.agencyId && AGENCY_ROLES.includes(u.role)), [usersOrigin]);

  /**
   * 구독 데이터 조회 함수
   * 사용자 권한에 따라 다른 API를 호출하여 구독 정보를 가져옴
   * 
   * 비즈니스 로직:
   * - ADMIN 권한: 전체 구독 목록 API 호출
   * - 기타 권한: 에이전시별 개별 API 호출
   * 
   * API 엔드포인트:
   * - ADMIN: getAllSubscriptions() (전체 구독 목록)
   * - 기타: /api/subscription-management/agency/{agencyId}/status (에이전시별 구독 상태)
   * 
   * @returns {Promise<void>}
   */
  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      let results = [];
      if (user?.role === 'ADMIN') {
        // ADMIN 권한: 전체 구독 목록 조회
        const allSubs = await getAllSubscriptions();
        results = (allSubs || []).map(sub => {
          return {
            id: sub.id,
            agencyId: sub.agencyId,
            agencyName: sub.agencyName,
            planName: sub.planName || '알 수 없음',
            planType: sub.planType || 'UNKNOWN',
            maxUsers: sub.maxUsers || 0,
            currentUsers: sub.currentAgentCount || 0,
            price: sub.price || 0,
            // 수동 활성화 여부와 만료일을 비교하여 상태 결정
            status: sub.isManualActive ? (new Date(sub.endDate) < new Date() ? 'EXPIRED' : 'ACTIVE') : 'INACTIVE',
            startDate: sub.startDate,
            endDate: sub.endDate,
            isManualActive: sub.isManualActive,
            isOverLimit: sub.isOverLimit
          };
        });
      } else {
        // 기타 권한: 에이전시별 개별 조회
        results = await Promise.all(
          agencyUsers.map(async (user) => {
            try {
              const res = await apiClient.get(`/api/subscription-management/agency/${user.agencyId}/status`);
              return {
                agencyId: user.agencyId,
                agencyName: user.name,
                planName: res.data.data.planName || '-',
                planType: res.data.data.planType || '-',
                maxUsers: res.data.data.maxUsers || 0,
                currentUsers: res.data.data.currentAgentCount || agencyUserCounts[user.agencyId] || 0,
                price: res.data.data.price || 0,
                status: res.data.data.status || 'NONE',
                startDate: res.data.data.startDate,
                endDate: res.data.data.endDate,
                isManualActive: res.data.data.isManualActive
              };
            } catch (err) {
              // API 호출 실패 시 기본값 반환
              return {
                agencyId: user.agencyId,
                agencyName: user.name,
                planName: '-',
                planType: '-',
                maxUsers: 0,
                currentUsers: 0,
                price: 0,
                status: 'NONE',
                startDate: null,
                endDate: null,
                isManualActive: false
              };
            }
          })
        );
      }
      
      // 검색 및 필터링 적용
      let filtered = results;
      
      // 에이전시명 또는 ID로 검색
      if (searchAgency) {
        const kw = searchAgency.toLowerCase();
        filtered = filtered.filter(sub => 
          String(sub.agencyName).toLowerCase().includes(kw) || 
          String(sub.agencyId).includes(kw)
        );
      }
      
      // 구독 상태로 필터링
      if (searchStatus) {
        filtered = filtered.filter(sub => sub.status === searchStatus);
      }
      
      // 페이지네이션 적용
      setTotal(filtered.length);
      setSubs(filtered.slice((page - 1) * pageSize, (page) * pageSize));
    } catch (e) {
      // 에러 발생 시 빈 배열로 초기화
      setSubs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user, agencyUsers, searchAgency, searchStatus, page, pageSize]);

  /**
   * 구독 데이터 조회 실행
   * 의존성 배열의 값이 변경될 때마다 실행
   */
  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  /**
   * 통계 카드 데이터
   * 상단에 표시할 구독 현황 통계를 계산
   * 
   * 계산 로직:
   * - 총 구독 수: 전체 구독 개수
   * - 활성 구독 수: ACTIVE 상태 구독 개수
   * - 총 사용자 수: 모든 구독의 현재 사용자 수 합계
   * - 사용률: (총 현재 사용자 수 / 총 최대 사용자 수) * 100
   * - 총 수익: 모든 구독의 가격 합계
   * - 만료/비활성 수: EXPIRED + INACTIVE 상태 구독 개수
   * 
   * @type {Array<Object>} 통계 카드 정보 배열
   * @property {string} label - 카드 제목
   * @property {string|number} value - 표시할 값
   * @property {string} color - 카드 색상
   * @property {string} subtitle - 부제목
   * @property {JSX.Element} icon - 아이콘
   * @property {string} avatarColor - 아바타 색상
   */
  const stats = useMemo(() => {
    const total = subs.length;
    const active = subs.filter(s => s.status === 'ACTIVE').length;
    const expired = subs.filter(s => s.status === 'EXPIRED').length;
    const inactive = subs.filter(s => s.status === 'INACTIVE').length;
    const none = subs.filter(s => s.status === 'NONE').length;
    
    // 사용량 통계 계산
    const totalMaxUsers = subs.reduce((sum, s) => sum + (s.maxUsers || 0), 0);
    const totalCurrentUsers = subs.reduce((sum, s) => sum + (s.currentUsers || 0), 0);
    const usageRate = totalMaxUsers > 0 ? Math.round((totalCurrentUsers / totalMaxUsers) * 100) : 0;
    
    // 수익 통계 계산
    const totalRevenue = subs.reduce((sum, s) => sum + (s.price || 0), 0);
    
    return [
      { 
        label: '총 구독', 
        value: total, 
        color: '#23408e', 
        subtitle: '전체 구독 수',
        icon: <PersonIcon fontSize="medium" />,
        avatarColor: '#23408e'
      },
      { 
        label: '활성 구독', 
        value: active, 
        color: '#10b981', 
        subtitle: '현재 활성',
        icon: <CheckCircleIcon fontSize="medium" />,
        avatarColor: '#10b981'
      },
      { 
        label: '총 사용자', 
        value: totalCurrentUsers, 
        color: '#1976d2', 
        subtitle: `${usageRate}% 사용률`,
        icon: <GroupIcon fontSize="medium" />,
        avatarColor: '#1976d2'
      },
      { 
        label: '총 수익', 
        value: `₩${totalRevenue.toLocaleString()}`, 
        color: '#f57c00', 
        subtitle: '월 구독료 합계',
        icon: <AttachMoneyIcon fontSize="medium" />,
        avatarColor: '#f57c00'
      },
      { 
        label: '만료/비활성', 
        value: expired + inactive, 
        color: '#ef4444', 
        subtitle: '관리 필요',
        icon: <WarningIcon fontSize="medium" />,
        avatarColor: '#ef4444'
      }
    ];
  }, [subs]);

  /**
   * 플랜 타입 매핑 객체
   * 플랜 타입별로 표시할 라벨과 색상을 정의
   * 
   * @type {Object}
   * @property {Object} FREE - 무료 플랜 (기본색)
   * @property {Object} STANDARD - 표준 플랜 (파란색)
   * @property {Object} PREMIUM - 프리미엄 플랜 (보라색)
   */
  const planTypeMap = {
    'FREE': { label: 'Free Plan', color: 'default' },
    'STANDARD': { label: 'Standard Plan', color: 'primary' },
    'PREMIUM': { label: 'Premium Plan', color: 'secondary' }
  };

  /**
   * 일괄 활성/비활성화 핸들러
   * 선택된 구독들을 일괄적으로 활성화하거나 비활성화
   * 
   * 현재는 데모 기능으로 구현되어 있음
   * 
   * @param {boolean} enabled - 활성화 여부 (true: 활성화, false: 비활성화)
   */
  const handleBatchStatus = (enabled) => {
    if (!selected.length) {
      setAlert({ open: true, message: '선택된 구독이 없습니다.', severity: 'warning' });
      return;
    }
    setAlert({ open: true, message: `일괄 ${enabled ? '활성화' : '비활성화'}는 데모입니다.`, severity: 'info' });
  };

  /**
   * 엑셀 다운로드 핸들러
   * 현재 구독 목록을 엑셀 파일로 다운로드
   * 
   * 현재는 데모 기능으로 구현되어 있음
   */
  const handleExcelDownload = () => {
    setAlert({ open: true, message: '엑셀 다운로드 기능은 아직 구현되지 않았습니다.', severity: 'info' });
  };

  /**
   * 행 클릭 핸들러
   * 테이블 행을 클릭했을 때 상세 모달을 열기
   * 
   * @param {Object} row - 클릭된 구독 정보
   */
  const handleRowClick = (row) => {
    setDetailSub(row);
    setDetailOpen(true);
  };
  
  /**
   * 상세 모달 닫기 핸들러
   * 상세 모달을 닫고 상태를 초기화
   */
  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailSub(null);
  };

  /**
   * 검색 실행 핸들러
   * 공통 검색 컴포넌트에서 호출되는 검색 함수
   * 
   * @param {Object} searchValues - 검색 조건 값들
   */
  const handleSearch = (searchValues) => {
    setSearchAgency(searchValues.searchAgency || "");
    setSearchStatus(searchValues.searchStatus || "");
    setPage(1);
    fetchSubs();
  };

  /**
   * 검색 필터 초기화 핸들러
   * 공통 검색 컴포넌트에서 호출되는 초기화 함수
   * 
   * @param {Object} resetValues - 초기화된 검색 값들
   */
  const handleResetFilters = (resetValues) => {
    setSearchAgency(resetValues.searchAgency || "");
    setSearchStatus(resetValues.searchStatus || "");
    setPage(1);
    fetchSubs();
  };

  /**
   * 구독 연장 핸들러
   * 특정 구독의 연장 작업을 수행
   * 
   * 현재는 확인 메시지만 표시하고 실제 API 호출은 구현되지 않음
   * 
   * @param {Object} subscription - 연장할 구독 정보
   */
  const handleExtendSubscription = (subscription) => {
    setAlert({ 
      open: true, 
      message: `${subscription.agencyName}의 구독을 연장하시겠습니까?`, 
      severity: 'info' 
    });
    // TODO: 실제 연장 API 호출 구현 필요
    console.log('구독 연장:', subscription);
  };

  // 공통 그리드 컬럼 설정
  const columns = [
    {
      field: 'agencyName',
      headerName: '에이전시명',
      width: 200,
      renderCell: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
          {value}
        </Typography>
      )
    },
    {
      field: 'planType',
      headerName: '플랜 타입',
      width: 150,
      renderCell: (value) => {
        const info = planTypeMap[value] || { label: value, color: 'default' };
        return <Chip label={info.label} color={info.color} size='small' variant="outlined" />;
      }
    },
    {
      field: 'maxUsers',
      headerName: '최대 사용자',
      width: 120,
      renderCell: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center' }}>
          {value || 0}
        </Typography>
      )
    },
    {
      field: 'currentUsers',
      headerName: '현재 사용자',
      width: 120,
      renderCell: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'center' }}>
          {value || 0}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: '구독 상태',
      width: 120,
      renderCell: (value) => {
        const info = statusMap[value] || { label: value, color: 'default' };
        return <Chip label={info.label} color={info.color} size='small' />;
      }
    },
    {
      field: 'startDate',
      headerName: '시작일',
      width: 120,
      renderCell: (value) => value ? formatDate(value) : '-'
    },
    {
      field: 'endDate',
      headerName: '만료일',
      width: 120,
      renderCell: (value) => value ? formatDate(value) : '-'
    },
    {
      field: 'extend',
      headerName: '액션',
      width: 100,
      renderCell: (value, row) => (
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleExtendSubscription(row);
          }}
          sx={{ minWidth: 80 }}
        >
          연장
        </Button>
      )
    }
  ];

  /**
   * 권한 확인
   * ADMIN 권한이 없는 경우 접근 제한 메시지 표시
   */
  if (!user || user.role !== 'ADMIN') {
    return (
      <AdminMainLayout title="구독 관리">
        <div style={{ padding: 40, textAlign: 'center', color: '#d32f2f', fontSize: 20 }}>
          권한이 없습니다.
        </div>
      </AdminMainLayout>
    );
  }

  return (
    <AdminMainLayout title="구독 관리" description="에이전시 구독 현황을 확인할 수 있습니다.">
      {/* 상단 통계 카드 섹션 */}
      <StatsCard stats={stats} />
      
      {/* 검색 및 필터 섹션 */}
      <SearchFilter
        searchFields={[
          {
            type: 'text',
            key: 'searchAgency',
            placeholder: '에이전시명, ID 검색'
          }
        ]}
        filterFields={[
          {
            key: 'searchStatus',
            label: '구독상태',
            options: statusOptions
          }
        ]}
        searchValues={{
          searchAgency: searchAgency,
          searchStatus: searchStatus
        }}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />
      
      {/* 액션 버튼 섹션 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* 선택된 항목 수 표시 */}
        {selected.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            {selected.length}개 선택됨
          </Typography>
        )}
        
        {/* 엑셀 다운로드 버튼 */}
        <Button
          variant="outlined"
          startIcon={<FaFileExcel />}
          onClick={handleExcelDownload}
          sx={{ minWidth: 120 }}
        >
          엑셀 다운로드
        </Button>
        
        {/* 일괄 활성화 버튼 */}
        <Button
          variant="outlined"
          color="success"
          onClick={() => handleBatchStatus(true)}
          sx={{ minWidth: 120 }}
          disabled={selected.length === 0}
        >
          일괄 활성화
        </Button>
        
        {/* 일괄 비활성화 버튼 */}
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleBatchStatus(false)}
          sx={{ minWidth: 120 }}
          disabled={selected.length === 0}
        >
          일괄 비활성화
        </Button>
      </Box>
      
             {/* 공통 데이터 그리드 */}
       <DataGrid
         columns={columns}
         rows={subs}
         loading={loading}
         pagination={{
           page: page - 1,
           pageSize: pageSize,
           total: total
         }}
         selectedRows={selected}
         onRowClick={handleRowClick}
         onSelectionChange={setSelected}
         onPageChange={(newPage) => setPage(newPage + 1)}
         onPageSizeChange={(newPageSize) => {
           setPageSize(newPageSize);
                  setPage(1);
                }}
         selectable={true}
         clickable={true}
       />
      
      {/* 알림 메시지 */}
      {alert.open && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, minWidth: 300 }}
        >
          {alert.message}
        </Alert>
      )}
      
      {/* 구독 상세 정보 모달 */}
      <Modal
        open={detailOpen}
        onClose={handleDetailClose}
        title="구독 상세 정보"
        maxWidth="md"
      >
        {detailSub && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              {/* 에이전시명 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">에이전시명</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.agencyName}</Typography>
              </Grid>
              
              {/* 구독 플랜 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">구독 플랜</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.planName}</Typography>
              </Grid>
              
              {/* 플랜 타입 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">플랜 타입</Typography>
                <Box sx={{ mb: 2 }}>
                  {(() => {
                    const planTypeMap = {
                      'FREE': { label: 'Free Plan', color: 'default' },
                      'STANDARD': { label: 'Standard Plan', color: 'primary' },
                      'PREMIUM': { label: 'Premium Plan', color: 'secondary' }
                    };
                    const info = planTypeMap[detailSub.planType] || { label: detailSub.planType, color: 'default' };
                    return <Chip label={info.label} color={info.color} variant="outlined" />;
                  })()}
                </Box>
              </Grid>
              
              {/* 구독 상태 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">구독 상태</Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip label={statusMap[detailSub.status]?.label || detailSub.status} color={statusMap[detailSub.status]?.color || 'default'} />
                </Box>
              </Grid>
              
              {/* 최대 사용자 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">최대 사용자</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.maxUsers || 0}명</Typography>
              </Grid>
              
              {/* 현재 사용자 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">현재 사용자</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.currentUsers || 0}명</Typography>
              </Grid>
              
              {/* 가격 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">가격</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {!detailSub.price || detailSub.price === 0 ? '무료' : `₩${detailSub.price.toLocaleString()}`}
                </Typography>
              </Grid>
              
              {/* 시작일 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">시작일</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.startDate ? formatDate(detailSub.startDate) : '-'}</Typography>
              </Grid>
              
              {/* 만료일 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">만료일</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{detailSub.endDate ? formatDate(detailSub.endDate) : '-'}</Typography>
              </Grid>
              
              {/* 수동 활성화 여부 */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">수동 활성화</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {detailSub.isManualActive ? '활성화됨' : '비활성화됨'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Modal>
    </AdminMainLayout>
  );
};

export default SubscriptionsManage; 