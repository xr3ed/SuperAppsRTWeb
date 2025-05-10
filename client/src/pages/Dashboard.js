import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaMoneyBillWave, FaCalendarAlt, FaBullhorn } from 'react-icons/fa';
import { wargaService, iuranService } from '../services/api';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [dataStats, setDataStats] = useState({
    totalWarga: 0,
    totalIuran: 0,
    recentPayments: [],
    iuranByJenis: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch warga data
        const wargaData = await wargaService.getAllWarga();
        
        // Fetch iuran summary
        const iuranSummary = await iuranService.getIuranSummary();
        
        setDataStats({
          totalWarga: wargaData.length,
          totalIuran: iuranSummary.total._sum.jumlah || 0,
          recentPayments: iuranSummary.recentPayments || [],
          iuranByJenis: iuranSummary.byJenis || [],
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const chartData = {
    labels: dataStats.iuranByJenis.map(item => item.jenisIuran),
    datasets: [
      {
        label: 'Total Iuran (Rp)',
        data: dataStats.iuranByJenis.map(item => item._sum.jumlah),
        backgroundColor: '#0ea5e9',
        borderColor: '#0284c7',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ringkasan Iuran per Kategori',
      },
    },
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5 }
    })
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Total Warga</h3>
              <p className="text-3xl font-bold mt-2">{dataStats.totalWarga}</p>
            </div>
            <FaUsers className="h-12 w-12 opacity-70" />
          </div>
          <div className="mt-4">
            <Link to="/warga" className="text-sm text-blue-100 hover:text-white">
              Lihat detail &rarr;
            </Link>
          </div>
        </motion.div>

        <motion.div 
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Total Iuran</h3>
              <p className="text-3xl font-bold mt-2">
                Rp {dataStats.totalIuran.toLocaleString('id-ID')}
              </p>
            </div>
            <FaMoneyBillWave className="h-12 w-12 opacity-70" />
          </div>
          <div className="mt-4">
            <Link to="/iuran" className="text-sm text-green-100 hover:text-white">
              Lihat detail &rarr;
            </Link>
          </div>
        </motion.div>

        <motion.div 
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Kegiatan</h3>
              <p className="text-3xl font-bold mt-2">0</p>
              <p className="text-sm">kegiatan aktif</p>
            </div>
            <FaCalendarAlt className="h-12 w-12 opacity-70" />
          </div>
          <div className="mt-4">
            <Link to="/kegiatan" className="text-sm text-purple-100 hover:text-white">
              Lihat detail &rarr;
            </Link>
          </div>
        </motion.div>

        <motion.div 
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Pengumuman</h3>
              <p className="text-3xl font-bold mt-2">0</p>
              <p className="text-sm">pengumuman aktif</p>
            </div>
            <FaBullhorn className="h-12 w-12 opacity-70" />
          </div>
          <div className="mt-4">
            <Link to="/pengumuman" className="text-sm text-amber-100 hover:text-white">
              Lihat detail &rarr;
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Iuran Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="card lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Iuran</h3>
          {dataStats.iuranByJenis.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Belum ada data iuran</p>
            </div>
          )}
        </motion.div>

        {/* Recent Payments */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pembayaran Terbaru</h3>
          {dataStats.recentPayments.length > 0 ? (
            <div className="overflow-y-auto max-h-80">
              <ul className="divide-y divide-gray-200">
                {dataStats.recentPayments.map((payment, index) => (
                  <li key={index} className="py-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-3 rounded-full">
                        <FaMoneyBillWave className="text-primary-600 w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {payment.warga?.namaLengkap || 'Warga'}
                        </p>
                        <p className="text-xs text-gray-500">{payment.jenisIuran}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">
                          Rp {payment.jumlah.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.tanggalBayar).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Belum ada pembayaran</p>
            </div>
          )}
          <div className="mt-4 text-right">
            <Link to="/iuran" className="text-sm text-primary-600 hover:text-primary-700">
              Lihat semua &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 