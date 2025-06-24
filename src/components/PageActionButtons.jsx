import React from "react";
import { FaPlus } from "react-icons/fa";

const PageActionButtons = ({ onAddUser }) => (
  <div className="page-action-buttons">
    <button
      className="btn btn-primary"
      onClick={onAddUser}
      title="새 회원 추가"
    >
      <FaPlus style={{ marginRight: 4 }} /> 회원추가
    </button>
  </div>
);

export default PageActionButtons; 