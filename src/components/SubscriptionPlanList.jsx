import React, { useEffect, useState } from "react";
import { getAllPlans, createPlan, updatePlan, deletePlan, getPlanDetail } from "../api/subscription";
import SubscriptionPlanForm from "./SubscriptionPlanForm";
import SubscriptionPlanDetail from "./SubscriptionPlanDetail";

export default function SubscriptionPlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailPlan, setDetailPlan] = useState(null);

  const fetchPlans = () => {
    setLoading(true);
    getAllPlans()
      .then(setPlans)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAdd = () => {
    setEditPlan(null);
    setShowForm(true);
  };
  const handleEdit = (plan) => {
    setEditPlan(plan);
    setShowForm(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deletePlan(id);
      fetchPlans();
    }
  };
  const handleDetail = async (id) => {
    const plan = await getPlanDetail(id);
    setDetailPlan(plan);
    setShowDetail(true);
  };
  const handleFormSubmit = async (form) => {
    if (editPlan) {
      await updatePlan(editPlan.id, form);
    } else {
      await createPlan(form);
    }
    setShowForm(false);
    fetchPlans();
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div>
      <h4>구독 플랜 목록</h4>
      <button onClick={handleAdd} style={{ marginBottom: 8 }}>플랜 추가</button>
      <table>
        <thead>
          <tr>
            <th>플랜명</th>
            <th>가격</th>
            <th>설명</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(plan => (
            <tr key={plan.id}>
              <td>{plan.name}</td>
              <td>{plan.price}</td>
              <td>{plan.description}</td>
              <td>
                <button onClick={() => handleDetail(plan.id)}>상세</button>
                <button onClick={() => handleEdit(plan)} style={{ marginLeft: 4 }}>수정</button>
                <button onClick={() => handleDelete(plan.id)} style={{ marginLeft: 4 }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
            <SubscriptionPlanForm
              onSubmit={handleFormSubmit}
              onCancel={() => setShowForm(false)}
              initialData={editPlan}
            />
          </div>
        </div>
      )}
      {showDetail && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
            <SubscriptionPlanDetail plan={detailPlan} onClose={() => setShowDetail(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 