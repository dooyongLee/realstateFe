import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const AdminLayout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <Header user={user} onHamburgerClick={() => setSidebarOpen(v => !v)} onLogout={onLogout} />
      </header>
      <div className="admin-body">
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </aside>
        <main className="admin-main">
          {children}
        </main>
      </div>
      <footer className="admin-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default AdminLayout; 