import React, { useState } from "react";
import SubscriptionPlanList from "../../components/SubscriptionPlanList";
import SubscriptionList from "../../components/SubscriptionList";

export default function SubscriptionManage() {
  const [tab, setTab] = useState("plans");
  return (
    <div>
      <h3>구독 관리</h3>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setTab("plans")} style={{ marginRight: 8, fontWeight: tab === "plans" ? "bold" : "normal" }}>구독 플랜</button>
        <button onClick={() => setTab("subs")} style={{ fontWeight: tab === "subs" ? "bold" : "normal" }}>구독 내역/상태</button>
      </div>
      {tab === "plans" ? <SubscriptionPlanList /> : <SubscriptionList />}
    </div>
  );
} 