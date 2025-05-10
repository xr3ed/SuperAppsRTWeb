import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaUserCircle, FaEdit, FaTrash, FaUserPlus, FaMapMarkerAlt, FaIdCard, FaUsers, FaChevronDown, FaChevronUp, FaBirthdayCake, FaPhoneAlt, FaEnvelope, FaSyncAlt } from 'react-icons/fa';
import { kartuKeluargaService } from '../../services/api';

const DetailKeluargaModal = ({ isOpen, onClose, kkId, onEdit, onDelete, onAddAnggota, onEditAnggota, onDeleteAnggota }) => {
  const [kkData, setKkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAnggota, setExpandedAnggota] = useState(null);

  const fetchKartuKeluargaDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await kartuKeluargaService.getKartuKeluargaById(kkId);
      setKkData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching kartu keluarga detail:', err);
      setError('Gagal memuat detail kartu keluarga');
    } finally {
      setIsLoading(false);
    }
  }, [kkId]);

  useEffect(() => {
    if (isOpen && kkId) {
      fetchKartuKeluargaDetail();
    }
  }, [isOpen, kkId, fetchKartuKeluargaDetail]);

  const toggleExpandAnggota = (anggotaId) => {
    setExpandedAnggota(expandedAnggota === anggotaId ? null : anggotaId);
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20, 
      transition: { duration: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: custom * 0.1, 
        duration: 0.3 
      } 
    })
  };

  const expandVariants = {
    hidden: { height: 0, opacity: 0, overflow: 'hidden' },
    visible: { 
      height: 'auto', 
      opacity: 1, 
      transition: { 
        duration: 0.3 
      } 
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl max-w-screen-md w-full max-h-[85vh] overflow-hidden flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-primary-50">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaHome className="mr-2 text-primary-500" /> 
              Detail Kartu Keluarga
            </h2>
            <div className="flex space-x-2">
              {!isLoading && !error && kkData && (
                <>
                  <button
                    onClick={() => onEdit && onEdit(kkData.id)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit Kartu Keluarga"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(kkData.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                    title="Hapus Kartu Keluarga"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
              <button
                onClick={fetchKartuKeluargaDetail}
                className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-colors"
                title="Muat Ulang Data"
              >
                <FaSyncAlt />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Tutup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="error-message flex flex-col items-center">
                <div className="mb-3">{error}</div>
                <button 
                  onClick={fetchKartuKeluargaDetail}
                  className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded font-medium transition-colors flex items-center"
                >
                  <FaSyncAlt className="mr-2" /> Coba Lagi
                </button>
              </div>
            ) : kkData ? (
              <div className="space-y-6">
                {/* Data Kepala Keluarga */}
                <motion.div 
                  variants={itemVariants}
                  custom={0}
                  initial="hidden"
                  animate="visible"
                  className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                        <FaUserCircle className="text-3xl text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-gray-800">{kkData.kepalaKeluarga}</h3>
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          Kepala Keluarga
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <FaIdCard className="text-gray-400 mr-2 text-sm" />
                          <p className="text-sm text-gray-600">No. KK: <span className="font-medium">{kkData.nomorKK}</span></p>
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-gray-400 mr-2 text-sm" />
                          <p className="text-sm text-gray-600">RT {kkData.rt}/RW {kkData.rw}</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Alamat:</h4>
                        <p className="text-sm text-gray-600">{kkData.alamat}</p>
                        {kkData.kelurahan && kkData.kecamatan && (
                          <p className="text-sm text-gray-600">
                            {kkData.kelurahan}, {kkData.kecamatan}, {kkData.kabupatenKota || ''} {kkData.provinsi ? `, ${kkData.provinsi}` : ''}
                          </p>
                        )}
                        {kkData.kodePos && (
                          <p className="text-sm text-gray-600">Kode Pos: {kkData.kodePos}</p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700">Status: <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Aktif</span></p>
                        <button
                          onClick={() => onAddAnggota && onAddAnggota(kkData.id)}
                          className="flex items-center text-sm text-white bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <FaUserPlus className="mr-1" /> Tambah Anggota
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Daftar Anggota Keluarga */}
                <motion.div
                  variants={itemVariants}
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                      <FaUsers className="mr-2 text-primary-500" /> 
                      Anggota Keluarga
                    </h3>
                    <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {kkData.anggota ? kkData.anggota.length : 0} Anggota
                    </span>
                  </div>

                  {kkData.anggota && kkData.anggota.length > 0 ? (
                    <div className="space-y-4">
                      {kkData.anggota.map((anggota, index) => (
                        <motion.div
                          key={anggota.id}
                          variants={itemVariants}
                          custom={2 + (index * 0.2)}
                          initial="hidden"
                          animate="visible"
                          className={`bg-gray-50 rounded-lg border transition-all duration-200 ${expandedAnggota === anggota.id ? 'border-primary-300 shadow-md' : 'border-gray-100'}`}
                        >
                          {/* Anggota header */}
                          <div 
                            className="flex justify-between items-center p-4 cursor-pointer"
                            onClick={() => toggleExpandAnggota(anggota.id)}
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-white shadow-sm border border-gray-200">
                                <FaUserCircle className="text-xl text-gray-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{anggota.nama}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs ${anggota.hubungan === 'Kepala Keluarga' ? 'bg-blue-100 text-blue-700' : anggota.hubungan === 'Istri' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'} px-2 py-0.5 rounded-full`}>
                                    {anggota.hubungan}
                                  </span>
                                  <span className="text-xs text-gray-500">NIK: {anggota.nik}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('DetailKeluargaModal - Editing Anggota:', anggota);
                                    console.log('DetailKeluargaModal - KK ID Prop:', kkId);
                                    onEditAnggota && onEditAnggota(anggota);
                                  }}
                                  className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                                  title="Edit Anggota"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteAnggota && onDeleteAnggota(anggota.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                                  title="Hapus Anggota"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                              {expandedAnggota === anggota.id ? (
                                <FaChevronUp className="text-gray-500 transition-transform duration-200" />
                              ) : (
                                <FaChevronDown className="text-gray-500 transition-transform duration-200" />
                              )}
                            </div>
                          </div>

                          {/* Expanded detail area */}
                          <AnimatePresence>
                            {expandedAnggota === anggota.id && (
                              <motion.div
                                variants={expandVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="px-4 pb-4 border-t border-gray-200"
                              >
                                <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                                  <div className="flex items-center">
                                    <FaIdCard className="text-gray-400 mr-2 text-sm" />
                                    <p className="text-sm text-gray-600">NIK: <span className="font-medium">{anggota.nik}</span></p>
                                  </div>
                                  
                                  {anggota.tanggalLahir && (
                                    <div className="flex items-center">
                                      <FaBirthdayCake className="text-gray-400 mr-2 text-sm" />
                                      <p className="text-sm text-gray-600">Tanggal Lahir: <span className="font-medium">{anggota.tanggalLahir}</span></p>
                                    </div>
                                  )}
                                  
                                  {anggota.telepon && (
                                    <div className="flex items-center">
                                      <FaPhoneAlt className="text-gray-400 mr-2 text-sm" />
                                      <p className="text-sm text-gray-600">Telepon: <span className="font-medium">{anggota.telepon}</span></p>
                                    </div>
                                  )}
                                  
                                  {anggota.email && (
                                    <div className="flex items-center">
                                      <FaEnvelope className="text-gray-400 mr-2 text-sm" />
                                      <p className="text-sm text-gray-600">Email: <span className="font-medium">{anggota.email}</span></p>
                                    </div>
                                  )}
                                  
                                  <div className="md:col-span-2 mt-2">
                                    <p className="text-sm font-medium text-gray-700">Status: <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Aktif</span></p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                      <FaUsers className="text-gray-300 text-3xl mx-auto mb-2" />
                      <p className="text-gray-500">Belum ada anggota keluarga untuk KK ini</p>
                      <button
                        onClick={() => onAddAnggota && onAddAnggota(kkData.id)}
                        className="mt-3 flex items-center mx-auto text-sm text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        <FaUserPlus className="mr-1" /> Tambah Anggota Keluarga
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="warning-message text-center">
                Data kartu keluarga tidak ditemukan
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailKeluargaModal; 