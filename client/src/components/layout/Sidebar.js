import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaUsers, FaMoneyBillWave, FaBullhorn, FaCalendar, FaBoxes, FaClipboardList } from 'react-icons/fa';
import { FiX, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const menuItems = [
  { name: 'Dashboard', icon: <FaHome className="w-5 h-5" />, route: '/' },
  { name: 'Warga', icon: <FaUsers className="w-5 h-5" />, route: '/warga' },
  { name: 'Iuran', icon: <FaMoneyBillWave className="w-5 h-5" />, route: '/iuran' },
  { name: 'Pengumuman', icon: <FaBullhorn className="w-5 h-5" />, route: '/pengumuman' },
  { name: 'Kegiatan', icon: <FaCalendar className="w-5 h-5" />, route: '/kegiatan' },
  { name: 'Inventaris', icon: <FaBoxes className="w-5 h-5" />, route: '/inventaris' },
  { name: 'Laporan', icon: <FaClipboardList className="w-5 h-5" />, route: '/laporan' },
];

const Sidebar = ({ device, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const location = useLocation();

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(!isDesktopCollapsed);
  };

  useEffect(() => {
    if (device === 'mobile' && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, device]);

  const sidebarWidth = device !== 'mobile' && isDesktopCollapsed ? 80 : 250;
  const commonClasses = "bg-primary-800 text-white h-screen overflow-y-auto flex flex-col";

  if (device === 'mobile') {
    return (
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isMobileMenuOpen ? '0%' : '-100%' }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`${commonClasses} fixed top-0 left-0 z-40 w-64 shadow-lg md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-700">
          <span className="font-bold text-xl">Super Apps RT</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-primary-700 focus:outline-none"
            aria-label="Tutup menu"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-4 flex-1">
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-1">
                <Link
                  to={item.route}
                  className={`flex items-center px-4 py-3 hover:bg-primary-700 transition-colors ${
                    location.pathname === item.route ? 'bg-primary-600' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`${commonClasses} hidden md:flex sticky top-0`}
    >
      <div className="flex items-center justify-between p-4 border-b border-primary-700">
        {!isDesktopCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="font-bold text-xl whitespace-nowrap"
          >
            Super Apps RT
          </motion.div>
        )}
        <button
          onClick={toggleDesktopSidebar}
          className="p-2 rounded-md hover:bg-primary-700 focus:outline-none"
          aria-label={isDesktopCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          {isDesktopCollapsed ? (
            <FiChevronsRight className="w-5 h-5" />
          ) : (
            <FiChevronsLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="mt-4 flex-1">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-1">
              <Link
                to={item.route}
                className={`flex items-center px-4 py-3 hover:bg-primary-700 transition-colors ${
                  location.pathname === item.route ? 'bg-primary-600' : ''
                }`}
                title={isDesktopCollapsed ? item.name : undefined}
              >
                <span className="mr-3">{item.icon}</span>
                {!isDesktopCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

export default Sidebar; 