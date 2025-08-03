import React, { useState } from "react";

export default function SubscriptionPlanForm({ onSubmit, onCancel, initialData }) {
  const [form, setForm] = useState(
    initialData || { name: "", price: "", description: "" }
  );
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>플랜명 <input name="name" value={form.name} onChange={handleChange} required /></label>
      </div>
      <div>
        <label>가격 <input name="price" type="number" value={form.price} onChange={handleChange} required /></label>
      </div>
      <div>
        <label>설명 <input name="description" value={form.description} onChange={handleChange} /></label>
      </div>
      <button type="submit">저장</button>
      <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>취소</button>
    </form>
  );
} 