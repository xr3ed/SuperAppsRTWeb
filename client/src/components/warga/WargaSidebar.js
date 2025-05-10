import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUserTie, FaSearch, FaIdCard, FaHome, FaSyncAlt, FaUserCircle } from 'react-icons/fa';
import { kartuKeluargaService } from '../../services/api';

const WargaSidebar = ({ onSelectKK, selectedKKId, onEdit, onDelete, onAddNewKK, onRefresh, kartuKeluargaList: propKartuKeluargaList, isLoading: propIsLoading }) => {
  const [kartuKeluargaList, setKartuKeluargaList] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimeoutRef = useRef(null);

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
      <div className="h-full flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <FaHome className="mr-2 text-primary-500" />
            Daftar Kepala Keluarga
          </h2>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={handleRefreshSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-full"
            title="Muat ulang data"
          >
            <FaSyncAlt className="text-primary-500" />
          </motion.button>
        </div>
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Cari KK (No.KK, Nama, NIK Kepala)..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute top-2.5 left-3 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="error-message flex justify-between items-center">
          <div>{error}</div>
          <button 
            onClick={handleRefreshSidebar}
            className="bg-red-200 hover:bg-red-300 text-red-800 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center"
          >
            <FaSyncAlt className="mr-1" /> Coba Lagi
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {displayList.length === 0 && !error && !isLoading ? (
          <div className="text-center py-8 px-4 text-gray-500">
            {searchQuery ? (
              <div>Tidak ada hasil untuk "{searchQuery}"</div>
            ) : (
              <> 
                <div className="mb-2">Belum ada data Kepala Keluarga</div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayList.map((kk, index) => (
              <motion.div 
                key={kk.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer 
                            ${selectedKKId === kk.id ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => handleKKItemClick(kk.id)}
              >
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center 
                                      ${selectedKKId === kk.id ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      {kk.kepalaWarga ? (
                        <FaUserTie className={`text-xl ${selectedKKId === kk.id ? 'text-primary-600' : 'text-gray-600'}`} />
                      ) : (
                        <FaUserCircle className={`text-xl ${selectedKKId === kk.id ? 'text-primary-500' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium ${selectedKKId === kk.id ? 'text-primary-700' : 'text-gray-800'}`}>{kk.kepalaKeluarga}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <FaIdCard className="text-xs text-gray-400" />
                        <p className="text-xs text-gray-500">No. KK: {kk.nomorKK}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full 
                                      ${selectedKKId === kk.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>
                      RT {kk.rt}/RW {kk.rw}
                    </span>
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