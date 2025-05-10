import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaSave, FaUserPlus, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { kartuKeluargaService, wargaService } from '../../services/api';

// Fungsi validasi untuk form
const validateNIK = (nik) => {
  if (!nik) return 'NIK wajib diisi';
  if (!/^\d+$/.test(nik)) return 'NIK hanya boleh berisi angka';
  if (nik.length !== 16) return 'NIK harus 16 digit';
  return '';
};

const validateNomorKK = (nomorKK) => {
  if (!nomorKK) return 'Nomor KK wajib diisi';
  if (!/^\d+$/.test(nomorKK)) return 'Nomor KK hanya boleh berisi angka';
  if (nomorKK.length !== 16) return 'Nomor KK harus 16 digit';
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

const validateRT = (rt) => {
  if (!rt) return 'RT wajib diisi';
  if (!/^\d{1,3}$/.test(rt)) return 'RT harus berupa angka 1-3 digit';
  return '';
};

const validateRW = (rw) => {
  if (!rw) return 'RW wajib diisi';
  if (!/^\d{1,3}$/.test(rw)) return 'RW harus berupa angka 1-3 digit';
  return '';
};

const validateAlamat = (alamat) => {
  if (!alamat) return 'Alamat wajib diisi';
  if (alamat.length < 5) return 'Alamat terlalu pendek (min. 5 karakter)';
  if (alamat.length > 255) return 'Alamat terlalu panjang (maks. 255 karakter)';
  return '';
};

const validateKodePos = (kodePos) => {
  if (!kodePos) return ''; // Opsional
  if (!/^\d{5}$/.test(kodePos)) return 'Kode pos harus 5 digit angka';
  return '';
};

const validateStatusHubungan = (status) => {
  if (!status) return 'Status hubungan wajib diisi';
  const validOptions = ['Kepala Keluarga', 'Istri', 'Anak', 'Cucu', 'Orang Tua', 'Mertua', 'Menantu', 'Famili Lain', 'Lainnya'];
  if (!validOptions.includes(status)) return 'Status hubungan tidak valid';
  return '';
};

const CreateKKForm = ({ onSuccess, initialData, mode }) => {
  const [step, setStep] = useState(1);
  const [kkData, setKkData] = useState({
    nomorKK: '',
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kabupatenKota: '',
    provinsi: '',
    kodePos: ''
  });

  const [kepalaKeluarga, setKepalaKeluarga] = useState({
    nik: '',
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    statusHubungan: 'Kepala Keluarga',
    agama: '',
    statusPerkawinan: '',
    pekerjaan: '',
    pendidikanTerakhir: '',
    kewarganegaraan: 'WNI'
  });

  const [anggotaKeluarga, setAnggotaKeluarga] = useState([]);
  const [currentAnggota, setCurrentAnggota] = useState({
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalKepalaKeluargaNik, setOriginalKepalaKeluargaNik] = useState(null);
  const [showAnggotaForm, setShowAnggotaForm] = useState(false);

  // Fungsi baru untuk menghapus anggota dari daftar sementara
  const handleHapusAnggotaDariDaftar = (nikToRemove) => {
    setAnggotaKeluarga(prevAnggota => prevAnggota.filter(anggota => anggota.nik !== nikToRemove));
    toast.info('Anggota dihapus dari daftar.');
  };

  useEffect(() => {
    if (mode === 'editKK' && initialData) {
      setKkData({
        nomorKK: initialData.nomorKK || '',
        alamat: initialData.alamat || '',
        rt: initialData.rt || '',
        rw: initialData.rw || '',
        kelurahan: initialData.kelurahan || '',
        kecamatan: initialData.kecamatan || '',
        kabupatenKota: initialData.kabupatenKota || '',
        provinsi: initialData.provinsi || '',
        kodePos: initialData.kodePos || ''
      });

      const kepala = initialData.anggota?.find(a => a.statusHubungan?.toLowerCase() === 'kepala keluarga')?.warga;
      if (kepala) {
        setKepalaKeluarga({
          nik: kepala.nik || '',
          namaLengkap: kepala.namaLengkap || '',
          tempatLahir: kepala.tempatLahir || '',
          tanggalLahir: kepala.tanggalLahir ? new Date(kepala.tanggalLahir).toISOString().split('T')[0] : '',
          jenisKelamin: kepala.jenisKelamin || '',
          statusHubungan: 'Kepala Keluarga',
          agama: kepala.agama || '',
          statusPerkawinan: kepala.statusPerkawinan || '',
          pekerjaan: kepala.pekerjaan || '',
          pendidikanTerakhir: kepala.pendidikanTerakhir || '',
          kewarganegaraan: kepala.kewarganegaraan || 'WNI'
        });
        setOriginalKepalaKeluargaNik(kepala.nik);
      } else {
        setKepalaKeluarga({
          nik: '',
          namaLengkap: '',
          tempatLahir: '',
          tanggalLahir: '',
          jenisKelamin: '',
          statusHubungan: 'Kepala Keluarga',
          agama: '',
          statusPerkawinan: '',
          pekerjaan: '',
          pendidikanTerakhir: '',
          kewarganegaraan: 'WNI'
        });
        setOriginalKepalaKeluargaNik(null);
      }
      setStep(1);
      setAnggotaKeluarga([]);
    } else {
      setKkData({ nomorKK: '', alamat: '', rt: '', rw: '', kelurahan: '', kecamatan: '', kabupatenKota: '', provinsi: '', kodePos: '' });
      setKepalaKeluarga({ nik: '', namaLengkap: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: '', statusHubungan: 'Kepala Keluarga', agama: '', statusPerkawinan: '', pekerjaan: '', pendidikanTerakhir: '', kewarganegaraan: 'WNI' });
      setAnggotaKeluarga([]);
      setCurrentAnggota({ nik: '', namaLengkap: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: '', statusHubungan: '', agama: '', statusPerkawinan: '', pekerjaan: '', pendidikanTerakhir: '', kewarganegaraan: 'WNI' });
      setStep(1);
      setOriginalKepalaKeluargaNik(null);
    }
  }, [mode, initialData]);

  const handleKKInputChange = (e) => {
    const { name, value } = e.target;
    setKkData({ ...kkData, [name]: value });
  };

  const handleKepalaKeluargaInputChange = (e) => {
    const { name, value } = e.target;
    setKepalaKeluarga({ ...kepalaKeluarga, [name]: value });
  };

  const handleAnggotaInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAnggota({ ...currentAnggota, [name]: value });
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Validasi Nomor KK
    const nomorKKError = validateNomorKK(kkData.nomorKK);
    if (nomorKKError) newErrors.nomorKK = nomorKKError;
    
    // Validasi Alamat
    const alamatError = validateAlamat(kkData.alamat);
    if (alamatError) newErrors.alamat = alamatError;
    
    // Validasi RT
    const rtError = validateRT(kkData.rt);
    if (rtError) newErrors.rt = rtError;
    
    // Validasi RW
    const rwError = validateRW(kkData.rw);
    if (rwError) newErrors.rw = rwError;
    
    // Validasi Kode Pos (opsional)
    if (kkData.kodePos) {
      const kodePosError = validateKodePos(kkData.kodePos);
      if (kodePosError) newErrors.kodePos = kodePosError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    // Validasi NIK
    const nikError = validateNIK(kepalaKeluarga.nik);
    if (nikError) newErrors.kepalaKeluargaNik = nikError;
    
    // Validasi Nama
    const namaError = validateNama(kepalaKeluarga.namaLengkap);
    if (namaError) newErrors.kepalaKeluargaNama = namaError;
    
    // Validasi Jenis Kelamin
    if (!kepalaKeluarga.jenisKelamin) 
      newErrors.kepalaKeluargaJK = 'Jenis kelamin wajib diisi';
    
    // Validasi Tanggal Lahir (jika diisi)
    if (kepalaKeluarga.tanggalLahir) {
      const tanggalError = validateTanggalLahir(kepalaKeluarga.tanggalLahir);
      if (tanggalError) newErrors.kepalaKeluargaTglLahir = tanggalError;
    }
    
    // Validasi Tempat Lahir (jika diisi)
    if (kepalaKeluarga.tempatLahir) {
      const tempatError = validateTempatLahir(kepalaKeluarga.tempatLahir);
      if (tempatError) newErrors.kepalaKeluargaTempatLahir = tempatError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAnggota = () => {
    const newErrors = {};
    
    // Validasi NIK
    const nikError = validateNIK(currentAnggota.nik);
    if (nikError) newErrors.anggotaNik = nikError;
    
    // Validasi Nama
    const namaError = validateNama(currentAnggota.namaLengkap);
    if (namaError) newErrors.anggotaNama = namaError;
    
    // Validasi Jenis Kelamin
    if (!currentAnggota.jenisKelamin) 
      newErrors.anggotaJK = 'Jenis kelamin wajib diisi';
    
    // Validasi Status Hubungan
    const statusError = validateStatusHubungan(currentAnggota.statusHubungan);
    if (statusError) newErrors.anggotaStatus = statusError;
    
    // Validasi Tanggal Lahir (jika diisi)
    if (currentAnggota.tanggalLahir) {
      const tanggalError = validateTanggalLahir(currentAnggota.tanggalLahir);
      if (tanggalError) newErrors.anggotaTglLahir = tanggalError;
    }
    
    // Validasi Tempat Lahir (jika diisi)
    if (currentAnggota.tempatLahir) {
      const tempatError = validateTempatLahir(currentAnggota.tempatLahir);
      if (tempatError) newErrors.anggotaTempatLahir = tempatError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setShowAnggotaForm(false);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      setShowAnggotaForm(false);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setShowAnggotaForm(false);
  };

  const handleTambahAnggota = () => {
    if (validateAnggota()) {
      setAnggotaKeluarga([...anggotaKeluarga, { ...currentAnggota }]);
      setCurrentAnggota({
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
      setErrors({});
      setShowAnggotaForm(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'editKK') {
      if (!validateStep1() || !validateStep2()) {
        toast.warn('Data KK atau Kepala Keluarga belum lengkap atau valid.');
        if (!validateStep1()) setStep(1);
        else if (!validateStep2()) setStep(2);
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = {
          nomorKK: kkData.nomorKK,
          alamat: kkData.alamat,
          rt: kkData.rt,
          rw: kkData.rw,
          kelurahan: kkData.kelurahan,
          kecamatan: kkData.kecamatan,
          kabupatenKota: kkData.kabupatenKota,
          provinsi: kkData.provinsi,
          kodePos: kkData.kodePos,
          kepalaKeluargaData: {
            nik: kepalaKeluarga.nik,
            namaLengkap: kepalaKeluarga.namaLengkap,
            tempatLahir: kepalaKeluarga.tempatLahir,
            tanggalLahir: kepalaKeluarga.tanggalLahir,
            jenisKelamin: kepalaKeluarga.jenisKelamin,
            agama: kepalaKeluarga.agama,
            statusPerkawinan: kepalaKeluarga.statusPerkawinan,
            pekerjaan: kepalaKeluarga.pekerjaan,
            pendidikanTerakhir: kepalaKeluarga.pendidikanTerakhir,
            kewarganegaraan: kepalaKeluarga.kewarganegaraan,
            originalNik: originalKepalaKeluargaNik !== kepalaKeluarga.nik ? originalKepalaKeluargaNik : undefined
          }
        };
        
        await kartuKeluargaService.updateKartuKeluarga(initialData.id, payload);
        toast.success('Data Kartu Keluarga berhasil diperbarui.');
        onSuccess();
      } catch (error) {
        console.error('Error updating Kartu Keluarga:', error);
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data.';
        toast.error(`Gagal Update: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    } else { // Handle 'add' mode
      console.log('[CreateKKForm] handleSubmit initiated for ADD mode.');
      
      console.log('[CreateKKForm] Validating Step 1...');
      if (!validateStep1()) {
        console.log('[CreateKKForm] Step 1 validation FAILED.');
        setStep(1);
        toast.warn('Data Kartu Keluarga (Step 1) belum lengkap atau valid.');
        return;
      }
      console.log('[CreateKKForm] Step 1 validation PASSED.');
      
      console.log('[CreateKKForm] Validating Step 2...');
      if (!validateStep2()) {
        console.log('[CreateKKForm] Step 2 validation FAILED.');
        setStep(2);
        toast.warn('Data Kepala Keluarga (Step 2) belum lengkap atau valid.');
        return;
      }
      console.log('[CreateKKForm] Step 2 validation PASSED.');
      
      console.log('[CreateKKForm] Validating currentAnggota (if anggotaKeluarga list is not empty)...');
      // if (anggotaKeluarga.length > 0 && !validateAnggota()) { 
      // Modifikasi: Validasi anggota yang sedang diinput hanya jika formnya tidak kosong
      // dan pengguna belum mengklik "Tambah Anggota Ini". 
      // Namun, untuk alur yang lebih bersih, kita serahkan validasi ke tombol "Tambah Anggota Ini".
      // Jika pengguna langsung klik "Simpan KK", data di form currentAnggota yang belum ditambahkan akan diabaikan.
      const isCurrentAnggotaFormFilled = Object.values(currentAnggota).some(val => {
        // Check if the value is not empty, not 'WNI' (default for kewarganegaraan), and not 'Kepala Keluarga' (default for statusHubungan in kepalaKeluarga state)
        // For currentAnggota, statusHubungan should be checked against its typical empty initial state or selected values other than 'Kepala Keluarga'
        if (typeof val === 'string') {
          return val !== '' && val !== 'WNI';
        }
        return val !== null && val !== undefined;
      });

      if (isCurrentAnggotaFormFilled && !validateAnggota()) {
        // This validation will run if the currentAnggota form has some data typed in but not yet added via "Tambah Anggota Ini"
        console.log('[CreateKKForm] currentAnggota form is filled but not validated.');
        setStep(3);
        toast.warn('Data Anggota Keluarga yang sedang Anda input (Step 3) belum lengkap atau valid. Silakan tambahkan atau kosongkan form sebelum menyimpan KK.');
        return;
      }
      console.log('[CreateKKForm] currentAnggota validation PASSED (or form is empty/not dirty).');

      console.log('[CreateKKForm] All pre-submit validations passed. Setting isSubmitting to true.');
      setIsSubmitting(true);
      try {
        console.log('[CreateKKForm] Entering TRY block for API calls.');
        const formatDate = (dateString) => {
          if (!dateString) return null;
          const date = new Date(dateString);
          return date.toISOString();
        };

        // 1. Create Kepala Keluarga Warga
        console.log('[CreateKKForm] Step 1 API: Creating Kepala Keluarga Warga...');
        const kepalaWargaPayload = {
          ...kepalaKeluarga,
          tanggalLahir: kepalaKeluarga.tanggalLahir ? formatDate(kepalaKeluarga.tanggalLahir) : null
        };
        delete kepalaWargaPayload.statusHubungan; 
        console.log('[CreateKKForm] Kepala Keluarga Warga Payload:', kepalaWargaPayload);
        
        const kepalaWargaResponse = await wargaService.createWarga(kepalaWargaPayload);
        const kepalaKeluargaWargaId = kepalaWargaResponse.id;

        if (!kepalaKeluargaWargaId) {
          console.error('[CreateKKForm] API Error: Failed to create Kepala Keluarga Warga or retrieve ID.');
          throw new Error('Failed to create Kepala Keluarga Warga or retrieve ID.');
        }
        console.log(`[CreateKKForm] API Success: Kepala Keluarga Warga created with ID: ${kepalaKeluargaWargaId}`);
        
        // 2. Create Kartu Keluarga with kepalaKeluargaId
        console.log('[CreateKKForm] Step 2 API: Creating Kartu Keluarga...');
        const kkCreationPayload = {
          ...kkData,
          kepalaKeluargaId: kepalaKeluargaWargaId 
        };
        console.log('[CreateKKForm] Kartu Keluarga Payload:', kkCreationPayload);
        
        const kkResponse = await kartuKeluargaService.createKartuKeluarga(kkCreationPayload);
        const kartuKeluargaId = kkResponse.data.id;

        if (!kartuKeluargaId) {
          console.error('[CreateKKForm] API Error: Failed to create Kartu Keluarga or retrieve ID.');
          throw new Error('Failed to create Kartu Keluarga or retrieve ID.');
        }
        console.log(`[CreateKKForm] API Success: Kartu Keluarga created with ID: ${kartuKeluargaId}`);

        // 4. Process other Anggota Keluarga
        if (anggotaKeluarga.length > 0) {
            console.log(`[CreateKKForm] Step 4 API: Processing ${anggotaKeluarga.length} other Anggota Keluarga.`);
        }
        for (const anggota of anggotaKeluarga) {
          console.log(`[CreateKKForm] Processing anggota: ${anggota.namaLengkap}`);
          const anggotaWargaPayload = { 
            ...anggota,
            tanggalLahir: anggota.tanggalLahir ? formatDate(anggota.tanggalLahir) : null
          };
          delete anggotaWargaPayload.statusHubungan;
          console.log(`[CreateKKForm] Anggota Warga Payload (${anggota.namaLengkap}):`, anggotaWargaPayload);
          
          const anggotaWargaResponse = await wargaService.createWarga(anggotaWargaPayload);
          const anggotaWargaId = anggotaWargaResponse.id;

          if (!anggotaWargaId) {
            console.warn(`[CreateKKForm] API Warning: Failed to create Warga for NIK ${anggota.nik}, skipping this member.`);
            continue; 
          }
          console.log(`[CreateKKForm] API Success: Anggota Warga ${anggota.namaLengkap} created with ID: ${anggotaWargaId}`);

          console.log(`[CreateKKForm] Linking Anggota Warga ${anggotaWargaId} to KK ${kartuKeluargaId}.`);
          await kartuKeluargaService.addAnggotaKeluarga({
            kartuKeluargaId,
            wargaId: anggotaWargaId,
            statusHubungan: anggota.statusHubungan 
          });
          console.log(`[CreateKKForm] API Success: Anggota Warga ${anggota.namaLengkap} linked.`);
        }
        
        console.log('[CreateKKForm] All API calls successful. KK and all members created and linked.');
        toast.success('Kartu Keluarga baru berhasil dibuat beserta anggotanya.');
        onSuccess();
      } catch (error) {
        console.error('[CreateKKForm] CATCH block: Error creating KK and members:', error);
        let errorDetail = '';
     
        if (error.response) {
          console.error('[CreateKKForm] CATCH block: Error response data:', error.response.data);
          errorDetail = `: ${error.response.data.message || JSON.stringify(error.response.data) || 'Status ' + error.response.status}`;
        } else if (error.request) {
          console.error('[CreateKKForm] CATCH block: Error request data (no response from server):', error.request);
          errorDetail = ': Tidak ada respons dari server. Periksa koneksi atau status server.';
        } else {
          console.error('[CreateKKForm] CATCH block: Generic error (e.g., network issue, client-side error before send):', error.message);
          errorDetail = `: ${error.message}`;
        }
     
        toast.error(`Gagal menyimpan data${errorDetail}`);
      } finally {
        console.log('[CreateKKForm] Entering FINALLY block, setting isSubmitting to false.');
        setIsSubmitting(false);
      }
    }
  };

  const isEditMode = mode === 'editKK';

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4 text-center">{isEditMode ? 'Formulir Edit Kartu Keluarga' : 'Formulir Pembuatan Kartu Keluarga'}</h3>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          1
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          2
        </div>
        {!isEditMode && (
          <>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
          </>
        )}
      </div>

      {/* Step 1: Data KK */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium">Data Kartu Keluarga</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor KK
              </label>
              <input
                type="text"
                name="nomorKK"
                value={kkData.nomorKK}
                onChange={handleKKInputChange}
                className={`w-full p-2 border rounded-md ${errors.nomorKK ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Masukkan nomor KK (16 digit)"
                maxLength={16}
              />
              {errors.nomorKK && <p className="mt-1 text-sm text-red-500">{errors.nomorKK}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                name="alamat"
                value={kkData.alamat}
                onChange={handleKKInputChange}
                className={`w-full p-2 border rounded-md ${errors.alamat ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Masukkan alamat lengkap"
                rows="3"
              />
              {errors.alamat && <p className="mt-1 text-sm text-red-500">{errors.alamat}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RT
                </label>
                <input
                  type="text"
                  name="rt"
                  value={kkData.rt}
                  onChange={handleKKInputChange}
                  className={`w-full p-2 border rounded-md ${errors.rt ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="RT"
                />
                {errors.rt && <p className="mt-1 text-sm text-red-500">{errors.rt}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RW
                </label>
                <input
                  type="text"
                  name="rw"
                  value={kkData.rw}
                  onChange={handleKKInputChange}
                  className={`w-full p-2 border rounded-md ${errors.rw ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="RW"
                />
                {errors.rw && <p className="mt-1 text-sm text-red-500">{errors.rw}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelurahan/Desa
              </label>
              <input
                type="text"
                name="kelurahan"
                value={kkData.kelurahan}
                onChange={handleKKInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Masukkan kelurahan/desa (opsional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                name="kecamatan"
                value={kkData.kecamatan}
                onChange={handleKKInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Masukkan kecamatan (opsional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                name="kodePos"
                value={kkData.kodePos}
                onChange={handleKKInputChange}
                className={`w-full p-2 border rounded-md ${errors.kodePos ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Masukkan kode pos (5 digit)"
                maxLength={5}
              />
              {errors.kodePos && <p className="mt-1 text-sm text-red-500">{errors.kodePos}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleNextStep}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
              disabled={isSubmitting}
            >
              Lanjut <FaArrowRight className="ml-2" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Kepala Keluarga */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium">Data Kepala Keluarga</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIK
              </label>
              <input
                type="text"
                name="nik"
                value={kepalaKeluarga.nik}
                onChange={handleKepalaKeluargaInputChange}
                className={`w-full p-2 border rounded-md ${errors.kepalaKeluargaNik ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Masukkan NIK (16 digit)"
                maxLength={16}
              />
              {errors.kepalaKeluargaNik && <p className="mt-1 text-sm text-red-500">{errors.kepalaKeluargaNik}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="namaLengkap"
                value={kepalaKeluarga.namaLengkap}
                onChange={handleKepalaKeluargaInputChange}
                className={`w-full p-2 border rounded-md ${errors.kepalaKeluargaNama ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.kepalaKeluargaNama && <p className="mt-1 text-sm text-red-500">{errors.kepalaKeluargaNama}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={kepalaKeluarga.tempatLahir}
                  onChange={handleKepalaKeluargaInputChange}
                  className={`w-full p-2 border rounded-md ${errors.kepalaKeluargaTempatLahir ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Tempat lahir"
                />
                {errors.kepalaKeluargaTempatLahir && <p className="mt-1 text-sm text-red-500">{errors.kepalaKeluargaTempatLahir}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={kepalaKeluarga.tanggalLahir}
                  onChange={handleKepalaKeluargaInputChange}
                  className={`w-full p-2 border rounded-md ${errors.kepalaKeluargaTglLahir ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.kepalaKeluargaTglLahir && <p className="mt-1 text-sm text-red-500">{errors.kepalaKeluargaTglLahir}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                name="jenisKelamin"
                value={kepalaKeluarga.jenisKelamin}
                onChange={handleKepalaKeluargaInputChange}
                className={`w-full p-2 border rounded-md ${errors.kepalaKeluargaJK ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">-- Pilih Jenis Kelamin --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {errors.kepalaKeluargaJK && <p className="mt-1 text-sm text-red-500">{errors.kepalaKeluargaJK}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <select
                name="agama"
                value={kepalaKeluarga.agama}
                onChange={handleKepalaKeluargaInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Pilih Agama --</option>
                <option value="Islam">Islam</option>
                <option value="Kristen Protestan">Kristen Protestan</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Khonghucu">Khonghucu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Perkawinan
              </label>
              <select
                name="statusPerkawinan"
                value={kepalaKeluarga.statusPerkawinan}
                onChange={handleKepalaKeluargaInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Pilih Status Perkawinan --</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
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
                  value={kepalaKeluarga.pekerjaan}
                  onChange={handleKepalaKeluargaInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Pekerjaan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pendidikan Terakhir
                </label>
                <select
                  name="pendidikanTerakhir"
                  value={kepalaKeluarga.pendidikanTerakhir}
                  onChange={handleKepalaKeluargaInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Pilih Pendidikan --</option>
                  <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                  <option value="SD/Sederajat">SD/Sederajat</option>
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
                value={kepalaKeluarga.kewarganegaraan}
                onChange={handleKepalaKeluargaInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Kewarganegaraan (misal: WNI)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Hubungan
              </label>
              <input
                type="text"
                name="statusHubungan"
                value={kepalaKeluarga.statusHubungan}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-between">
            <button
              onClick={handlePrevStep}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              disabled={isSubmitting}
            >
              <FaArrowLeft className="mr-2" /> Kembali
            </button>
            
            {!isEditMode && (
              <button
                onClick={handleNextStep}
                className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                disabled={isSubmitting}
              >
                Lanjut ke Anggota <FaArrowRight className="ml-2" />
              </button>
            )}
            {isEditMode && (
              <button
                onClick={handleSubmit} 
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                disabled={isSubmitting}
              >
                <FaSave className="mr-2" /> {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 3: Anggota Keluarga */}
      {step === 3 && !isEditMode && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-1 text-gray-700">Step 3: Tambah Anggota Keluarga (Opsional)</h3>
            <p className="text-sm text-gray-500 mb-4">Tambahkan anggota keluarga lainnya. Jika tidak ada, Anda bisa langsung menyimpan Kartu Keluarga.</p>
            
            {/* Summary Kepala Keluarga */}
            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50 shadow-sm">
              <h4 className="text-md font-semibold text-blue-700 mb-2">Kepala Keluarga (dari Step 2):</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p><span className="font-medium">NIK:</span> {kepalaKeluarga.nik}</p>
                <p><span className="font-medium">Nama:</span> {kepalaKeluarga.namaLengkap}</p>
                <p><span className="font-medium">Jenis Kelamin:</span> {kepalaKeluarga.jenisKelamin}</p>
                {kepalaKeluarga.tempatLahir && <p><span className="font-medium">Tempat Lahir:</span> {kepalaKeluarga.tempatLahir}</p>}
                {kepalaKeluarga.tanggalLahir && <p><span className="font-medium">Tanggal Lahir:</span> {new Date(kepalaKeluarga.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>}
              </div>
            </div>

            {/* Daftar Anggota Keluarga yang Sudah Ditambahkan */}
            {anggotaKeluarga.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Anggota Keluarga Telah Ditambahkan:</h4>
                <div className="space-y-3">
                  {anggotaKeluarga.map((anggota, index) => (
                    <div key={anggota.nik || index} className="p-3 border rounded-md bg-gray-50 shadow-sm flex justify-between items-center hover:bg-gray-100 transition-colors duration-150">
                      <div>
                        <p className="font-medium text-gray-800">{anggota.namaLengkap} <span className="text-xs text-gray-500">({anggota.statusHubungan})</span></p>
                        <p className="text-sm text-gray-600">NIK: {anggota.nik}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleHapusAnggotaDariDaftar(anggota.nik)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100"
                        aria-label={`Hapus ${anggota.namaLengkap}`}
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <hr className="my-6"/>

            {!showAnggotaForm && (
              <div className="text-center my-6">
                <button
                  type="button"
                  onClick={() => setShowAnggotaForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out"
                >
                  <FaUserPlus className="mr-2"/> Tambah Anggota Keluarga Baru
                </button>
              </div>
            )}

            {showAnggotaForm && (
              <>
                <h4 className="text-md font-semibold text-gray-700 mb-3">Form Tambah Anggota Baru:</h4>
                {/* Form untuk currentAnggota - pastikan semua input ada di sini */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 mb-6">
                  {/* NIK Anggota */}
                  <div>
                    <label htmlFor={`anggota-nik-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">NIK Anggota</label>
                    <input
                      type="text"
                      id={`anggota-nik-${anggotaKeluarga.length}`}
                      name="nik"
                      value={currentAnggota.nik}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaNik ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="16 digit NIK"
                      maxLength={16}
                    />
                    {errors.anggotaNik && <p className="text-red-500 text-xs mt-1">{errors.anggotaNik}</p>}
                  </div>
                  {/* Nama Lengkap Anggota */}
                  <div>
                    <label htmlFor={`anggota-namaLengkap-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      id={`anggota-namaLengkap-${anggotaKeluarga.length}`}
                      name="namaLengkap"
                      value={currentAnggota.namaLengkap}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaNama ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.anggotaNama && <p className="text-red-500 text-xs mt-1">{errors.anggotaNama}</p>}
                  </div>
                  {/* Tempat Lahir Anggota */}
                  <div>
                    <label htmlFor={`anggota-tempatLahir-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      id={`anggota-tempatLahir-${anggotaKeluarga.length}`}
                      name="tempatLahir"
                      value={currentAnggota.tempatLahir}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaTempatLahir ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="Tempat lahir"
                    />
                    {errors.anggotaTempatLahir && <p className="text-red-500 text-xs mt-1">{errors.anggotaTempatLahir}</p>}
                  </div>
                  {/* Tanggal Lahir Anggota */}
                  <div>
                    <label htmlFor={`anggota-tanggalLahir-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      id={`anggota-tanggalLahir-${anggotaKeluarga.length}`}
                      name="tanggalLahir"
                      value={currentAnggota.tanggalLahir}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaTglLahir ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    />
                    {errors.anggotaTglLahir && <p className="text-red-500 text-xs mt-1">{errors.anggotaTglLahir}</p>}
                  </div>
                  {/* Jenis Kelamin Anggota */}
                  <div>
                    <label htmlFor={`anggota-jenisKelamin-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <select
                      id={`anggota-jenisKelamin-${anggotaKeluarga.length}`}
                      name="jenisKelamin"
                      value={currentAnggota.jenisKelamin}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaJK ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    >
                      <option value="">-- Pilih Jenis Kelamin --</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    {errors.anggotaJK && <p className="text-red-500 text-xs mt-1">{errors.anggotaJK}</p>}
                  </div>
                  {/* Agama Anggota */}
                  <div>
                    <label htmlFor={`anggota-agama-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                    <select
                      id={`anggota-agama-${anggotaKeluarga.length}`}
                      name="agama"
                      value={currentAnggota.agama}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaAgama ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    >
                      <option value="">-- Pilih Agama --</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen Protestan">Kristen Protestan</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Khonghucu">Khonghucu</option>
                    </select>
                    {errors.anggotaAgama && <p className="text-red-500 text-xs mt-1">{errors.anggotaAgama}</p>}
                  </div>
                  {/* Status Perkawinan Anggota */}
                  <div>
                    <label htmlFor={`anggota-statusPerkawinan-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
                    <select
                      id={`anggota-statusPerkawinan-${anggotaKeluarga.length}`}
                      name="statusPerkawinan"
                      value={currentAnggota.statusPerkawinan}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaStatusPerkawinan ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    >
                      <option value="">-- Pilih Status Perkawinan --</option>
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                    {errors.anggotaStatusPerkawinan && <p className="text-red-500 text-xs mt-1">{errors.anggotaStatusPerkawinan}</p>}
                  </div>
                  {/* Pekerjaan Anggota */}
                  <div>
                    <label htmlFor={`anggota-pekerjaan-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                    <input
                      type="text"
                      id={`anggota-pekerjaan-${anggotaKeluarga.length}`}
                      name="pekerjaan"
                      value={currentAnggota.pekerjaan}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaPekerjaan ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="Pekerjaan"
                    />
                    {errors.anggotaPekerjaan && <p className="text-red-500 text-xs mt-1">{errors.anggotaPekerjaan}</p>}
                  </div>
                  {/* Pendidikan Terakhir Anggota */}
                  <div>
                    <label htmlFor={`anggota-pendidikanTerakhir-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
                    <select
                      id={`anggota-pendidikanTerakhir-${anggotaKeluarga.length}`}
                      name="pendidikanTerakhir"
                      value={currentAnggota.pendidikanTerakhir}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaPendidikanTerakhir ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    >
                      <option value="">-- Pilih Pendidikan --</option>
                      <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                      <option value="SD/Sederajat">SD/Sederajat</option>
                      <option value="SLTP/Sederajat">SLTP/Sederajat</option>
                      <option value="SLTA/Sederajat">SLTA/Sederajat</option>
                      <option value="Diploma I/II">Diploma I/II</option>
                      <option value="Akademi/Diploma III/S. Muda">Akademi/Diploma III/S. Muda</option>
                      <option value="Diploma IV/Strata I">Diploma IV/Strata I</option>
                      <option value="Strata II">Strata II</option>
                      <option value="Strata III">Strata III</option>
                    </select>
                    {errors.anggotaPendidikanTerakhir && <p className="text-red-500 text-xs mt-1">{errors.anggotaPendidikanTerakhir}</p>}
                  </div>
                  {/* Kewarganegaraan Anggota */}
                  <div>
                    <label htmlFor={`anggota-kewarganegaraan-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                    <input
                      type="text"
                      id={`anggota-kewarganegaraan-${anggotaKeluarga.length}`}
                      name="kewarganegaraan"
                      value={currentAnggota.kewarganegaraan}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaKewarganegaraan ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="Kewarganegaraan (misal: WNI)"
                    />
                    {errors.anggotaKewarganegaraan && <p className="text-red-500 text-xs mt-1">{errors.anggotaKewarganegaraan}</p>}
                  </div>
                  {/* Status Hubungan Anggota */}
                  <div className="md:col-span-2">
                    <label htmlFor={`anggota-statusHubungan-${anggotaKeluarga.length}`} className="block text-sm font-medium text-gray-700 mb-1">Status Hubungan Dalam Keluarga</label>
                    <select
                      id={`anggota-statusHubungan-${anggotaKeluarga.length}`}
                      name="statusHubungan"
                      value={currentAnggota.statusHubungan}
                      onChange={handleAnggotaInputChange}
                      className={`w-full p-2 border rounded-md shadow-sm ${errors.anggotaStatus ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
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
                    {errors.anggotaStatus && <p className="text-red-500 text-xs mt-1">{errors.anggotaStatus}</p>}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentAnggota({
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
                      setErrors({});
                      setShowAnggotaForm(false);
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleTambahAnggota}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <FaUserPlus className="mr-2"/> Tambah Anggota Ini ke Daftar
                  </button>
                </div>
              </>
            )}
            
            <hr className="my-8"/>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors shadow-sm"
              >
                <FaArrowLeft className="mr-2" /> Kembali ke Data Kepala Keluarga
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><FaSpinner className="animate-spin mr-2" /> Menyimpan...</>
                ) : (
                  <><FaSave className="mr-2" /> Simpan Kartu Keluarga {anggotaKeluarga.length > 0 ? `(+ ${anggotaKeluarga.length} Anggota)` : '(Hanya Kepala Keluarga)'}</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateKKForm; 