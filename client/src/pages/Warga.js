import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaHome, FaPlus, FaSpinner, FaEye, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { wargaService, kartuKeluargaService } from '../services/api';
import WargaSidebar from '../components/warga/WargaSidebar';
import RegistrasiKeluargaModal from '../components/kartuKeluarga/RegistrasiKeluargaModal';
import DetailKartuKeluargaPanel from '../components/kartuKeluarga/DetailKartuKeluargaPanel';
import WargaFilterComponent from '../components/warga/WargaFilterComponent';
import ColumnSelectorModal from '../components/modals/ColumnSelectorModal';
import DetailAnggotaModal from '../components/kartuKeluarga/DetailAnggotaModal';
import EditAnggotaFormModal from '../components/kartuKeluarga/EditAnggotaFormModal';

// Define these constants outside the component if they don't depend on component props or state
// Or inside if they are closely tied to the component's specific logic / props
const ALL_EXPORTABLE_COLUMNS = [
  { key: 'nik', label: 'NIK' },
  { key: 'namaLengkap', label: 'Nama Lengkap' },
  { key: 'jenisKelamin', label: 'Jenis Kelamin' },
  { key: 'tempatLahir', label: 'Tempat Lahir' },
  { key: 'tanggalLahir', label: 'Tgl Lahir (YYYY-MM-DD)' },
  { key: 'agama', label: 'Agama' },
  { key: 'statusPerkawinan', label: 'Status Perkawinan' },
  { key: 'pekerjaan', label: 'Pekerjaan' },
  { key: 'pendidikanTerakhir', label: 'Pendidikan Terakhir'},
  { key: 'nomorTelepon', label: 'Nomor Telepon' },
  { key: 'email', label: 'Email' },
  { key: 'nomorKK', label: 'Nomor KK' }, 
  { key: 'alamatKK', label: 'Alamat (dari KK)' },
  { key: 'statusHubunganDalamKK', label: 'Status Hub. dlm KK'},
  { key: 'kewarganegaraan', label: 'Kewarganegaraan'}
];

const DEFAULT_EXPORT_COLUMNS = ['nik', 'namaLengkap', 'jenisKelamin', 'tempatLahir', 'tanggalLahir', 'agama', 'statusPerkawinan', 'pekerjaan', 'nomorKK'];

const Warga = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState('kk');
  
  // Original Warga (individu) state
  const [wargaList, setWargaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk filter warga individu
  const initialFilterParams = {
    search: '',
    agama: '',
    jenisKelamin: '',
    statusPerkawinan: '',
    pekerjaan: '',
    pendidikanTerakhir: '',
    usia: '', 
    usiaOperator: '', 
    hanyaKepalaKeluarga: false,
  };
  const [filterParams, setFilterParams] = useState(initialFilterParams);
  const [isExporting, setIsExporting] = useState(false);

  // State untuk pemilihan kolom ekspor
  const [selectedExportColumns, setSelectedExportColumns] = useState(DEFAULT_EXPORT_COLUMNS);
  const [isColumnSelectorModalOpen, setIsColumnSelectorModalOpen] = useState(false);
  const [exportFormatInProgress, setExportFormatInProgress] = useState(null);

  // KK management state
  const [kartuKeluargaList, setKartuKeluargaList] = useState([]);
  const [isLoadingKK, setIsLoadingKK] = useState(true);
  const [showRegistrasiModal, setShowRegistrasiModal] = useState(false);
  const [selectedKK, setSelectedKK] = useState(null);
  const [isDeletingWarga, setIsDeletingWarga] = useState(false);
  const [isDeletingKK, setIsDeletingKK] = useState(false);
  const [isDeletingAnggota, setIsDeletingAnggota] = useState(false);
  const [detailPanelRefreshCounter, setDetailPanelRefreshCounter] = useState(0);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [anggotaToDeleteId, setAnggotaToDeleteId] = useState(null);
  const [wargaToDeleteId, setWargaToDeleteId] = useState(null);
  const [kkToDeleteId, setKkToDeleteId] = useState(null);
  const [kkIdForAddingAnggota, setKkIdForAddingAnggota] = useState(null);
  const [kkToEditData, setKkToEditData] = useState(null);
  const [registrasiModalMode, setRegistrasiModalMode] = useState('add');

  // State untuk modal edit anggota
  const [isEditAnggotaModalOpen, setIsEditAnggotaModalOpen] = useState(false);
  const [editingAnggotaData, setEditingAnggotaData] = useState(null);
  const [currentKkIdContextForEdit, setCurrentKkIdContextForEdit] = useState(null);

  // State untuk CV-like Modal
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [selectedWargaForCvModal, setSelectedWargaForCvModal] = useState(null);

  // Fungsi fetchWarga dengan useCallback
  const fetchWarga = useCallback(async (currentFiltersToApply) => {
    console.log('[Warga.js] fetchWarga called with currentFiltersToApply:', currentFiltersToApply);
    setIsLoading(true);
    try {
      const activeFilters = {};
      // Proses currentFiltersToApply untuk membuat activeFilters
      for (const key in currentFiltersToApply) { 
        if (currentFiltersToApply[key] !== '' && currentFiltersToApply[key] !== null && currentFiltersToApply[key] !== false) {
          activeFilters[key] = currentFiltersToApply[key];
        }
      }
      if (currentFiltersToApply.hanyaKepalaKeluarga === true) {
        activeFilters.hanyaKepalaKeluarga = 'true';
      }
      console.log('[Warga.js] fetchWarga - activeFilters to be sent to service:', activeFilters);

      const data = await wargaService.getAllWarga(activeFilters);
      setWargaList(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching warga:', err);
      setError('Gagal memuat data warga. Silakan coba lagi nanti.');
      setWargaList([]); // Kosongkan list jika error
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies fetchWarga kosong karena ia generik

  useEffect(() => {
    if (activeTab === 'individu') {
      console.log('[Warga.js] useEffect for activeTab individu - fetching with current filterParams:', filterParams);
      fetchWarga(filterParams);
    } else {
      fetchKartuKeluarga();
    }
  }, [activeTab, fetchWarga, filterParams]); // Tambahkan filterParams ke dependencies
  // PERHATIAN: Jika fetchWarga sendiri memiliki filterParams sebagai dependency (secara tidak langsung), ESLint mungkin warning.
  // Namun, karena fetchWarga menerima filter sebagai argumen, ini seharusnya aman.

  // Handler untuk filter
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('[Warga.js] handleFilterChange - name:', name, 'value:', type === 'checkbox' ? checked : value);
    setFilterParams(prevParams => ({
      ...prevParams,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const applyFilters = () => {
    console.log('[Warga.js] applyFilters called. Current filterParams:', filterParams);
    if (activeTab === 'individu') {
        // Validasi usia jika usiaOperator diisi tapi usia kosong, atau sebaliknya
        if (filterParams.usiaOperator && !filterParams.usia) {
            toast.warn('Mohon masukkan nilai usia jika kondisi usia dipilih.');
            return;
        }
        if (!filterParams.usiaOperator && filterParams.usia) {
            toast.warn('Mohon pilih kondisi usia (diatas/dibawah/sama dengan) jika nilai usia diisi.');
            return;
        }
        fetchWarga(filterParams);
    }
  };

  const resetFilters = () => {
    console.log('[Warga.js] resetFilters called.');
    setFilterParams(initialFilterParams);
    if (activeTab === 'individu') {
      fetchWarga(initialFilterParams); // Fetch dengan filter yang sudah direset
    }
  };

  // Fungsi ini sekarang akan memicu modal untuk CSV, atau langsung ekspor untuk PDF
  const handleExportInitiation = async (format) => {
    if (format === 'csv' || format === 'pdf') {
      setExportFormatInProgress(format);
      setIsColumnSelectorModalOpen(true);
    } else {
      toast.error('Format ekspor tidak dikenal.');
    }
  };

  // Fungsi baru untuk menangani konfirmasi ekspor (baik CSV maupun PDF)
  const handleConfirmExportWithSelectedColumns = async (chosenColumnKeys) => {
    if (!chosenColumnKeys || chosenColumnKeys.length === 0) {
      toast.warn('Pilih setidaknya satu kolom untuk diekspor.');
      return; // Jangan tutup modal jika tidak ada kolom dipilih
    }

    setSelectedExportColumns(chosenColumnKeys); // Simpan sebagai preferensi
    setIsColumnSelectorModalOpen(false); // Tutup modal segera
    setIsExporting(true);

    const activeFilters = {};
    for (const key in filterParams) {
      if (filterParams[key] !== '' && filterParams[key] !== null && filterParams[key] !== false) {
        activeFilters[key] = filterParams[key];
      }
    }
    if (filterParams.hanyaKepalaKeluarga === true) {
      activeFilters.hanyaKepalaKeluarga = 'true';
    }

    // Validasi usia
    if (activeFilters.usiaOperator && !activeFilters.usia) {
      toast.error(`Gagal Ekspor ${exportFormatInProgress.toUpperCase()}: Mohon masukkan nilai usia jika kondisi usia dipilih untuk filter.`);
      setIsExporting(false);
      setExportFormatInProgress(null); // Reset format
      return;
    }
    if (!activeFilters.usiaOperator && activeFilters.usia) {
      toast.error(`Gagal Ekspor ${exportFormatInProgress.toUpperCase()}: Mohon pilih kondisi usia jika nilai usia diisi untuk filter.`);
      setIsExporting(false);
      setExportFormatInProgress(null); // Reset format
      return;
    }

    const columnsString = chosenColumnKeys.join(',');

    try {
      if (exportFormatInProgress === 'csv') {
        console.log('[Warga.js] handleConfirmExport (CSV): Sending columns string to service:', columnsString);
        await wargaService.exportWargaCSV(activeFilters, columnsString);
        toast.success('Data CSV berhasil diekspor.');
      } else if (exportFormatInProgress === 'pdf') {
        console.log('[Warga.js] handleConfirmExport (PDF): Sending columns string to service:', columnsString);
        // Panggil service PDF di sini, perlu dimodifikasi di api.js untuk menerima columnsString
        await wargaService.exportWargaPDF(activeFilters, columnsString); 
        toast.success('Data PDF berhasil diekspor.');
      }
    } catch (error) {
      console.error(`Error exporting data as ${exportFormatInProgress.toUpperCase()}:`, error);
      const errorMessage = error.message || `Gagal mengekspor data ke ${exportFormatInProgress.toUpperCase()}.`;
      toast.error(`Gagal Ekspor ${exportFormatInProgress.toUpperCase()}: ${errorMessage}`);
    } finally {
      setIsExporting(false);
      setExportFormatInProgress(null); // Reset format setelah selesai
    }
  };

  const handleViewWarga = (warga) => {
    // NEW LOGIC for CV-like modal
    setSelectedWargaForCvModal(warga);
    setIsCvModalOpen(true);
  };

  const handleDeleteWarga = async (id) => {
    // if (!window.confirm('Anda yakin ingin menghapus data warga ini?')) return; // Hapus window.confirm
    // setIsDeletingWarga(true); // State ini akan di-set saat konfirmasi
    // try {
    //   await wargaService.deleteWarga(id);
    //   fetchWarga(filterParams);
    //   toast.success('Data warga berhasil dihapus');
    // } catch (err) {
    //   console.error('Error deleting warga:', err);
    //   toast.error('Gagal menghapus data warga.');
    // } finally {
    //   setIsDeletingWarga(false);
    // }
    setWargaToDeleteId(id); // Set ID warga yang akan dihapus
    setIsDeleteConfirmModalOpen(true); // Buka modal konfirmasi
  };

  // KK management functions
  const fetchKartuKeluarga = async () => {
    try {
      setIsLoadingKK(true);
      const data = await kartuKeluargaService.getAllKartuKeluarga();
      setKartuKeluargaList(data);
    } catch (err) {
      console.error('Error fetching kartu keluarga:', err);
    } finally {
      setIsLoadingKK(false);
    }
  };

  const handleDeleteKK = async (id) => {
    setKkToDeleteId(id);
    setIsDeleteConfirmModalOpen(true);
  };

  const executeActualDeleteKK = async () => {
    try {
      setIsDeletingKK(true);
      await kartuKeluargaService.deleteKartuKeluarga(kkToDeleteId);
      
      // Reset selection if we just deleted the currently selected KK
      if (selectedKK === kkToDeleteId) {
        setSelectedKK(null);
      }
      
      // Refresh data
      fetchKartuKeluarga();
      
      toast.success('Kartu Keluarga berhasil dihapus');
    } catch (err) {
      console.error('Error deleting KK:', err);
      toast.error(`Gagal menghapus Kartu Keluarga: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsDeletingKK(false);
      setIsDeleteConfirmModalOpen(false);
      setKkToDeleteId(null);
    }
  };

  const handleEditKK = (id) => {
    const kkToEdit = kartuKeluargaList.find(kk => kk.id === id);
    if (kkToEdit) {
      console.log("Editing KK with ID:", id, "Data:", kkToEdit);
      setKkToEditData(kkToEdit); 
      setRegistrasiModalMode('editKK'); 
      setShowRegistrasiModal(true); 
    } else {
      toast.error('Data Kartu Keluarga tidak ditemukan untuk diedit.');
    }
  };

  const handleAddAnggotaToKK = (kkIdFromPanel) => {
    // setSelectedKK(kkIdFromPanel); // Tidak perlu set selectedKK di sini
    setKkIdForAddingAnggota(kkIdFromPanel); // Simpan ID target
    setShowRegistrasiModal(true); // Tampilkan modal registrasi
  };
  
  const handleEditAnggotaInKK = (anggota, kkIdContext) => {
    // TODO: Implementasi logika untuk membuka form edit anggota
    // Anda mungkin perlu mengambil detail anggota berdasarkan anggotaId
    // dan membukanya di modal form (mirip RegistrasiKeluargaModal atau form khusus)
    // console.log(`Edit anggota dengan ID: ${anggotaId} dari KK ID: ${kkIdContext}`);
    // toast.info(`Fungsi Edit Anggota (ID: ${anggotaId}) belum sepenuhnya diimplementasikan.`);
    if (anggota && kkIdContext) {
      console.log('Editing Anggota:', anggota);
      console.log('KK ID Context:', kkIdContext);
      setEditingAnggotaData(anggota);
      setCurrentKkIdContextForEdit(kkIdContext);
      setIsEditAnggotaModalOpen(true);
    } else {
      console.error("Data anggota atau kkIdContext tidak tersedia untuk diedit.");
      toast.error("Gagal membuka form edit: data tidak lengkap.");
    }
  };

  const handleDeleteAnggotaFromKK = async (anggotaId) => {
    setAnggotaToDeleteId(anggotaId);
    setIsDeleteConfirmModalOpen(true);
  };

  const executeActualDeleteAnggota = async () => {
    try {
      setIsDeletingAnggota(true);
      await kartuKeluargaService.removeAnggotaKeluarga(anggotaToDeleteId);
      
      // Refresh data after deletion
      fetchKartuKeluarga();
      
      // If we have a selected KK, refresh the detail panel too
      if (selectedKK) {
        setDetailPanelRefreshCounter(prev => prev + 1);
      }
      
      toast.success('Anggota keluarga berhasil dihapus');
    } catch (err) {
      console.error('Error deleting anggota:', err);
      toast.error(`Gagal menghapus anggota keluarga: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsDeletingAnggota(false);
      setIsDeleteConfirmModalOpen(false);
      setAnggotaToDeleteId(null);
    }
  };

  const handleCloseDeleteConfirmModal = () => {
    setIsDeleteConfirmModalOpen(false);
    setAnggotaToDeleteId(null);
    setWargaToDeleteId(null); 
    setKkToDeleteId(null); // Reset juga kkToDeleteId
  };

  const openModalForNewKK = () => {
    setSelectedKK(null);      
    setShowRegistrasiModal(true);
  };

  const openDetailPanel = (kkId) => {
    if (selectedKK === kkId) {
      setSelectedKK(null);
    } else {
      setSelectedKK(kkId);
    }
  };

  const handleRegistrasiSuccess = () => {
    console.log('[Warga.js] handleRegistrasiSuccess: Registration completed, refreshing data.');
    fetchKartuKeluarga(); // Fetch data KK lagi setelah registrasi selesai
    
    // Reset state
    setShowRegistrasiModal(false);
    setKkIdForAddingAnggota(null);
    setRegistrasiModalMode('add');
    setKkToEditData(null);
    
    // Jika ada KK yang dipilih, refresh detail panel juga
    if (selectedKK) {
      setDetailPanelRefreshCounter(prev => prev + 1);
    }
  };
  
  const handleCloseRegistrasiModal = () => {
    setShowRegistrasiModal(false);
    setKkToEditData(null);
    setRegistrasiModalMode('add');
  };

  // Handler untuk menutup panel detail
  const handleCloseDetailPanel = () => {
    setSelectedKK(null);
  }

  // Fungsi baru untuk eksekusi hapus warga setelah konfirmasi
  const executeActualDeleteWarga = async () => {
    if (!wargaToDeleteId) return;

    setIsDeletingWarga(true); // Gunakan state loading yang relevan
    try {
      await wargaService.deleteWarga(wargaToDeleteId);
      fetchWarga(filterParams); // Refresh tabel warga individu
      toast.success('Data warga berhasil dihapus');
    } catch (err) {
      console.error('Error deleting warga:', err);
      toast.error('Gagal menghapus data warga.');
    } finally {
      setIsDeletingWarga(false);
      setIsDeleteConfirmModalOpen(false);
      setWargaToDeleteId(null);
    }
  };

  // Fungsi untuk menangani submit dari modal edit anggota
  const handleSubmitEditAnggota = async (anggotaId, updatedDataFromForm, kkIdContext) => {
    console.log('handleSubmitEditAnggota called with:', { anggotaId, updatedDataFromForm, kkIdContext });
    
    // Persiapkan payload untuk API
    // Backend mengharapkan 'statusHubungan', bukan 'statusHubunganDalamKK'
    // dan juga membutuhkan kartuKeluargaId untuk konteks update relasi KK jika berubah.
    const payload = {
      ...updatedDataFromForm,
      kartuKeluargaId: kkIdContext, // ID KK saat ini atau target jika ada perubahan
      statusHubungan: updatedDataFromForm.statusHubunganDalamKK, // Mapping dari form
    };
    // Hapus field spesifik frontend dari payload jika tidak diperlukan backend
    // atau jika sudah dipetakan (seperti statusHubunganDalamKK)
    delete payload.statusHubunganDalamKK;

    // Catatan: Backend saat ini belum menghandle 'pendidikanTerakhir' pada updateWarga
    // Frontend tetap mengirimkannya, backend akan mengabaikannya jika tidak diproses.

    try {
      const response = await wargaService.updateWarga(anggotaId, payload);
      console.log('Update success for anggota ID:', anggotaId, 'Response:', response);
      toast.success(`Data anggota ${response.namaLengkap || ''} berhasil diperbarui.`);
      
      setIsEditAnggotaModalOpen(false);
      setEditingAnggotaData(null);
      setCurrentKkIdContextForEdit(null);
      
      fetchKartuKeluarga(); // Refresh daftar KK di sidebar
      // Untuk memaksa refresh DetailKartuKeluargaPanel jika masih menampilkan KK yang sama
      // Ini penting jika anggota yang diedit adalah dari KK yang sedang aktif di detail panel
      if (selectedKK && selectedKK === kkIdContext) {
        setDetailPanelRefreshCounter(prev => prev + 1);
      } else if (selectedKK && response.keluarga && response.keluarga.some(k => k.kartuKeluargaId === selectedKK)){
        // Jika anggota pindah ke KK yang sedang aktif, refresh juga panelnya
        setDetailPanelRefreshCounter(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error updating anggota:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memperbarui data anggota.';
      toast.error(`Update Gagal: ${errorMessage}`);
    }
  };

  // Render function untuk tab Kartu Keluarga (tetap sama)
  const renderKKTab = () => {
    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-180px)] relative">
        {/* Sidebar Kepala Keluarga */}
        <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 h-full overflow-y-auto bg-white shadow rounded-lg p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <WargaSidebar 
            kartuKeluargaList={kartuKeluargaList} 
            isLoading={isLoadingKK} 
            onSelectKK={openDetailPanel} 
            selectedKKId={selectedKK}
            onAddKK={() => openModalForNewKK()} // Menggunakan fungsi dari Warga.js
            onRefresh={() => fetchKartuKeluarga()} // Refresh data KK di sidebar
          />
        </div>

        {/* Panel Detail Kartu Keluarga */}
        <div className="w-full md:w-2/3 lg:w-3/4 xl:w-4/5 h-full">
          {selectedKK ? (
            <DetailKartuKeluargaPanel 
              kkId={selectedKK} 
              key={selectedKK + detailPanelRefreshCounter} // Re-mount on refresh or KK change
              onClose={handleCloseDetailPanel}
              onEdit={handleEditKK}
              onDelete={handleDeleteKK}
              onAddAnggota={handleAddAnggotaToKK} // Meneruskan fungsi dari Warga.js
              onEditAnggota={handleEditAnggotaInKK}
              onDeleteAnggota={handleDeleteAnggotaFromKK}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white shadow rounded-lg p-6">
              <FaHome className="text-6xl text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">Pilih Kartu Keluarga</p>
              <p className="text-gray-500">Silakan pilih salah satu Kartu Keluarga dari daftar di samping untuk melihat detailnya.</p>
              <p className="text-gray-500 mt-2">Atau <button onClick={() => openModalForNewKK()} className="text-indigo-600 hover:underline">buat Kartu Keluarga baru</button>.</p>
            </div>
          )}
        </div>
        {/* Floating Action Button untuk Tambah KK Baru */}
        <button
          onClick={() => openModalForNewKK()}
          className="absolute bottom-8 right-8 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
          title="Tambah Kartu Keluarga Baru"
        >
          <FaPlus size={24} />
        </button>
      </div>
    );
  };

  // Render function untuk tab Individu (baru ditambahkan)
  const renderWargaIndividuTab = () => {
    return (
      <div>
        <WargaFilterComponent 
          filters={filterParams}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          onExportData={handleExportInitiation} // Prop diganti ke handleExportInitiation
          isExporting={isExporting} 
        />

        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <FaSpinner className="animate-spin text-4xl text-indigo-600" />
            <p className="ml-3 text-lg text-gray-600">Memuat data warga...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="text-center py-10 bg-red-50 p-4 rounded-md">
            <p className="text-red-600 font-semibold">Oops! Terjadi Kesalahan</p>
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => fetchWarga(filterParams)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150"
            >
              Coba Lagi
            </button>
          </div>
        )}
        {!isLoading && !error && wargaList.length === 0 && (
          <div className="text-center py-10">
            <FaUser className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-xl text-gray-500">Tidak ada data warga yang ditemukan.</p>
            <p className="text-gray-400">Coba ubah filter Anda atau tambahkan data warga baru.</p>
          </div>
        )}
        {!isLoading && !error && wargaList.length > 0 && (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Lahir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kawin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pekerjaan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat KK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wargaList.map((warga, index) => (
                  <tr key={warga.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{warga.nik}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{warga.namaLengkap}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.jenisKelamin ? warga.jenisKelamin.charAt(0) : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warga.tanggalLahir ? new Date(warga.tanggalLahir).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.agama || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.statusPerkawinan || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{warga.pekerjaan || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {warga.alamat || warga.alamat_domisili || '-'} {warga.rt && warga.rw ? `RT ${warga.rt}/${warga.rw}` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleViewWarga(warga)} className="text-blue-600 hover:text-blue-900" title="Lihat Detail"><FaEye /></button>
                      <button onClick={() => handleDeleteWarga(warga.id)} className="text-red-600 hover:text-red-900" title="Hapus"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Modal Konfirmasi Hapus Anggota
  const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading, itemType }) => {
    // ... (implementasi modal konfirmasi)
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Konfirmasi Hapus</h3>
          <p className="text-sm text-gray-600 mb-6">Anda yakin ingin menghapus {itemType} ini? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Batal</button>
            <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
              {isLoading ? <FaSpinner className="animate-spin inline mr-2" /> : null} Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-100 min-h-screen"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Kependudukan</h1>
          {/* Tombol Aksi Global bisa ditaruh di sini jika perlu */}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('kk')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm 
                  ${activeTab === 'kk' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Kartu Keluarga
              </button>
              <button
                onClick={() => setActiveTab('individu')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm 
                  ${activeTab === 'individu' 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Daftar Warga (Individu)
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'kk' && renderKKTab()}
        {activeTab === 'individu' && renderWargaIndividuTab()}

      </div>

      {showRegistrasiModal && (
        <RegistrasiKeluargaModal 
          isOpen={showRegistrasiModal} 
          onClose={handleCloseRegistrasiModal} 
          onSuccess={handleRegistrasiSuccess} 
          initialData={kkToEditData}
          mode={registrasiModalMode}
          kkId={registrasiModalMode === 'add' && kkIdForAddingAnggota ? kkIdForAddingAnggota : undefined}
        />
      )}

      <DeleteConfirmationModal 
        isOpen={isDeleteConfirmModalOpen}
        onClose={handleCloseDeleteConfirmModal}
        onConfirm={kkToDeleteId ? executeActualDeleteKK : (wargaToDeleteId ? executeActualDeleteWarga : executeActualDeleteAnggota)}
        isLoading={kkToDeleteId ? isDeletingKK : (wargaToDeleteId ? isDeletingWarga : isDeletingAnggota)}
        itemType={kkToDeleteId ? 'Kartu Keluarga' : (wargaToDeleteId ? 'Warga' : 'Anggota Keluarga')}
      />
      
      {/* CV-like Modal for individual Warga details */}
      {isCvModalOpen && selectedWargaForCvModal && (
        <DetailAnggotaModal
          isOpen={isCvModalOpen}
          onClose={() => setIsCvModalOpen(false)}
          wargaData={selectedWargaForCvModal}
        />
      )}

      {/* ColumnSelectorModal di-render di sini, dikontrol oleh Warga.js */}
      {isColumnSelectorModalOpen && (
        <ColumnSelectorModal
          isOpen={isColumnSelectorModalOpen}
          onClose={() => {
            setIsColumnSelectorModalOpen(false);
            setExportFormatInProgress(null); // Reset format saat modal ditutup tanpa ekspor
          }}
          availableColumns={ALL_EXPORTABLE_COLUMNS}
          currentSelectedColumns={selectedExportColumns} // Ini akan menjadi default di modal
          onSaveAndExport={handleConfirmExportWithSelectedColumns} // Gunakan handler baru
          exportFormat={exportFormatInProgress} // Kirim format ke modal (opsional, untuk UI modal)
        />
      )}

      {isEditAnggotaModalOpen && editingAnggotaData && (
        <EditAnggotaFormModal
          isOpen={isEditAnggotaModalOpen}
          onClose={() => {
            setIsEditAnggotaModalOpen(false);
            setEditingAnggotaData(null);
            setCurrentKkIdContextForEdit(null);
          }}
          anggotaData={editingAnggotaData}
          onSubmit={handleSubmitEditAnggota}
          kkId={currentKkIdContextForEdit} // Teruskan kkId ke modal
        />
      )}

    </motion.div>
  );
};

export default Warga; 