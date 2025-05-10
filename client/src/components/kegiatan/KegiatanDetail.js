import React from 'react';
import { motion } from 'framer-motion';
import { FaCalendar, FaMapMarkerAlt, FaMoneyBillWave, FaUsers, FaCircle } from 'react-icons/fa';

const KegiatanDetail = ({ kegiatan, onClose }) => {
  if (!kegiatan) return null;
  
  // Format tanggal untuk tampilan
  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Warna status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Rencana':
        return 'text-blue-500';
      case 'Berlangsung':
        return 'text-green-500';
      case 'Selesai':
        return 'text-gray-500';
      case 'Dibatalkan':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">{kegiatan.nama}</h2>
        <div className="flex items-center">
          <FaCircle className={`mr-2 ${getStatusColor(kegiatan.statusKegiatan)}`} />
          <span>{kegiatan.statusKegiatan}</span>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Deskripsi Kegiatan</h3>
          <p className="text-gray-700 whitespace-pre-line">{kegiatan.deskripsi}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Waktu */}
          <div className="flex items-start">
            <FaCalendar className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Waktu</p>
              <p className="text-gray-700">Mulai: {formatTanggal(kegiatan.tanggalMulai)}</p>
              {kegiatan.tanggalSelesai && (
                <p className="text-gray-700">Selesai: {formatTanggal(kegiatan.tanggalSelesai)}</p>
              )}
            </div>
          </div>
          
          {/* Lokasi */}
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Lokasi</p>
              <p className="text-gray-700">{kegiatan.lokasi || '-'}</p>
            </div>
          </div>
          
          {/* Anggaran */}
          <div className="flex items-start">
            <FaMoneyBillWave className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Anggaran</p>
              <p className="text-gray-700">{formatCurrency(kegiatan.anggaran)}</p>
            </div>
          </div>
          
          {/* Peserta */}
          <div className="flex items-start">
            <FaUsers className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium">Jumlah Peserta</p>
              <p className="text-gray-700">
                {kegiatan._count?.peserta || 0} orang
              </p>
            </div>
          </div>
        </div>
        
        {/* Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default KegiatanDetail; 