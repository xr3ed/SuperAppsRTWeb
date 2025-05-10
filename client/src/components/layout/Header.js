import React from 'react';
import { FaBell, FaSearch, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div className="flex-1">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Cari..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative"
        >
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FaBell className="text-gray-600 w-5 h-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center"
        >
          <div className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 cursor-pointer">
            <div className="bg-primary-600 p-2 rounded-full">
              <FaUser className="text-white w-4 h-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-700">Admin RT</p>
              <p className="text-xs text-gray-500">admin@rt.com</p>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default Header; 