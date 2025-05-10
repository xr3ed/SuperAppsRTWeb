import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUserCircle, FaBirthdayCake, FaVenusMars, FaChurch, FaUserTie, FaGraduationCap, FaGlobeAmericas, FaPhone, FaEnvelope, FaBaby, FaChild, FaMale, FaFemale } from 'react-icons/fa';

// Fungsi Helper (dapat disesuaikan atau dipindah ke utils jika perlu)
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
    return age >= 0 ? age : null; // Pastikan usia tidak negatif
  } catch (e) {
    return null; 
  }
};

const getIconForAnggota = (warga) => {
  if (!warga) return <FaUserCircle className="text-5xl text-gray-400" />;
  const age = calculateAge(warga.tanggalLahir);
  const gender = warga.jenisKelamin?.toLowerCase();

  if (age !== null) {
    if (age <= 1) return <FaBaby title={`Bayi`} className="text-5xl text-blue-400" />;
    if (age <= 12) return <FaChild title={`Anak-anak`} className="text-5xl text-green-400" />;
  }
  if (gender === 'laki-laki') return <FaMale title="Laki-laki" className="text-5xl text-blue-500" />;
  if (gender === 'perempuan') return <FaFemale title="Perempuan" className="text-5xl text-pink-500" />;
  return <FaUserCircle className="text-5xl text-gray-500" />;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start py-2">
    <Icon className="text-primary-500 mr-3 mt-1 flex-shrink-0" size={18} />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
    </div>
  </div>
);

const DetailAnggotaModal = ({ isOpen, onClose, wargaData }) => {
  if (!isOpen || !wargaData) return null;

  const age = calculateAge(wargaData.tanggalLahir);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={onClose} // Close on backdrop click
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent close on modal content click
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Detail Anggota Keluarga</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Content - CV Like */}
            <div className="p-6 overflow-y-auto">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start p-4 mb-6 bg-gray-50 rounded-lg">
                <div className="mr-0 sm:mr-6 mb-4 sm:mb-0 flex-shrink-0">
                  {getIconForAnggota(wargaData)}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-primary-700">{wargaData.namaLengkap || 'Nama Tidak Tersedia'}</h2>
                  <p className="text-sm text-gray-600">NIK: {wargaData.nik || '-'}</p>
                  {/* Bisa tambahkan status hubungan jika perlu dan tersedia */}
                </div>
              </div>

              {/* Detail Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {/* Kolom Kiri */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">Informasi Pribadi</h4>
                  <DetailItem icon={FaBirthdayCake} label="Tempat, Tanggal Lahir" value={`${wargaData.tempatLahir || '-'}, ${formatDate(wargaData.tanggalLahir)}`} />
                  {age !== null && <DetailItem icon={FaUserCircle} label="Usia" value={`${age} tahun`} />}
                  <DetailItem icon={FaVenusMars} label="Jenis Kelamin" value={wargaData.jenisKelamin || '-'} />
                  <DetailItem icon={FaChurch} label="Agama" value={wargaData.agama || '-'} />
                  <DetailItem icon={FaUserTie} label="Status Perkawinan" value={wargaData.statusPerkawinan || '-'} />
                  <DetailItem icon={FaGlobeAmericas} label="Kewarganegaraan" value={wargaData.kewarganegaraan || '-'} />
                </div>

                {/* Kolom Kanan */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2 border-b pb-1">Pendidikan & Pekerjaan</h4>
                  <DetailItem icon={FaGraduationCap} label="Pendidikan Terakhir" value={wargaData.pendidikanTerakhir || '-'} />
                  <DetailItem icon={FaUserTie} label="Pekerjaan" value={wargaData.pekerjaan || '-'} />
                  
                  {(wargaData.nomorTelepon || wargaData.email) && (
                    <>
                      <h4 className="text-md font-semibold text-gray-700 mt-4 mb-2 border-b pb-1">Informasi Kontak</h4>
                      {wargaData.nomorTelepon && <DetailItem icon={FaPhone} label="Nomor Telepon" value={wargaData.nomorTelepon} />}
                      {wargaData.email && <DetailItem icon={FaEnvelope} label="Email" value={wargaData.email} />}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer (optional) */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailAnggotaModal; 