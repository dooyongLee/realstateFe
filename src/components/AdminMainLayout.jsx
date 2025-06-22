import React from "react";

const AdminMainLayout = ({ title, description, actions, children }) => (
  <section className="admin-main-layout">
    <div className="admin-main-header">
      <div>
        <h1>{title}</h1>
        {description && <p className="admin-main-desc">{description}</p>}
      </div>
      <div className="admin-main-actions">{actions}</div>
    </div>
    <div className="admin-main-content">{children}</div>
  </section>
);

export default AdminMainLayout; 