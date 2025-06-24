import React from "react";

const AdminMainLayout = ({ title, description, actions, children }) => {
  // 액션이 배열인 경우 버튼들로 렌더링
  const renderActions = () => {
    if (!actions) return null;
    
    if (Array.isArray(actions)) {
      return (
        <div className="admin-main-actions">
          {actions.map((action, index) => (
            <button
              key={index}
              className={`btn ${action.className || 'btn-primary'}`}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </button>
          ))}
        </div>
      );
    }
    
    return <div className="admin-main-actions">{actions}</div>;
  };

  return (
    <section className="admin-main-layout">
      <div className="admin-main-header">
        <div>
          <h1>{title}</h1>
          {description && <p className="admin-main-desc">{description}</p>}
        </div>
        {renderActions()}
      </div>
      <div className="admin-main-content">{children}</div>
    </section>
  );
};

export default AdminMainLayout; 