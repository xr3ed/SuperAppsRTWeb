import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaSpinner, FaIdCard, FaUser, FaTransgender, FaHome } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { kartuKeluargaService, wargaService } from '../../services/api';

// Fungsi validasi untuk form
const validateNIK = (nik) => {
  if (!nik) return 'NIK wajib diisi';
  if (!/^\d+$/.test(nik)) return 'NIK hanya boleh berisi angka';
  if (nik.length !== 16) return 'NIK harus 16 digit';
  return '';
};

const validateNama = (nama) => {
  if (!nama) return 'Nama wajib diisi';
  if (nama.length < 3) return 'Nama minimal 3 karakter';
  if (nama.length > 100) return 'Nama maksimal 100 karakter';
  if (!/^[a-zA-Z .,'-]+$/.test(nama)) return 'Nama hanya boleh berisi huruf, spasi, dan tanda baca umum';
  return '';
};

const validateTempatLahir = (tempatLahir) => {
  if (!tempatLahir) return ''; // Opsional
  if (tempatLahir.length < 3) return 'Tempat lahir minimal 3 karakter';
  if (tempatLahir.length > 50) return 'Tempat lahir maksimal 50 karakter';
  return '';
};

const validateTanggalLahir = (tanggalLahir) => {
  if (!tanggalLahir) return ''; // Opsional
  const birthDate = new Date(tanggalLahir);
  const today = new Date();
  
  if (birthDate > today) return 'Tanggal lahir tidak boleh di masa depan';
  
  const ageInYears = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  if (ageInYears > 120) return 'Umur maksimal 120 tahun';
  
  return '';
};

const validateStatusHubungan = (status) => {
  if (!status) return 'Status hubungan wajib diisi';
  const validOptions = ['Kepala Keluarga', 'Istri', 'Anak', 'Cucu', 'Orang Tua', 'Mertua', 'Menantu', 'Famili Lain', 'Lainnya'];
  if (!validOptions.includes(status)) return 'Status hubungan tidak valid';
  return '';
};

const AddAnggotaForm = ({ onBack, onSuccess, kkId }) => {
  const [kartuKeluargaList, setKartuKeluargaList] = useState([]);
  const [selectedKK, setSelectedKK] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingKKDetails, setLoadingKKDetails] = useState(false);
  const [kkDetails, setKKDetails] = useState(null);

  const [anggotaData, setAnggotaData] = useState({
    nik: '',
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    statusHubungan: '',
    agama: '',
    statusPerkawinan: '',
    pekerjaan: '',
    pendidikanTerakhir: '',
    kewarganegaraan: 'WNI'
  });

  useEffect(() => {
    fetchKartuKeluarga();
  }, []);

  useEffect(() => {
    if (kkId) {
      setSelectedKK(kkId);
      fetchKKDetails(kkId);
    }
  }, [kkId]);

  const fetchKartuKeluarga = async () => {
    try {
      setIsLoading(true);
      const data = await kartuKeluargaService.getAllKartuKeluarga();
      setKartuKeluargaList(data);
    } catch (error) {
      console.error('Error fetching kartu keluarga:', error);
      toast.error('Gagal mengambil daftar KK.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKKDetails = async (id) => {
    try {
      setLoadingKKDetails(true);
      const data = await kartuKeluargaService.getKartuKeluargaById(id);
      setKKDetails(data);
    } catch (error) {
      console.error('Error fetching KK details:', error);
    } finally {
      setLoadingKKDetails(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAnggotaData({ ...anggotaData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validasi NIK
    const nikError = validateNIK(anggotaData.nik);
    if (nikError) newErrors.nik = nikError;
    
    // Validasi Nama Lengkap
    const namaError = validateNama(anggotaData.namaLengkap);
    if (namaError) newErrors.namaLengkap = namaError;
    
    // Validasi Jenis Kelamin
    if (!anggotaData.jenisKelamin) {
      newErrors.jenisKelamin = 'Jenis kelamin wajib diisi';
    }
    
    // Validasi Status Hubungan
    const statusError = validateStatusHubungan(anggotaData.statusHubungan);
    if (statusError) newErrors.statusHubungan = statusError;
    
    // Validasi KK dipilih jika tidak ada kkId
    if (!kkId && !selectedKK) {
      newErrors.kartuKeluarga = 'Kartu Keluarga wajib dipilih';
    }
    
    // Validasi tempat lahir (jika diisi)
    if (anggotaData.tempatLahir) {
      const tempatError = validateTempatLahir(anggotaData.tempatLahir);
      if (tempatError) newErrors.tempatLahir = tempatError;
    }
    
    // Validasi tanggal lahir (jika diisi)
    if (anggotaData.tanggalLahir) {
      const tglError = validateTanggalLahir(anggotaData.tanggalLahir);
      if (tglError) newErrors.tanggalLahir = tglError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Format tanggal sebelum kirim ke server
      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString();
      };
      
      // 1. Buat data warga baru
      const wargaResponse = await wargaService.createWarga({
        nik: anggotaData.nik,
        namaLengkap: anggotaData.namaLengkap,
        tempatLahir: anggotaData.tempatLahir,
        tanggalLahir: anggotaData.tanggalLahir ? formatDate(anggotaData.tanggalLahir) : null,
        jenisKelamin: anggotaData.jenisKelamin,
        agama: anggotaData.agama,
        statusPerkawinan: anggotaData.statusPerkawinan,
        pekerjaan: anggotaData.pekerjaan,
        pendidikanTerakhir: anggotaData.pendidikanTerakhir,
        kewarganegaraan: anggotaData.kewarganegaraan
      });
      
      const wargaId = wargaResponse.id;
      
      // 2. Tambahkan warga ke kartu keluarga yang dipilih
      await kartuKeluargaService.addAnggotaKeluarga({
        kartuKeluargaId: parseInt(selectedKK || kkId),
        wargaId,
        statusHubungan: anggotaData.statusHubungan
      });
      
      toast.success('Anggota keluarga berhasil ditambahkan');
      onSuccess();
    } catch (error) {
      console.error('Error adding anggota keluarga:', error);
      let errorDetail = '';
      
      // Dapatkan detail error yang lebih spesifik
      if (error.response) {
        console.error('Error response data:', error.response.data);
        errorDetail = `: ${error.response.data.message || error.response.data || 'Status ' + error.response.status}`;
      } else if (error.request) {
        errorDetail = ': Tidak ada respons dari server';
      } else {
        errorDetail = `: ${error.message}`;
      }
      
      toast.error(`Gagal menambahkan anggota keluarga${errorDetail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKKChange = (e) => {
    const kkId = e.target.value;
    setSelectedKK(kkId);
    if (kkId) {
      fetchKKDetails(kkId);
    } else {
      setKKDetails(null);
    }
  };

  return (
    <div className="space-y-6">
      {!kkId && (
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack} 
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-bold">Tambah Anggota ke KK yang Sudah Ada</h2>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-primary-500 text-3xl" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {!kkId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Kartu Keluarga
              </label>
              <select
                value={selectedKK}
                onChange={handleKKChange}
                className={`w-full p-2 border rounded-md ${errors.selectedKK ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Pilih Kartu Keluarga --</option>
                {kartuKeluargaList.map((kk) => (
                  <option key={kk.id} value={kk.id}>
                    {kk.nomorKK} - {kk.kepalaKeluarga}
                  </option>
                ))}
              </select>
              {errors.selectedKK && <p className="mt-1 text-sm text-red-500">{errors.selectedKK}</p>}
            </div>
          )}

          {(selectedKK || kkId) && (
            <>
              {loadingKKDetails ? (
                <div className="flex justify-center py-4">
                  <FaSpinner className="animate-spin text-primary-500 text-xl" />
                </div>
              ) : kkDetails && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <FaHome className="text-primary-500 mr-2" />
                    <h3 className="font-medium">Detail Kartu Keluarga</h3>
                  </div>
                  <p className="text-sm text-gray-600">No. KK: <span className="font-medium">{kkDetails.nomorKK}</span></p>
                  <p className="text-sm text-gray-600">Kepala Keluarga: <span className="font-medium">{kkDetails.kepalaKeluarga}</span></p>
                  <p className="text-sm text-gray-600">Alamat: <span className="font-medium">{kkDetails.alamat}</span></p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium text-lg border-b pb-2">Data Anggota Keluarga Baru</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaIdCard className="mr-2 text-gray-500" /> NIK
                  </label>
                  <input
                    type="text"
                    name="nik"
                    value={anggotaData.nik}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${errors.nik ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Masukkan NIK (16 digit)"
                    maxLength={16}
                  />
                  {errors.nik && <p className="mt-1 text-sm text-red-500">{errors.nik}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaUser className="mr-2 text-gray-500" /> Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="namaLengkap"
                    value={anggotaData.namaLengkap}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${errors.namaLengkap ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.namaLengkap && <p className="mt-1 text-sm text-red-500">{errors.namaLengkap}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      name="tempatLahir"
                      value={anggotaData.tempatLahir}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.tempatLahir ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Masukkan tempat lahir"
                    />
                    {errors.tempatLahir && <p className="mt-1 text-sm text-red-500">{errors.tempatLahir}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      name="tanggalLahir"
                      value={anggotaData.tanggalLahir}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md ${errors.tanggalLahir ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.tanggalLahir && <p className="mt-1 text-sm text-red-500">{errors.tanggalLahir}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaTransgender className="mr-2 text-gray-500" /> Jenis Kelamin
                  </label>
                  <select
                    name="jenisKelamin"
                    value={anggotaData.jenisKelamin}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${errors.jenisKelamin ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">-- Pilih Jenis Kelamin --</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  {errors.jenisKelamin && <p className="mt-1 text-sm text-red-500">{errors.jenisKelamin}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agama
                  </label>
                  <select
                    name="agama"
                    value={anggotaData.agama}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Pilih Agama --</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Perkawinan
                  </label>
                  <select
                    name="statusPerkawinan"
                    value={anggotaData.statusPerkawinan}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">-- Pilih Status Perkawinan --</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin Tercatat">Kawin Tercatat</option>
                    <option value="Kawin Belum Tercatat">Kawin Belum Tercatat</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pekerjaan
                    </label>
                    <input
                      type="text"
                      name="pekerjaan"
                      value={anggotaData.pekerjaan}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Masukkan jenis pekerjaan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pendidikan Terakhir
                    </label>
                    <select
                      name="pendidikanTerakhir"
                      value={anggotaData.pendidikanTerakhir}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">-- Pilih Pendidikan --</option>
                      <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                      <option value="Belum Tamat SD/Sederajat">Belum Tamat SD/Sederajat</option>
                      <option value="Tamat SD/Sederajat">Tamat SD/Sederajat</option>
                      <option value="SLTP/Sederajat">SLTP/Sederajat</option>
                      <option value="SLTA/Sederajat">SLTA/Sederajat</option>
                      <option value="Diploma I/II">Diploma I/II</option>
                      <option value="Akademi/Diploma III/S. Muda">Akademi/Diploma III/S. Muda</option>
                      <option value="Diploma IV/Strata I">Diploma IV/Strata I</option>
                      <option value="Strata II">Strata II</option>
                      <option value="Strata III">Strata III</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kewarganegaraan
                  </label>
                  <input
                    type="text"
                    name="kewarganegaraan"
                    value={anggotaData.kewarganegaraan}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Masukkan kewarganegaraan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hubungan dalam Keluarga
                  </label>
                  <select
                    name="statusHubungan"
                    value={anggotaData.statusHubungan}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${errors.statusHubungan ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">-- Pilih Status Hubungan --</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Cucu">Cucu</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Mertua">Mertua</option>
                    <option value="Menantu">Menantu</option>
                    <option value="Famili Lain">Famili Lain</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {errors.statusHubungan && <p className="mt-1 text-sm text-red-500">{errors.statusHubungan}</p>}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-md shadow flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      <span>Simpan Anggota Keluarga</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AddAnggotaForm; 