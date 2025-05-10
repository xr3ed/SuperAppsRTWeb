import React, { useState, useRef, useEffect } from 'react';
import { FaFileCsv, FaFilePdf, FaChevronDown, FaSpinner, FaTasks, FaChevronUp } from 'react-icons/fa';

const WargaFilterComponent = ({ 
  filters, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters, 
  onExportData,
  isExporting
}) => {
  const agamaOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];
  const jenisKelaminOptions = ['Laki-laki', 'Perempuan'];
  const statusPerkawinanOptions = ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'];
  const pendidikanTerakhirOptions = [
    'Tidak Sekolah',
    'Belum Sekolah',
    'Tamat SD/Sederajat',
    'Tamat SMP/Sederajat',
    'Tamat SMA/Sederajat',
    'Diploma I/II',
    'Akademi/Diploma III/Sarjana Muda',
    'Diploma IV/Strata I',
    'Strata II',
    'Strata III',
    'Lainnya' // Menambahkan opsi Lainnya jika ada yang tidak tercakup
  ];
  // Tambahkan opsi lain jika perlu (Pekerjaan, Pendidikan)

  const [isFilterVisible, setIsFilterVisible] = useState(true); // State for filter visibility
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Menutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExportClick = (format) => {
    onExportData(format); 
    setIsExportDropdownOpen(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer mb-4" 
        onClick={() => setIsFilterVisible(!isFilterVisible)}
      >
        <h3 className="text-xl font-semibold text-gray-700">Filter Warga</h3>
        {isFilterVisible ? <FaChevronUp className="text-gray-700" /> : <FaChevronDown className="text-gray-700" />}
      </div>

      {isFilterVisible && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Cari (NIK/Nama)</label>
              <input
                type="text"
                name="search"
                id="search"
                value={filters.search}
                onChange={onFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Masukkan NIK atau Nama..."
              />
            </div>
            <div>
              <label htmlFor="agama" className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
              <select
                name="agama"
                id="agama"
                value={filters.agama}
                onChange={onFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Semua Agama</option>
                {agamaOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select
                name="jenisKelamin"
                id="jenisKelamin"
                value={filters.jenisKelamin}
                onChange={onFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Semua Jenis Kelamin</option>
                {jenisKelaminOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="statusPerkawinan" className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
              <select
                name="statusPerkawinan"
                id="statusPerkawinan"
                value={filters.statusPerkawinan}
                onChange={onFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Semua Status</option>
                {statusPerkawinanOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
              <input
                type="text"
                name="pekerjaan"
                id="pekerjaan"
                value={filters.pekerjaan}
                onChange={onFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Contoh: Karyawan Swasta"
              />
            </div>
            
            {/* Filter Pendidikan Terakhir (BARU) */}
            <div>
              <label htmlFor="pendidikanTerakhir" className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
              <select
                name="pendidikanTerakhir"
                id="pendidikanTerakhir"
                value={filters.pendidikanTerakhir || ''} // Pastikan value terdefinisi
                onChange={onFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Semua Pendidikan</option>
                {pendidikanTerakhirOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Filter Usia: Menggunakan usia tunggal dengan operator */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 border p-3 rounded-md">
                <div className="col-span-2 text-sm font-medium text-gray-600 mb-1">Filter Usia (Tahun)</div>
                <div>
                    <label htmlFor="usiaOperator" className="block text-xs font-medium text-gray-600 mb-1">Kondisi</label>
                    <select 
                        name="usiaOperator" 
                        id="usiaOperator" 
                        value={filters.usiaOperator} 
                        onChange={onFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Pilih Kondisi</option>
                        <option value="diatas">Diatas</option>
                        <option value="dibawah">Dibawah</option>
                        <option value="samaDengan">Sama Dengan</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="usia" className="block text-xs font-medium text-gray-600 mb-1">Usia</label>
                    <input 
                        type="number" 
                        name="usia" 
                        id="usia" 
                        value={filters.usia} 
                        onChange={onFilterChange} 
                        placeholder="Contoh: 25"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={!filters.usiaOperator} // Disable jika operator belum dipilih
                    />
                </div>
            </div>

            <div className="flex items-center col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1 pt-7">
              <input
                type="checkbox"
                name="hanyaKepalaKeluarga"
                id="hanyaKepalaKeluarga"
                checked={filters.hanyaKepalaKeluarga}
                onChange={onFilterChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mr-2"
              />
              <label htmlFor="hanyaKepalaKeluarga" className="text-sm font-medium text-gray-700">Hanya Kepala Keluarga</label>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex space-x-3">
                <button
                onClick={onApplyFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                Terapkan Filter
                </button>
                <button
                onClick={onResetFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                >
                Reset Filter
                </button>
            </div>
            {/* Tombol Ekspor Dropdown dengan Loading State */}
            <div className="relative inline-block text-left" ref={exportDropdownRef}>
              <div>
                <button
                  type="button"
                  className={`flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500 transition duration-150 ease-in-out ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isExporting && setIsExportDropdownOpen(!isExportDropdownOpen)}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Mengekspor...
                    </>
                  ) : (
                    <>
                      Ekspor Data
                      <FaChevronDown className="ml-2 -mr-1 h-5 w-5" /> 
                    </>
                  )}
                </button>
              </div>
              {isExportDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button
                      onClick={() => handleExportClick('csv')}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      disabled={isExporting}
                    >
                      <FaFileCsv className="mr-2" /> CSV
                    </button>
                    <button
                      onClick={() => handleExportClick('pdf')}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      disabled={isExporting}
                    >
                      <FaFilePdf className="mr-2" /> PDF
                    </button>
                     <button
                      onClick={() => handleExportClick('csv_custom')}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      role="menuitem"
                      disabled={isExporting}
                    >
                      <FaTasks className="mr-2" /> CSV (Pilih Kolom)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WargaFilterComponent; 