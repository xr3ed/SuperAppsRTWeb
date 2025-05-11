import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaUserCircle, FaEdit, FaTrash, FaUserPlus, FaMapMarkerAlt, FaIdCard, FaUsers, FaChevronDown, FaChevronUp, FaBirthdayCake, FaPhoneAlt, FaEnvelope, FaSyncAlt, FaBaby, FaChild, FaMale, FaFemale, FaSpinner, FaTimes, FaEye } from 'react-icons/fa';
import { kartuKeluargaService } from '../../services/api';
import DetailAnggotaModal from './DetailAnggotaModal';
import useViewport from '../../hooks/useViewport';

// Fungsi Helper untuk menghitung usia
const calculateAge = (birthDateString) => {
  if (!birthDateString) return null;
  try {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    return null; // handle invalid date format
  }
};

const DetailKartuKeluargaPanel = ({ 
  kkId, onEdit, onDelete, onAddAnggota, onEditAnggota, onDeleteAnggota, onRefresh,
  isDeletingKK, isDeletingAnggota, onClose,
  refreshCounter
}) => {
  const [kkData, setKkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAnggota, setExpandedAnggota] = useState(null);
  const [isDetailAnggotaModalOpen, setIsDetailAnggotaModalOpen] = useState(false);
  const [selectedWargaForModal, setSelectedWargaForModal] = useState(null);
  const { device } = useViewport();

  const fetchKartuKeluargaDetail = useCallback(async () => {
    if (!kkId) return;
    try {
      setIsLoading(true);
      let data = await kartuKeluargaService.getKartuKeluargaById(kkId);
      // Fallback if kepalaKeluarga is not set on the main KK record
      if (data && !data.kepalaKeluarga && data.anggota && data.anggota.length > 0) {
        const kepala = data.anggota.find(a => a.statusHubungan?.toLowerCase() === 'kepala keluarga');
        if (kepala && kepala.warga && kepala.warga.namaLengkap) {
          data.kepalaKeluarga = kepala.warga.namaLengkap;
        }
      }
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
    console.log('Fetching detail due to kkId or refreshCounter change:', kkId, refreshCounter);
    fetchKartuKeluargaDetail();
  }, [kkId, refreshCounter, fetchKartuKeluargaDetail]);

  const toggleExpandAnggota = (anggotaId) => {
    setExpandedAnggota(expandedAnggota === anggotaId ? null : anggotaId);
  };

  const handleRefresh = () => {
    fetchKartuKeluargaDetail();
    if(onRefresh) {
      onRefresh();
    }
  }

  // Animation variants (bisa disesuaikan atau disederhanakan untuk panel)
  const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (custom) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: custom * 0.05, duration: 0.3 } 
    })
  };
  
  const expandVariants = {
    hidden: { height: 0, opacity: 0, overflow: 'hidden' },
    visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };

  // Fungsi helper untuk memilih ikon anggota
  const getIconForAnggota = (warga) => {
    const age = calculateAge(warga?.tanggalLahir);
    const gender = warga?.jenisKelamin?.toLowerCase();

    // Prioritaskan ikon spesifik
    if (age !== null) { // Hanya jika usia bisa dihitung
      if (age <= 1) return <FaBaby title={`Bayi (${gender === 'laki-laki' ? 'L' : gender === 'perempuan' ? 'P' : ''})`} className="text-xl text-gray-500" />;
      if (age <= 5) { // Balita
        // Tidak ada ikon spesifik balita L/P di FontAwesome v5 (FaChild generik)
        return <FaChild title={`Balita (${gender === 'laki-laki' ? 'L' : gender === 'perempuan' ? 'P' : ''})`} className="text-xl text-gray-500" />;
      }
       // Bisa tambahkan kategori Remaja jika ada ikon yang cocok
    }

    // Fallback ke ikon dewasa berdasarkan gender
    if (gender === 'laki-laki') return <FaMale title="Laki-laki Dewasa" className="text-xl text-gray-500" />;
    if (gender === 'perempuan') return <FaFemale title="Perempuan Dewasa" className="text-xl text-gray-500" />;

    // Default jika gender atau usia tidak diketahui
    return <FaUserCircle title="Anggota" className="text-xl text-gray-500" />;
  };

  const handleShowDetailAnggota = (warga) => {
    setSelectedWargaForModal(warga);
    setIsDetailAnggotaModalOpen(true);
  };

  if (isLoading && !kkData) {
    return (
      <div className="flex justify-center items-center h-64 p-6 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center">
        <div className="error-message flex flex-col items-center">
          <div className="mb-3 text-red-600">{error}</div>
          <button 
            onClick={handleRefresh}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded font-medium transition-colors flex items-center"
          >
            <FaSyncAlt className="mr-2" /> Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!kkData && !isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md text-center text-gray-500">
        Tidak dapat memuat data untuk Kartu Keluarga ini.
      </div>
    );
  }

  // Fungsi untuk memformat tanggal (jika diperlukan di sini)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch (e) {
      return dateString; // return original if formatting fails
    }
  };
  
  const kepalaKeluargaData = kkData?.anggota?.find(
    a => a.statusHubungan?.toLowerCase() === 'kepala keluarga'
  )?.warga;

  const otherAnggotaKeluarga = kkData?.anggota?.filter(
    a => a.statusHubungan?.toLowerCase() !== 'kepala keluarga'
  ) || [];

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Panel - sedikit berbeda dari modal */}
      <div className={`flex items-center justify-between border-b border-gray-200 bg-gray-50 ${device === 'mobile' ? 'px-3 py-3' : 'px-6 py-4'}`}>
        <h2 className={`font-bold text-gray-800 flex items-center flex-grow min-w-0 ${device === 'mobile' ? 'text-base' : 'text-xl'}`}>
          <FaHome className={`mr-2 text-primary-500 flex-shrink-0 ${device === 'mobile' ? 'text-xl' : 'text-2xl'}`} /> 
          <span className="break-words">
            {kkData ? `Keluarga ${kkData.kepalaKeluarga}` : 'Detail Kartu Keluarga'}
          </span>
        </h2>
        <div className={`flex items-center flex-shrink-0 ${device === 'mobile' ? 'space-x-1 ml-2' : 'space-x-3'}`}>
          <button
            onClick={() => onEdit && onEdit(kkData.id)}
            className={`text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors ${device === 'mobile' ? 'p-2' : 'p-2.5'}`}
            title="Edit Kartu Keluarga"
          >
            <FaEdit className="text-lg" />
          </button>
          <button
            onClick={() => onDelete && onDelete(kkData.id)}
            className={`text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${device === 'mobile' ? 'p-2' : 'p-2.5'}`}
            title="Hapus Kartu Keluarga"
            disabled={isDeletingKK || isLoading}
          >
            {isDeletingKK ? <FaSpinner className="animate-spin text-lg"/> : <FaTrash className="text-lg"/>}
          </button>
          <button
            onClick={handleRefresh}
            className={`text-primary-600 hover:text-primary-800 hover:bg-primary-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${device === 'mobile' ? 'p-2' : 'p-2.5'}`}
            title="Muat Ulang Data"
            disabled={isLoading}
          >
            {isLoading ? <FaSpinner className="animate-spin text-lg"/> : <FaSyncAlt className="text-lg"/>}
          </button>
          <button
            onClick={onClose}
            className={`text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors ${device === 'mobile' ? 'p-2' : 'p-2.5'}`}
            title="Tutup Panel"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
      </div>

      {/* Content Panel */}
      <div className={`overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 ${device === 'mobile' ? 'p-3 space-y-4' : 'p-6 space-y-6'}`}>
        {/* Data Kepala Keluarga */}
        <motion.div 
          variants={itemVariants}
          custom={0}
          className={`bg-white rounded-lg border border-gray-200 shadow-sm ${device === 'mobile' ? 'p-3' : 'p-5'}`}
        >
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${device === 'mobile' ? 'mr-2.5' : 'mr-4'}`}>
              <div className={`rounded-full bg-primary-100 flex items-center justify-center ${device === 'mobile' ? 'w-10 h-10' : 'w-16 h-16'}`}>
                <FaUserCircle className={`text-primary-600 ${device === 'mobile' ? 'text-2xl' : 'text-3xl'}`} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div> 
                  <h3 className={`font-semibold text-gray-800 ${device === 'mobile' ? 'text-base leading-tight' : 'text-xl'}`}>{kkData.kepalaKeluarga}</h3>
                  {device === 'mobile' && (
                    <span className={`text-2xs font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 mt-0.5 inline-block`}>
                      Kepala Keluarga
                    </span>
                  )}
                </div>
                
                {device === 'mobile' ? (
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => handleShowDetailAnggota(kepalaKeluargaData)}
                      className="text-gray-700 hover:text-primary-600 p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      title="Lihat Detail"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditAnggota && onEditAnggota(kepalaKeluargaData, kkData.id)}
                      className="text-gray-700 hover:text-blue-600 p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Edit Profil"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700`}>
                    Kepala Keluarga
                  </span>
                )}
              </div>
              <div className={`mt-2 grid grid-cols-1 gap-x-4 gap-y-2 ${device === 'mobile' ? 'text-xs' : 'md:grid-cols-2 text-sm'}`}>
                <div className="flex items-center">
                  <FaIdCard className={`text-gray-400 mr-2 ${device === 'mobile' ? 'text-xs' : 'text-sm'}`} />
                  <p className="text-gray-600">No. KK: <span className="font-medium text-gray-700">{kkData.nomorKK}</span></p>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className={`text-gray-400 mr-2 ${device === 'mobile' ? 'text-xs' : 'text-sm'}`} />
                  <p className="text-gray-600">RT {kkData.rt}/RW {kkData.rw}</p>
                </div>
              </div>
              <div className={`mt-3 bg-gray-50 rounded-lg ${device === 'mobile' ? 'p-2.5 text-xs' : 'p-3 text-sm'}`}>
                <h4 className={`font-medium text-gray-700 mb-1 ${device === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                    Alamat:
                </h4>
                <p className="text-gray-600">{kkData.alamat}</p>
                {(kkData.kelurahan || kkData.kecamatan || kkData.kabupatenKota || kkData.provinsi) && (
                  <p className="text-gray-600">
                    {kkData.kelurahan || ''}{kkData.kelurahan && kkData.kecamatan ? ', ' : ''}{kkData.kecamatan || ''}
                    {(kkData.kelurahan || kkData.kecamatan) && kkData.kabupatenKota ? ', ' : ''}{kkData.kabupatenKota || ''}
                    {(kkData.kelurahan || kkData.kecamatan || kkData.kabupatenKota) && kkData.provinsi ? ', ' : ''}{kkData.provinsi || ''}
                  </p>
                )}
                {kkData.kodePos && (
                  <p className="text-gray-600">Kode Pos: {kkData.kodePos}</p>
                )}
              </div>
              {device !== 'mobile' && (
                <div className={`mt-4 w-full`}>
                  <div className={`flex justify-center items-center space-x-3`}>
                    <button
                      onClick={() => handleShowDetailAnggota(kepalaKeluargaData)}
                      className={`inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-3 py-1.5 text-xs`}
                    >
                      <FaEye className={`mr-1.5 h-4 w-4`} />
                      Lihat Detail
                    </button>
                    <button
                      onClick={() => onEditAnggota && onEditAnggota(kepalaKeluargaData, kkData.id)}
                      className={`inline-flex items-center border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-3 py-1.5 text-xs`}
                    >
                      <FaEdit className={`mr-1.5 h-4 w-4`} />
                      Edit Profil
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Daftar Anggota Keluarga (setelah modifikasi HANYA menampilkan anggota selain Kepala Keluarga) */}
        <motion.div
          variants={itemVariants}
          custom={1} // Sesuaikan custom index jika perlu
          className={`bg-white rounded-lg border border-gray-200 shadow-sm ${device === 'mobile' ? 'p-3' : 'p-5'}`}
        >
          <div className={`flex items-center justify-between ${device === 'mobile' ? 'mb-3' : 'mb-4'}`}>
            <h3 className={`font-semibold text-gray-800 flex items-center ${device === 'mobile' ? 'text-base' : 'text-xl'}`}>
              <FaUsers className={`mr-2 text-primary-500 ${device === 'mobile' ? 'text-lg' : ''}`} /> 
              Anggota Keluarga Lainnya
            </h3>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${device === 'mobile' ? 'bg-primary-50 text-primary-700 px-2 py-0.5' : 'bg-primary-100 text-primary-800'}`}>
              {otherAnggotaKeluarga.length} Anggota
            </span>
          </div>

          {otherAnggotaKeluarga.length > 0 ? (
            <div className={`${device === 'mobile' ? 'space-y-2.5' : 'space-y-3'}`}>
              {otherAnggotaKeluarga.map((anggota, index) => (
                <motion.div
                  key={anggota.id}
                  variants={itemVariants}
                  custom={2 + (index * 0.1)} // Sesuaikan custom index jika perlu
                  className={`rounded-lg border transition-all duration-200 ${expandedAnggota === anggota.id ? 'bg-primary-50 border-primary-200 shadow' : 'bg-gray-50 border-gray-200'} ${device === 'mobile' ? 'rounded-md' : ''}`}
                >
                  <div 
                    className={`flex items-center justify-between cursor-pointer ${device === 'mobile' ? 'p-2.5' : 'p-3'}`}
                    onClick={() => toggleExpandAnggota(anggota.id)}
                  >
                    <div className="flex items-center">
                      <div className={`rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ${device === 'mobile' ? 'w-8 h-8 mr-2' : 'w-10 h-10 mr-3'}`}>
                        {getIconForAnggota(anggota.warga)} 
                      </div>
                      <div>
                        <p className={`font-medium text-gray-800 ${device === 'mobile' ? 'text-sm' : ''}`}>{anggota.warga?.namaLengkap || 'Nama Tidak Tersedia'}</p>
                        <p className={`text-gray-500 ${device === 'mobile' ? 'text-xs' : 'text-xs'}`}>{anggota.statusHubungan || 'Status Tidak Tersedia'}</p>
                      </div>
                    </div>
                    {expandedAnggota === anggota.id ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                  <AnimatePresence>
                    {expandedAnggota === anggota.id && (
                      <motion.div
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`pb-3 pt-1 border-t border-gray-200 mt-2 ${device === 'mobile' ? 'px-2.5' : 'px-3'}`}
                      >
                        <div className={`text-gray-600 space-y-1 ${device === 'mobile' ? 'text-xs' : 'text-xs'}`}>
                          <p><FaIdCard className="inline mr-1.5 text-gray-400" />NIK: <span className="font-medium text-gray-700">{anggota.warga?.nik || '-'}</span></p>
                          <p><FaBirthdayCake className="inline mr-1.5 text-gray-400" />Tgl Lahir: <span className="font-medium text-gray-700">{formatDate(anggota.warga?.tanggalLahir)}</span></p>
                          <p><FaUserCircle className="inline mr-1.5 text-gray-400" />Jenis Kelamin: <span className="font-medium text-gray-700">{anggota.warga?.jenisKelamin || '-'}</span></p>
                          {anggota.warga?.nomorTelepon && <p><FaPhoneAlt className="inline mr-1.5 text-gray-400" />Telepon: <span className="font-medium text-gray-700">{anggota.warga.nomorTelepon}</span></p>}
                          {anggota.warga?.email && <p><FaEnvelope className="inline mr-1.5 text-gray-400" />Email: <span className="font-medium text-gray-700">{anggota.warga.email}</span></p>}
                        </div>
                        <div className={`mt-3 flex justify-end ${device === 'mobile' ? 'space-x-1.5' : 'space-x-2'}`}>
                          <button
                            onClick={() => handleShowDetailAnggota(anggota.warga) } 
                            className={`text-xs flex items-center text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors ${device === 'mobile' ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}
                            title="Lihat Detail Anggota"
                          >
                            <FaEye className="mr-1" /> Lihat
                          </button>
                          <button
                            onClick={() => onEditAnggota && onEditAnggota(anggota.warga, kkData.id)}
                            className={`text-xs flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors ${device === 'mobile' ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}
                            title="Edit Anggota"
                          >
                            <FaEdit className="mr-1"/> Edit
                          </button>
                          <button
                            onClick={() => onDeleteAnggota && onDeleteAnggota(anggota.id)}
                            className={`text-xs flex items-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${device === 'mobile' ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}
                            title="Hapus Anggota"
                            disabled={isDeletingAnggota || isLoading}
                          >
                            {isDeletingAnggota ? <FaSpinner className="animate-spin mr-1"/> : <FaTrash className="mr-1"/>}
                            Hapus
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className={`text-center text-gray-500 italic ${device === 'mobile' ? 'py-3 text-sm' : 'py-4'}`}>Belum ada anggota keluarga lainnya yang terdaftar.</p>
          )}
          <div className={`text-center ${device === 'mobile' ? 'mt-4' : 'mt-6'}`}>
            <button
              onClick={() => onAddAnggota && onAddAnggota(kkData.id)}
              className={`inline-flex items-center justify-center border border-transparent shadow-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${device === 'mobile' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
              title="Tambah Anggota ke Kartu Keluarga Ini"
            >
              <FaUserPlus className={`-ml-1 h-5 w-5 ${device === 'mobile' ? 'mr-1.5 h-4 w-4' : 'mr-2 h-5 w-5'}`} />
              Tambah Anggota
            </button>
          </div>
        </motion.div>
      </div>
      {selectedWargaForModal && (
        <DetailAnggotaModal 
          isOpen={isDetailAnggotaModalOpen}
          onClose={() => setIsDetailAnggotaModalOpen(false)}
          wargaData={selectedWargaForModal}
        />
      )}
    </motion.div>
  );
};

export default DetailKartuKeluargaPanel; 