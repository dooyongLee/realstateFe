/**
 * 모달 컴포넌트 (Modal.jsx)
 * 
 * 이 컴포넌트는 부동산 관리 시스템의 재사용 가능한 모달 다이얼로그를 제공합니다.
 * 오버레이 클릭 시 닫기, 이벤트 버블링 방지, 반응형 디자인을 지원합니다.
 * 
 * 주요 기능:
 * - 재사용 가능한 모달 다이얼로그
 * - 오버레이 클릭 시 자동 닫기
 * - 모달 내부 클릭 시 이벤트 버블링 방지
 * - 반응형 디자인 지원
 * - 커스터마이징 가능한 스타일링
 * 
 * 비즈니스 규칙:
 * - 모달이 열려있지 않으면 렌더링하지 않음
 * - 오버레이 클릭 시 모달 닫기
 * - 모달 내부 클릭 시 닫히지 않음 (이벤트 버블링 방지)
 * - 모달은 화면 중앙에 표시
 * - 최소 크기 보장 (300px 너비, 100px 높이)
 * 
 * 데이터 형식:
 * - 열림 상태: boolean (true: 열림, false: 닫힘)
 * - 닫기 핸들러: Function
 * - 자식 컴포넌트: React.ReactNode
 * 
 * 사용 예시:
 * 1. 구독 상세 정보 표시
 * 2. 사용자 정보 편집
 * 3. 확인/경고 메시지 표시
 * 4. 폼 입력 다이얼로그
 */

import React from "react";
import "./Modal.css";

/**
 * 모달 컴포넌트
 * 
 * 이 컴포넌트는 재사용 가능한 모달 다이얼로그를 제공합니다.
 * 오버레이 클릭 시 닫기 기능과 이벤트 버블링 방지를 포함하며,
 * 자식 컴포넌트를 모달 내부에 렌더링합니다.
 * 
 * 컴포넌트 구조:
 * Modal
 * ├── Overlay (배경, 클릭 시 닫기)
 * └── Modal Container (내용, 클릭 시 이벤트 버블링 방지)
 *     └── Children (사용자 정의 내용)
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {boolean} props.isOpen - 모달 열림/닫힘 상태
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {React.ReactNode} props.children - 모달 내부에 렌더링할 자식 컴포넌트들
 * @returns {JSX.Element|null} 모달 UI 또는 null (닫힌 상태)
 * 
 * 사용 예시:
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * 
 * <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
 *   <h2>모달 제목</h2>
 *   <p>모달 내용...</p>
 *   <button onClick={() => setIsModalOpen(false)}>닫기</button>
 * </Modal>
 */
const Modal = ({ isOpen, onClose, children }) => {
  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;
  
  return (
    <div className="app-modal-overlay" onClick={onClose}>
      {/* 
        모달 컨테이너 - 이벤트 버블링 방지
        onClick={e => e.stopPropagation()}로 오버레이 클릭 이벤트가
        상위로 전파되는 것을 막아 모달 내부 클릭 시 닫히지 않도록 함
      */}
      <div className="app-modal-box" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal; 