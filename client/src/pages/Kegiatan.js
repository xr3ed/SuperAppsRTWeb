import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendar, FaPlus, FaEdit, FaTrash, FaUsers, FaInfoCircle, FaFilter, FaSearch } from 'react-icons/fa';

import KegiatanForm from '../components/kegiatan/KegiatanForm';
import KegiatanDetail from '../components/kegiatan/KegiatanDetail';
import PesertaKegiatan from '../components/kegiatan/PesertaKegiatan';
import * as kegiatanService from '../services/kegiatanService';

const Kegiatan = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showPeserta, setShowPeserta] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState({});
  
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data kegiatan
  const loadKegiatan = async () => {
    try {
      setLoading(true);
      const data = await kegiatanService.getAllKegiatan();
      setKegiatan(data);
      setError(null);
    } catch (error) {
      console.error('Error loading kegiatan:', error);
      setError('Gagal memuat data kegiatan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKegiatan();
  }, []);

  // Handle form submit (create/update)
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      if (editingKegiatan) {
        // Update existing
        await kegiatanService.updateKegiatan(editingKegiatan.id, formData);
      } else {
        // Create new
        await kegiatanService.createKegiatan(formData);
      }
      
      // Reset form
      setShowForm(false);
      setEditingKegiatan(null);
      
      // Reload data
      await loadKegiatan();
      
    } catch (error) {
      console.error('Error saving kegiatan:', error);
      alert('Terjadi kesalahan saat menyimpan data kegiatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete kegiatan
  const handleDelete = async (kegiatanId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini? Semua data peserta juga akan dihapus.')) {
      return;
    }
    
    try {
      setIsDeleting({ ...isDeleting, [kegiatanId]: true });
      await kegiatanService.deleteKegiatan(kegiatanId);
      
      // Reload data
      await loadKegiatan();
      
    } catch (error) {
      console.error('Error deleting kegiatan:', error);
      alert('Terjadi kesalahan saat menghapus kegiatan');
    } finally {
      setIsDeleting({ ...isDeleting, [kegiatanId]: false });
    }
  };

  // Show detail kegiatan
  const handleShowDetail = async (kegiatanId) => {
    try {
      const data = await kegiatanService.getKegiatanById(kegiatanId);
      setSelectedKegiatan(data);
      setShowDetail(true);
    } catch (error) {
      console.error('Error loading kegiatan detail:', error);
      alert('Gagal memuat detail kegiatan');
    }
  };

  // Show form to edit kegiatan
  const handleEdit = async (kegiatanId) => {
    try {
      const data = await kegiatanService.getKegiatanById(kegiatanId);
      setEditingKegiatan(data);
      setShowForm(true);
    } catch (error) {
      console.error('Error loading kegiatan for edit:', error);
      alert('Gagal memuat data kegiatan untuk edit');
    }
  };

  // Show peserta management
  const handleManagePeserta = (kegiatanId) => {
    setSelectedKegiatan({ id: kegiatanId });
    setShowPeserta(true);
  };

  // Filter kegiatan by status
  const filteredKegiatan = kegiatan.filter(item => {
    // Filter by status
    if (filterStatus && item.statusKegiatan !== filterStatus) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return item.nama.toLowerCase().includes(searchLower) || 
             item.deskripsi.toLowerCase().includes(searchLower) ||
             item.lokasi?.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  // Format tanggal
  const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Rencana':
        return 'bg-blue-100 text-blue-800';
      case 'Berlangsung':
        return 'bg-green-100 text-green-800';
      case 'Selesai':
        return 'bg-gray-100 text-gray-800';
      case 'Dibatalkan':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-2xl font-bold text-gray-800 mb-4 md:mb-0"
        >
          <FaCalendar className="inline-block mr-2 text-primary-600" />
          Manajemen Kegiatan RT
        </motion.h1>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            setEditingKegiatan(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center"
        >
          <FaPlus className="mr-2" />
          Tambah Kegiatan
        </motion.button>
      </div>
      
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Cari Kegiatan
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama, deskripsi, lokasi..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        
        <div className="md:w-1/2">
          <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Filter Status
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Status</option>
              <option value="Rencana">Rencana</option>
              <option value="Berlangsung">Berlangsung</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Memuat data kegiatan...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <FaInfoCircle className="inline-block mr-2" />
            {error}
          </div>
        ) : filteredKegiatan.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FaInfoCircle className="inline-block mr-2" />
            {searchTerm || filterStatus ? 'Tidak ada kegiatan yang sesuai dengan filter' : 'Belum ada kegiatan yang terdaftar'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Kegiatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Mulai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Peserta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKegiatan.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.lokasi && `📍 ${item.lokasi}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatTanggal(item.tanggalMulai)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.statusKegiatan)}`}>
                        {item.statusKegiatan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-500">
                        {item._count?.peserta || 0} orang
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleShowDetail(item.id)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="Lihat Detail"
                      >
                        <FaInfoCircle />
                      </button>
                      <button
                        onClick={() => handleManagePeserta(item.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Kelola Peserta"
                      >
                        <FaUsers />
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                        title="Edit Kegiatan"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting[item.id]}
                        className="text-red-600 hover:text-red-900"
                        title="Hapus Kegiatan"
                      >
                        {isDeleting[item.id] ? (
                          <svg className="animate-spin h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Modal Forms */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => !isSubmitting && setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <KegiatanForm
                initialData={editingKegiatan}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                isLoading={isSubmitting}
              />
            </motion.div>
          </motion.div>
        )}
        
        {showDetail && selectedKegiatan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setShowDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <KegiatanDetail
                kegiatan={selectedKegiatan}
                onClose={() => setShowDetail(false)}
              />
            </motion.div>
          </motion.div>
        )}
        
        {showPeserta && selectedKegiatan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setShowPeserta(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <PesertaKegiatan
                kegiatanId={selectedKegiatan.id}
                onUpdate={loadKegiatan}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Kegiatan; 