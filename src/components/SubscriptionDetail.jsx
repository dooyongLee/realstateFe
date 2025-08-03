import React from "react";

export default function SubscriptionDetail({ subscription, onClose }) {
  if (!subscription) return null;
  return (
    <div style={{ padding: 16 }}>
      <h4>구독 상세</h4>
      <div>구독자: {subscription.agencyName || subscription.agencyId}</div>
      <div>플랜명: {subscription.planName || subscription.planId || subscription.overview?.planName}</div>
      <div>시작일: {subscription.startDate}</div>
      <div>종료일: {subscription.endDate}</div>
      <div>상태: {subscription.active ? "활성" : "비활성"}</div>
      {subscription.overview && (
        <div style={{ marginTop: 16, padding: 8, background: '#f7f7f7', borderRadius: 4 }}>
          <div><b>플랜 요약</b></div>
          <div>플랜명: {subscription.overview.planName}</div>
          <div>최대 사용자 수: {subscription.overview.maxUsers}</div>
          <div>현재 에이전트 수: {subscription.overview.currentAgentCount}</div>
          <div>초과 여부: {subscription.overview.isOverLimit ? '초과' : '정상'}</div>
        </div>
      )}
      <button onClick={onClose}>닫기</button>
    </div>
  );
} 