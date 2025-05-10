import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserEdit, FaSave, FaTimes, FaBirthdayCake, FaVenusMars, FaPrayingHands, FaHeart, FaBriefcase, FaUserGraduate, FaFlag, FaPhone, FaEnvelope, FaUsers } from 'react-icons/fa';

const EditAnggotaFormModal = ({ isOpen, onClose, anggotaData, onSubmit, kkId }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (anggotaData) {
      setFormData({
        nik: anggotaData.nik || '',
        namaLengkap: anggotaData.namaLengkap || '',
        tempatLahir: anggotaData.tempatLahir || '',
        tanggalLahir: anggotaData.tanggalLahir ? new Date(anggotaData.tanggalLahir).toISOString().split('T')[0] : '',
        jenisKelamin: anggotaData.jenisKelamin || '',
        agama: anggotaData.agama || '',
        statusHubunganDalamKK: anggotaData.statusHubunganDalamKK || '',
        statusPerkawinan: anggotaData.statusPerkawinan || '',
        pekerjaan: anggotaData.pekerjaan || '',
        pendidikanTerakhir: anggotaData.pendidikanTerakhir || '',
        kewarganegaraan: anggotaData.kewarganegaraan || '',
        nomorTelepon: anggotaData.nomorTelepon || '',
        email: anggotaData.email || '',
      });
    } else {
      setFormData({
        nik: '',
        namaLengkap: '',
        tempatLahir: '',
        tanggalLahir: '',
        jenisKelamin: '',
        agama: '',
        statusHubunganDalamKK: '',
        statusPerkawinan: '',
        pekerjaan: '',
        pendidikanTerakhir: '',
        kewarganegaraan: '',
        nomorTelepon: '',
        email: '',
      });
    }
  }, [anggotaData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting edited anggota data:', formData, 'for KK ID:', kkId, 'Anggota ID:', anggotaData?.id);
    if (onSubmit) {
      onSubmit(anggotaData.id, formData, kkId);
    }
  };

  const jenisKelaminOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' },
  ];

  const agamaOptions = [
    { value: 'Islam', label: 'Islam' },
    { value: 'Kristen Protestan', label: 'Kristen Protestan' },
    { value: 'Kristen Katolik', label: 'Kristen Katolik' },
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Buddha', label: 'Buddha' },
    { value: 'Khonghucu', label: 'Khonghucu' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const statusHubunganOptions = [
    { value: 'Kepala Keluarga', label: 'Kepala Keluarga' },
    { value: 'Istri', label: 'Istri' },
    { value: 'Anak', label: 'Anak' },
    { value: 'Cucu', label: 'Cucu' },
    { value: 'Orang Tua', label: 'Orang Tua' },
    { value: 'Mertua', label: 'Mertua' },
    { value: 'Menantu', label: 'Menantu' },
    { value: 'Famili Lain', label: 'Famili Lain' },
    { value: 'Lainnya', label: 'Lainnya' },
  ];

  const statusPerkawinanOptions = [
    { value: 'Belum Kawin', label: 'Belum Kawin' },
    { value: 'Kawin', label: 'Kawin' },
    { value: 'Cerai Hidup', label: 'Cerai Hidup' },
    { value: 'Cerai Mati', label: 'Cerai Mati' },
  ];

  const pendidikanTerakhirOptions = [
    { value: 'Tidak/Belum Sekolah', label: 'Tidak/Belum Sekolah' },
    { value: 'Belum Tamat SD/Sederajat', label: 'Belum Tamat SD/Sederajat' },
    { value: 'Tamat SD/Sederajat', label: 'Tamat SD/Sederajat' },
    { value: 'SLTP/Sederajat', label: 'SLTP/Sederajat' },
    { value: 'SLTA/Sederajat', label: 'SLTA/Sederajat' },
    { value: 'Diploma I/II', label: 'Diploma I/II' },
    { value: 'Akademi/Diploma III/S.Muda', label: 'Akademi/Diploma III/S.Muda' },
    { value: 'Diploma IV/Strata I', label: 'Diploma IV/Strata I' },
    { value: 'Strata II', label: 'Strata II' },
    { value: 'Strata III', label: 'Strata III' },
  ];

  const kewarganegaraanOptions = [
    { value: 'WNI', label: 'WNI' },
    { value: 'WNA', label: 'WNA' },
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  };

  if (!isOpen) return null;

  const renderInput = (name, label, placeholder, type = 'text', icon) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          type={type}
          name={name}
          id={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className={`block w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${icon ? 'pl-10' : ''}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  const renderSelect = (name, label, options, icon) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <select
          name={name}
          id={name}
          value={formData[name] || ''}
          onChange={handleChange}
          className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md`}
        >
          <option value="">Pilih {label}</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <FaUserEdit className="mr-2" />
              Edit Data Anggota Keluarga
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-full transition-colors" title="Tutup">
              <FaTimes className="text-xl" />
            </button>
          </div>

          {anggotaData ? (
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {renderInput('namaLengkap', 'Nama Lengkap', 'Nama Lengkap Anggota', 'text', <FaUserEdit className="text-gray-400" />)}
                {renderInput('nik', 'NIK', 'Nomor Induk Kependudukan', 'text', <FaUserEdit className="text-gray-400" />)}
                {renderInput('tempatLahir', 'Tempat Lahir', 'Kota Tempat Lahir', 'text', <FaBirthdayCake className="text-gray-400" />)}
                {renderInput('tanggalLahir', 'Tanggal Lahir', '', 'date', <FaBirthdayCake className="text-gray-400" />)}
                
                {renderSelect('jenisKelamin', 'Jenis Kelamin', jenisKelaminOptions, <FaVenusMars className="text-gray-400" />)}
                {renderSelect('agama', 'Agama', agamaOptions, <FaPrayingHands className="text-gray-400" />)}
                {renderSelect('statusHubunganDalamKK', 'Status Hubungan dlm KK', statusHubunganOptions, <FaUsers className="text-gray-400" />)}
                {renderSelect('statusPerkawinan', 'Status Perkawinan', statusPerkawinanOptions, <FaHeart className="text-gray-400" />)}
                
                {renderInput('pekerjaan', 'Pekerjaan', 'Jenis Pekerjaan', 'text', <FaBriefcase className="text-gray-400" />)}
                {renderSelect('pendidikanTerakhir', 'Pendidikan Terakhir', pendidikanTerakhirOptions, <FaUserGraduate className="text-gray-400" />)}
                {renderSelect('kewarganegaraan', 'Kewarganegaraan', kewarganegaraanOptions, <FaFlag className="text-gray-400" />)}
                
                {renderInput('nomorTelepon', 'Nomor Telepon', '08xxxxxxxxxx', 'tel', <FaPhone className="text-gray-400" />)}
                {renderInput('email', 'Email', 'email@example.com', 'email', <FaEnvelope className="text-gray-400" />)}
              </div>

              <div className="pt-6 sticky bottom-0 bg-white pb-6 px-6 -mx-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center">
                    <FaSave className="mr-2" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Memuat data anggota...
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditAnggotaFormModal; 