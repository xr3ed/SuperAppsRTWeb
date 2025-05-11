import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import useViewport from '../../hooks/useViewport';

const Layout = ({ children }) => {
  const { device } = useViewport();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar device={device} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header device={device} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 