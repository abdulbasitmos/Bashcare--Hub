import React from 'react';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import PageWrapper from '../layout/PageWrapper';

const DashboardShell = ({ children, role = 'patient', logout }) => {
  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      <Sidebar role={role} onLogout={logout} />
      <div className="flex-grow flex flex-col">
        <Navbar />
        <main className="p-8">
          <PageWrapper>
            {children}
          </PageWrapper>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
