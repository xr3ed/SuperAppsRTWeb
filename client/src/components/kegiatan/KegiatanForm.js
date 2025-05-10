import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const KegiatanForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    lokasi: '',
    anggaran: '',
    statusKegiatan: 'Rencana'
  });

  useEffect(() => {
    if (initialData) {
      // Format tanggal untuk input type="datetime-local"
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
      };

      setFormData({
        nama: initialData.nama || '',
        deskripsi: initialData.deskripsi || '',
        tanggalMulai: formatDate(initialData.tanggalMulai) || '',
        tanggalSelesai: formatDate(initialData.tanggalSelesai) || '',
        lokasi: initialData.lokasi || '',
        anggaran: initialData.anggaran?.toString() || '',
        statusKegiatan: initialData.statusKegiatan || 'Rencana'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Kegiatan */}
          <div className="col-span-2">
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Masukkan nama kegiatan"
            />
          </div>
          
          {/* Deskripsi */}
          <div className="col-span-2">
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Deskripsi kegiatan"
            />
          </div>
          
          {/* Tanggal Mulai */}
          <div>
            <label htmlFor="tanggalMulai" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="tanggalMulai"
              name="tanggalMulai"
              value={formData.tanggalMulai}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Tanggal Selesai */}
          <div>
            <label htmlFor="tanggalSelesai" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="datetime-local"
              id="tanggalSelesai"
              name="tanggalSelesai"
              value={formData.tanggalSelesai}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {/* Lokasi */}
          <div>
            <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi
            </label>
            <input
              type="text"
              id="lokasi"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Lokasi kegiatan"
            />
          </div>
          
          {/* Anggaran */}
          <div>
            <label htmlFor="anggaran" className="block text-sm font-medium text-gray-700 mb-1">
              Anggaran (Rp)
            </label>
            <input
              type="number"
              id="anggaran"
              name="anggaran"
              value={formData.anggaran}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
              step="1000"
              min="0"
            />
          </div>
          
          {/* Status Kegiatan */}
          <div className="col-span-2">
            <label htmlFor="statusKegiatan" className="block text-sm font-medium text-gray-700 mb-1">
              Status Kegiatan <span className="text-red-500">*</span>
            </label>
            <select
              id="statusKegiatan"
              name="statusKegiatan"
              value={formData.statusKegiatan}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Rencana">Rencana</option>
              <option value="Berlangsung">Berlangsung</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
        
        {/* Tombol Submit dan Cancel */}
        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              'Simpan'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default KegiatanForm; 