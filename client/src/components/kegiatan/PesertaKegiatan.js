import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserPlus, FaTrash } from 'react-icons/fa';
import * as kegiatanService from '../../services/kegiatanService';

const PesertaKegiatan = ({ kegiatanId, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kegiatan, setKegiatan] = useState(null);
  const [wargaList, setWargaList] = useState([]);
  const [filteredWarga, setFilteredWarga] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWargaId, setSelectedWargaId] = useState('');
  const [selectedPeran, setSelectedPeran] = useState('Peserta');
  const [addingPeserta, setAddingPeserta] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});

  // Fetch kegiatan detail
  const fetchKegiatanDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await kegiatanService.getKegiatanById(kegiatanId);
      setKegiatan(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching kegiatan detail:', error);
      setError('Gagal memuat data kegiatan');
      setLoading(false);
    }
  }, [kegiatanId]);

  // Fetch warga list
  const fetchWargaList = async () => {
    try {
      setLoading(true);
      // Menggunakan API warga
      const response = await fetch('http://localhost:5000/api/warga');
      const data = await response.json();
      setWargaList(data);
      setFilteredWarga(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching warga list:', error);
      setError('Gagal memuat data warga');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatanDetail();
    fetchWargaList();
  }, [kegiatanId, fetchKegiatanDetail]);

  // Filter warga berdasarkan search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWarga(wargaList);
    } else {
      const filtered = wargaList.filter(warga => 
        warga.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warga.nik.includes(searchTerm)
      );
      setFilteredWarga(filtered);
    }
  }, [searchTerm, wargaList]);

  // Filter out warga yang sudah menjadi peserta
  const getAvailableWarga = () => {
    if (!kegiatan || !kegiatan.peserta || filteredWarga.length === 0) {
      return filteredWarga;
    }
    
    const pesertaIds = kegiatan.peserta.map(p => p.wargaId);
    return filteredWarga.filter(warga => !pesertaIds.includes(warga.id));
  };

  // Handle tambah peserta
  const handleAddPeserta = async () => {
    if (!selectedWargaId) {
      alert('Silakan pilih warga terlebih dahulu');
      return;
    }
    
    try {
      setAddingPeserta(true);
      await kegiatanService.addPesertaKegiatan({
        kegiatanId: parseInt(kegiatanId),
        wargaId: parseInt(selectedWargaId),
        peran: selectedPeran,
        statusKehadiran: 'Belum Konfirmasi'
      });
      
      // Refresh data
      await fetchKegiatanDetail();
      setSelectedWargaId('');
      setSelectedPeran('Peserta');
      setAddingPeserta(false);
      
      // Notify parent
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Error adding peserta:', error);
      alert('Gagal menambahkan peserta');
      setAddingPeserta(false);
    }
  };

  // Handle update status kehadiran
  const handleUpdateStatus = async (pesertaId, statusKehadiran) => {
    try {
      setUpdatingStatus({ ...updatingStatus, [pesertaId]: true });
      await kegiatanService.updateStatusKehadiran(pesertaId, { statusKehadiran });
      
      // Refresh data
      await fetchKegiatanDetail();
      setUpdatingStatus({ ...updatingStatus, [pesertaId]: false });
      
      // Notify parent
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengupdate status kehadiran');
      setUpdatingStatus({ ...updatingStatus, [pesertaId]: false });
    }
  };

  // Handle hapus peserta
  const handleRemovePeserta = async (pesertaId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus peserta ini?')) {
      return;
    }
    
    try {
      setUpdatingStatus({ ...updatingStatus, [pesertaId]: true });
      await kegiatanService.removePesertaKegiatan(pesertaId);
      
      // Refresh data
      await fetchKegiatanDetail();
      setUpdatingStatus({ ...updatingStatus, [pesertaId]: false });
      
      // Notify parent
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Error removing peserta:', error);
      alert('Gagal menghapus peserta');
      setUpdatingStatus({ ...updatingStatus, [pesertaId]: false });
    }
  };

  if (loading && !kegiatan) {
    return <div className="p-4 text-center">Memuat data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const availableWarga = getAvailableWarga();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md"
    >
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Manajemen Peserta Kegiatan</h2>
      </div>
      
      {/* Form tambah peserta */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-md font-medium mb-3">Tambah Peserta</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="wargaId" className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Warga
            </label>
            <div className="relative">
              <select
                id="wargaId"
                value={selectedWargaId}
                onChange={(e) => setSelectedWargaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={availableWarga.length === 0}
              >
                <option value="">-- Pilih Warga --</option>
                {availableWarga.map(warga => (
                  <option key={warga.id} value={warga.id}>
                    {warga.namaLengkap} - {warga.nik}
                  </option>
                ))}
              </select>
              {availableWarga.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Semua warga sudah terdaftar sebagai peserta</p>
              )}
            </div>
          </div>
          
          <div className="md:w-1/4">
            <label htmlFor="peran" className="block text-sm font-medium text-gray-700 mb-1">
              Peran
            </label>
            <select
              id="peran"
              value={selectedPeran}
              onChange={(e) => setSelectedPeran(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Peserta">Peserta</option>
              <option value="Panitia">Panitia</option>
              <option value="Pembicara">Pembicara</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          
          <div className="md:w-auto self-end">
            <button
              onClick={handleAddPeserta}
              disabled={!selectedWargaId || addingPeserta || availableWarga.length === 0}
              className="w-full md:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-400 flex items-center justify-center"
            >
              {addingPeserta ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menambahkan...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaUserPlus className="mr-2" />
                  Tambah
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="searchWarga" className="block text-sm font-medium text-gray-700 mb-1">
            Cari Warga
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              id="searchWarga"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama atau NIK..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
      
      {/* Daftar peserta */}
      <div className="p-4">
        <h3 className="text-md font-medium mb-3">Daftar Peserta</h3>
        
        {kegiatan && kegiatan.peserta && kegiatan.peserta.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Peran
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Kehadiran
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kegiatan.peserta.map((peserta) => (
                  <tr key={peserta.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {peserta.warga.namaLengkap}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{peserta.warga.nik}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{peserta.peran}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex">
                        <select
                          value={peserta.statusKehadiran}
                          onChange={(e) => handleUpdateStatus(peserta.id, e.target.value)}
                          disabled={updatingStatus[peserta.id]}
                          className="text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="Belum Konfirmasi">Belum Konfirmasi</option>
                          <option value="Hadir">Hadir</option>
                          <option value="Tidak Hadir">Tidak Hadir</option>
                        </select>
                        {updatingStatus[peserta.id] && (
                          <svg className="animate-spin ml-2 h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemovePeserta(peserta.id)}
                        disabled={updatingStatus[peserta.id]}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus peserta"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            Belum ada peserta terdaftar
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PesertaKegiatan; 