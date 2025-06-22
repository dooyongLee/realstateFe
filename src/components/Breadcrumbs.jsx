import React from "react";
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav style={{ marginBottom: "1rem" }}>
      <Link to="/">홈</Link>
      {pathnames.map((name, idx) => {
        const routeTo = `/${pathnames.slice(0, idx + 1).join("/")}`;
        return (
          <span key={routeTo}>
            {" / "}
            <Link to={routeTo}>{decodeURIComponent(name)}</Link>
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs; 