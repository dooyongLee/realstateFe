import React from "react";

export default function SubscriptionPlanDetail({ plan, onClose }) {
  if (!plan) return null;
  return (
    <div style={{ padding: 16 }}>
      <h4>플랜 상세</h4>
      <div>플랜명: {plan.name}</div>
      <div>가격: {plan.price}</div>
      <div>설명: {plan.description}</div>
      <button onClick={onClose}>닫기</button>
    </div>
  );
} 