import React, { useEffect, useState } from "react";
import { getAllSubscriptions, activateSubscription, deactivateSubscription, extendSubscription, getSubscriptionDetail, deleteSubscription } from "../api/subscription";
import SubscriptionDetail from "./SubscriptionDetail";

export default function SubscriptionList() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extendDate, setExtendDate] = useState({});
  const [showDetail, setShowDetail] = useState(false);
  const [detailSub, setDetailSub] = useState(null);

  const fetchSubs = () => {
    setLoading(true);
    getAllSubscriptions()
      .then(setSubs)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleActivate = async (id) => {
    await activateSubscription(id);
    fetchSubs();
  };
  const handleDeactivate = async (id) => {
    await deactivateSubscription(id);
    fetchSubs();
  };
  const handleExtend = async (id) => {
    if (!extendDate[id]) return;
    await extendSubscription(id, extendDate[id]);
    setExtendDate({ ...extendDate, [id]: "" });
    fetchSubs();
  };
  const handleDetail = async (id) => {
    const sub = await getSubscriptionDetail(id);
    setDetailSub(sub);
    setShowDetail(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deleteSubscription(id);
      fetchSubs();
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div>
      <h4>구독 내역/상태</h4>
      <table>
        <thead>
          <tr>
            <th>구독자</th>
            <th>플랜명</th>
            <th>시작일</th>
            <th>종료일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {subs.map(sub => (
            <tr key={sub.id}>
              <td>{sub.agencyName || sub.agencyId}</td>
              <td>{sub.planName || sub.planId}</td>
              <td>{sub.startDate}</td>
              <td>{sub.endDate}</td>
              <td>{sub.active ? "활성" : "비활성"}</td>
              <td>
                {sub.active ? (
                  <button onClick={() => handleDeactivate(sub.id)}>비활성화</button>
                ) : (
                  <button onClick={() => handleActivate(sub.id)}>활성화</button>
                )}
                <input
                  type="date"
                  value={extendDate[sub.id] || ""}
                  onChange={e => setExtendDate({ ...extendDate, [sub.id]: e.target.value })}
                  style={{ marginLeft: 8 }}
                />
                <button onClick={() => handleExtend(sub.id)} style={{ marginLeft: 4 }}>연장</button>
                <button onClick={() => handleDetail(sub.id)} style={{ marginLeft: 8 }}>상세</button>
                <button onClick={() => handleDelete(sub.id)} style={{ marginLeft: 4 }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showDetail && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
            <SubscriptionDetail subscription={detailSub} onClose={() => setShowDetail(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 