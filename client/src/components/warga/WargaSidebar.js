import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUserTie, FaSearch, FaIdCard, FaHome, FaSyncAlt, FaUserCircle } from 'react-icons/fa';
import { kartuKeluargaService } from '../../services/api';
import useViewport from '../../hooks/useViewport';

const WargaSidebar = ({ onSelectKK, selectedKKId, onEdit, onDelete, onAddNewKK, onRefresh, kartuKeluargaList: propKartuKeluargaList, isLoading: propIsLoading }) => {
  const [kartuKeluargaList, setKartuKeluargaList] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimeoutRef = useRef(null);
  const { device } = useViewport();
  const itemRefs = useRef({});

  // Gunakan data dari prop jika tersedia, jika tidak, fetch dari API
  useEffect(() => {
    if (propKartuKeluargaList) {
      setKartuKeluargaList(propKartuKeluargaList);
      setIsLoading(false);
    } else {
      fetchKartuKeluarga();
    }
  }, [propKartuKeluargaList]);

  // Gunakan status loading dari prop jika tersedia
  useEffect(() => {
    if (propIsLoading !== undefined) {
      setIsLoading(propIsLoading);
    }
  }, [propIsLoading]);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (!searchQuery.trim()) {
        setDisplayList(kartuKeluargaList);
        return;
      }
      
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredData = kartuKeluargaList.filter(kk => 
        kk.nomorKK.includes(lowerCaseQuery) || 
        kk.kepalaKeluarga.toLowerCase().includes(lowerCaseQuery) ||
        (kk.kepalaWarga?.nik && kk.kepalaWarga.nik.includes(searchQuery)) ||
        kk.alamat.toLowerCase().includes(lowerCaseQuery)
      );
      setDisplayList(filteredData);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, kartuKeluargaList]);

  // Tambahkan useEffect untuk scrollIntoView
  useEffect(() => {
    if (selectedKKId && itemRefs.current[selectedKKId]) {
      // Pastikan elemen ada sebelum mencoba scroll
      setTimeout(() => { // Beri sedikit delay untuk memastikan DOM update dan animasi selesai jika ada
        if (itemRefs.current[selectedKKId]) {
          itemRefs.current[selectedKKId].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest', 
          });
        }
      }, 100); // Delay kecil, bisa disesuaikan
    }
  }, [selectedKKId, displayList]); // displayList penting agar ref ter-update setelah filter

  const fetchKartuKeluarga = async () => {
    try {
      setIsLoading(true);
      const data = await kartuKeluargaService.getKartuKeluargaWithKepala();
      
      const processedData = data.map(kk => {
        let currentKepalaKeluarga = kk.kepalaKeluarga;
        const kepalaAnggota = kk.anggota?.find(a => a.statusHubungan?.toLowerCase() === 'kepala keluarga');
        
        if (!currentKepalaKeluarga && kepalaAnggota && kepalaAnggota.warga && kepalaAnggota.warga.namaLengkap) {
          currentKepalaKeluarga = kepalaAnggota.warga.namaLengkap;
        }

        return {
          ...kk,
          kepalaKeluarga: currentKepalaKeluarga,
          kepalaWarga: kepalaAnggota ? kepalaAnggota.warga : null
        };
      });
      
      setKartuKeluargaList(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching kartu keluarga:', err);
      setError('Gagal memuat data kartu keluarga');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKKItemClick = (kkId) => {
    if (onSelectKK) {
      onSelectKK(kkId);
    }
  };

  const handleRefreshSidebar = () => {
    setSearchQuery('');
    
    // Jika parent component menyediakan fungsi refresh, gunakan itu
    if (onRefresh) {
      onRefresh();
    } 
    // Jika tidak, refresh menggunakan internal fetch
    else {
      fetchKartuKeluarga();
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  if (isLoading && kartuKeluargaList.length === 0) {
    return (
      <div className={`h-full flex justify-center items-center ${device === 'mobile' ? 'p-2' : 'p-4'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-white rounded-lg shadow-md ${device === 'mobile' ? 'text-sm' : ''}`}>
      <div className={`border-b border-gray-200 ${device === 'mobile' ? 'p-2' : 'p-4'}`}>
        <div className="flex justify-between items-center">
          <h2 className={`font-bold text-gray-800 flex items-center ${device === 'mobile' ? 'text-base' : 'text-lg'}`}>
            <FaHome className={`mr-2 text-primary-500 ${device === 'mobile' ? 'w-4 h-4' : 'w-5 h-5'}`} />
            Daftar Kepala Keluarga
          </h2>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={handleRefreshSidebar}
            className={`p-1.5 hover:bg-gray-100 rounded-full ${device === 'mobile' ? 'p-1' : 'p-1.5'}`}
            title="Muat ulang data"
          >
            <FaSyncAlt className={`text-primary-500 ${device === 'mobile' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          </motion.button>
        </div>
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Cari KK (No.KK, Nama, NIK Kepala)..."
            className={`w-full pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 ${device === 'mobile' ? 'py-1.5 text-xs' : 'py-2 text-sm'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className={`absolute left-3 text-gray-400 ${device === 'mobile' ? 'top-2' : 'top-2.5'} ${device === 'mobile' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        </div>
      </div>

      {error && (
        <div className={`error-message flex justify-between items-center ${device === 'mobile' ? 'p-2 text-xs' : 'p-3'}`}>
          <div>{error}</div>
          <button 
            onClick={handleRefreshSidebar}
            className={`bg-red-200 hover:bg-red-300 text-red-800 rounded transition-colors flex items-center ${device === 'mobile' ? 'px-1.5 py-0.5 text-2xs' : 'px-2 py-1 text-xs font-medium'}`}
          >
            <FaSyncAlt className={`mr-1 ${device === 'mobile' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} /> Coba Lagi
          </button>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto ${device === 'mobile' ? 'p-1.5' : 'p-2'}`}>
        {displayList.length === 0 && !error && !isLoading ? (
          <div className={`text-center px-4 text-gray-500 ${device === 'mobile' ? 'py-4 text-xs' : 'py-8'}`}>
            {searchQuery ? (
              <div>Tidak ada hasil untuk "{searchQuery}"</div>
            ) : (
              <> 
                <div className={`mb-2 ${device === 'mobile' ? 'text-xs' : ''}`}>Belum ada data Kepala Keluarga</div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayList.map((kk, index) => (
              <motion.div 
                key={kk.id}
                ref={(el) => (itemRefs.current[kk.id] = el)}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
                className={`border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer 
                            ${selectedKKId === kk.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-300' : 'border-gray-200 hover:border-gray-300'} 
                            ${device === 'mobile' ? 'rounded-md' : 'rounded-lg'}`}
                onClick={() => handleKKItemClick(kk.id)}
              >
                <div className={`flex items-center justify-between ${device === 'mobile' ? 'p-2 space-x-2' : 'p-3 space-x-3'}`}>
                  <div className={`flex items-center ${device === 'mobile' ? 'space-x-2' : 'space-x-3'}`}>
                    <div className={`flex items-center justify-center rounded-full 
                                      ${selectedKKId === kk.id ? 'bg-primary-100' : 'bg-gray-100'} 
                                      ${device === 'mobile' ? 'h-8 w-8' : 'h-10 w-10'}`}>
                      {kk.kepalaWarga ? (
                        <FaUserTie className={` ${selectedKKId === kk.id ? 'text-primary-600' : 'text-gray-600'} ${device === 'mobile' ? 'text-lg' : 'text-xl'}`} />
                      ) : (
                        <FaUserCircle className={` ${selectedKKId === kk.id ? 'text-primary-500' : 'text-gray-400'} ${device === 'mobile' ? 'text-lg' : 'text-xl'}`} />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium ${selectedKKId === kk.id ? 'text-primary-700' : 'text-gray-800'} ${device === 'mobile' ? 'text-xs' : 'text-sm'}`}>{kk.kepalaKeluarga}</h3>
                      <div className={`flex items-center mt-0.5 ${device === 'mobile' ? 'space-x-1' : 'space-x-2'}`}>
                        <FaIdCard className={`text-gray-400 ${device === 'mobile' ? 'text-2xs' : 'text-xs'}`} />
                        <p className={`text-gray-500 ${device === 'mobile' ? 'text-2xs' : 'text-xs'}`}>No. KK: {kk.nomorKK}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WargaSidebar; 