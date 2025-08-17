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

/**
 * 모달 오버레이 스타일
 * 
 * 모달의 배경 오버레이를 정의하는 스타일 객체입니다.
 * 전체 화면을 덮고 모달을 중앙에 배치하는 역할을 합니다.
 * 
 * 스타일 속성:
 * - position: fixed - 뷰포트 기준 고정 위치
 * - top, left: 0 - 화면 좌상단에 배치
 * - width, height: 100vw, 100vh - 전체 화면 크기
 * - background: rgba(0,0,0,0.3) - 반투명 검은색 배경
 * - display: flex - 플렉스박스 레이아웃
 * - alignItems, justifyContent: center - 수직/수평 중앙 정렬
 * - zIndex: 1000 - 다른 요소들 위에 표시
 * 
 * @type {Object}
 */
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

/**
 * 모달 컨테이너 스타일
 * 
 * 모달의 실제 내용을 담는 컨테이너의 스타일을 정의합니다.
 * 흰색 배경, 둥근 모서리, 그림자 효과를 포함합니다.
 * 
 * 스타일 속성:
 * - background: #fff - 흰색 배경
 * - padding: 2rem - 내부 여백
 * - borderRadius: 8 - 둥근 모서리
 * - minWidth, minHeight - 최소 크기 보장
 * - boxShadow - 그림자 효과
 * 
 * @type {Object}
 */
const modalStyle = {
  background: "#fff",
  padding: "2rem",
  borderRadius: 8,
  minWidth: 300,
  minHeight: 100,
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
};

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
    <div style={overlayStyle} onClick={onClose}>
      {/* 
        모달 컨테이너 - 이벤트 버블링 방지
        onClick={e => e.stopPropagation()}로 오버레이 클릭 이벤트가
        상위로 전파되는 것을 막아 모달 내부 클릭 시 닫히지 않도록 함
      */}
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal; 