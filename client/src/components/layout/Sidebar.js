import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaUsers, FaMoneyBillWave, FaBullhorn, FaCalendar, FaBoxes, FaClipboardList } from 'react-icons/fa';

const menuItems = [
  { name: 'Dashboard', icon: <FaHome className="w-5 h-5" />, route: '/' },
  { name: 'Warga', icon: <FaUsers className="w-5 h-5" />, route: '/warga' },
  { name: 'Iuran', icon: <FaMoneyBillWave className="w-5 h-5" />, route: '/iuran' },
  { name: 'Pengumuman', icon: <FaBullhorn className="w-5 h-5" />, route: '/pengumuman' },
  { name: 'Kegiatan', icon: <FaCalendar className="w-5 h-5" />, route: '/kegiatan' },
  { name: 'Inventaris', icon: <FaBoxes className="w-5 h-5" />, route: '/inventaris' },
  { name: 'Laporan', icon: <FaClipboardList className="w-5 h-5" />, route: '/laporan' },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: isCollapsed ? 80 : 250 }}
      transition={{ duration: 0.3 }}
      className="bg-primary-800 text-white h-screen sticky top-0 left-0 overflow-y-auto"
    >
      <div className="flex items-center justify-between p-4 border-b border-primary-700">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-bold text-xl"
          >
            Super Apps RT
          </motion.div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-primary-700 focus:outline-none"
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-1">
              <Link
                to={item.route}
                className={`flex items-center px-4 py-3 hover:bg-primary-700 transition-all ${
                  location.pathname === item.route ? 'bg-primary-600' : ''
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
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