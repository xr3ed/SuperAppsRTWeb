import axios from 'axios';

// Gunakan variabel lingkungan untuk API_URL, dengan fallback ke localhost untuk development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Warga API Service
export const wargaService = {
  // Get semua warga
  getAllWarga: async (filterParams = {}) => {
    console.log('[api.js] wargaService.getAllWarga called with filterParams:', filterParams);
    try {
      // Buat query string dari filterParams
      const queryString = new URLSearchParams(filterParams).toString();
      console.log('[api.js] wargaService.getAllWarga - generated queryString:', queryString);
      const response = await api.get(queryString ? `/warga?${queryString}` : '/warga');
      return response.data;
    } catch (error) {
      console.error('Error fetching warga:', error);
      throw error;
    }
  },

  // Get warga by ID
  getWargaById: async (id) => {
    try {
      const response = await api.get(`/warga/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching warga with id ${id}:`, error);
      throw error;
    }
  },

  // Create warga baru
  createWarga: async (wargaData) => {
    try {
      const response = await api.post('/warga', wargaData);
      return response.data;
    } catch (error) {
      console.error('Error creating warga:', error);
      throw error;
    }
  },

  // Update warga
  updateWarga: async (id, wargaData) => {
    try {
      const response = await api.put(`/warga/${id}`, wargaData);
      return response.data;
    } catch (error) {
      console.error(`Error updating warga with id ${id}:`, error);
      throw error;
    }
  },

  // Delete warga
  deleteWarga: async (id) => {
    try {
      const response = await api.delete(`/warga/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting warga with id ${id}:`, error);
      throw error;
    }
  },

  // Search warga
  searchWarga: async (query) => {
    try {
      // Untuk konsistensi, searchWarga juga bisa menggunakan filterParams
      // const response = await api.get(`/warga?search=${query}`); 
      // Atau, jika search adalah bagian dari filter umum:
      const response = await api.get(`/warga?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching warga with query ${query}:`, error);
      throw error;
    }
  },

  // Export Warga to CSV
  exportWargaCSV: async (filterParams = {}, columns = null) => {
    console.log('[api.js] exportWargaCSV: Received filterParams:', filterParams);
    console.log('[api.js] exportWargaCSV: Received columns string:', columns);
    try {
      let exportUrl = '/warga/export/csv';
      // Buat objek params dari filterParams
      const params = { ...filterParams };
      // Jika ada parameter columns, tambahkan ke objek params
      if (columns) {
        params.columns = columns;
      }
      // Buat query string dari objek params (termasuk filter dan columns jika ada)
      const queryString = new URLSearchParams(params).toString();
      
      // Tambahkan query string ke URL jika tidak kosong
      if (queryString) {
        exportUrl += `?${queryString}`;
      }
      console.log('[api.js] exportWargaCSV: Requesting URL:', exportUrl);
      const response = await api.get(exportUrl, {
        responseType: 'blob', // Penting untuk menerima file
      });
      // Buat URL blob dan trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_warga.csv'); // Nama file download
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // Bersihkan blob URL
    } catch (error) {
      console.error('Error exporting warga to CSV:', error);
      // Periksa apakah error dari server memiliki message (misal, tidak ada data)
      if (error.response && error.response.data) {
        // Jika server mengirim JSON error (misal, status 404 dengan message)
        // Coba parse blob error ke JSON
        try {
            const errDataText = await error.response.data.text();
            const errJson = JSON.parse(errDataText);
            console.error('Server error message:', errJson.message);
            throw new Error(errJson.message || 'Gagal mengekspor CSV dari server.');
        } catch (parseError) {
            console.error('Could not parse error response from server.');
            throw new Error('Gagal mengekspor CSV. Respons error tidak dikenal.');
        }
      } else {
        throw error; // Rethrow error asli jika bukan dari respons server dengan data blob
      }
    }
  },

  // Export Warga to PDF
  exportWargaPDF: async (filterParams = {}, columns = null) => {
    console.log('[api.js] exportWargaPDF: Received filterParams:', filterParams);
    console.log('[api.js] exportWargaPDF: Received columns string:', columns);
    try {
      let exportUrl = '/warga/export/pdf';
      const params = { ...filterParams };
      if (columns) {
        params.columns = columns;
      }
      const queryString = new URLSearchParams(params).toString();
      
      if (queryString) {
        exportUrl += `?${queryString}`;
      }
      console.log('[api.js] exportWargaPDF: Requesting URL:', exportUrl);

      const response = await api.get(exportUrl, {
        responseType: 'blob', // Terima file sebagai blob
      });
      // Buat URL blob dan trigger download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })); // Set Mime Type
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data_warga.pdf'); // Nama file download
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); // Bersihkan blob URL
    } catch (error) {
      console.error('Error exporting warga to PDF:', error);
      if (error.response && error.response.data) {
        try {
            const errDataText = await error.response.data.text();
            const errJson = JSON.parse(errDataText);
            console.error('Server error message:', errJson.message);
            throw new Error(errJson.message || 'Gagal mengekspor PDF dari server.');
        } catch (parseError) {
            console.error('Could not parse error response from server.');
            throw new Error('Gagal mengekspor PDF. Respons error tidak dikenal.');
        }
      } else {
        throw error;
      }
    }
  },
};

// Iuran API Service
export const iuranService = {
  // Get semua iuran
  getAllIuran: async () => {
    try {
      const response = await api.get('/iuran');
      return response.data;
    } catch (error) {
      console.error('Error fetching iuran:', error);
      throw error;
    }
  },

  // Get iuran by ID
  getIuranById: async (id) => {
    try {
      const response = await api.get(`/iuran/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching iuran with id ${id}:`, error);
      throw error;
    }
  },

  // Get iuran by warga ID
  getIuranByWargaId: async (wargaId) => {
    try {
      const response = await api.get(`/iuran/warga/${wargaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching iuran for warga id ${wargaId}:`, error);
      throw error;
    }
  },

  // Create iuran baru
  createIuran: async (iuranData) => {
    try {
      const response = await api.post('/iuran', iuranData);
      return response.data;
    } catch (error) {
      console.error('Error creating iuran:', error);
      throw error;
    }
  },

  // Update iuran
  updateIuran: async (id, iuranData) => {
    try {
      const response = await api.put(`/iuran/${id}`, iuranData);
      return response.data;
    } catch (error) {
      console.error(`Error updating iuran with id ${id}:`, error);
      throw error;
    }
  },

  // Delete iuran
  deleteIuran: async (id) => {
    try {
      const response = await api.delete(`/iuran/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting iuran with id ${id}:`, error);
      throw error;
    }
  },

  // Get ringkasan iuran
  getIuranSummary: async () => {
    try {
      const response = await api.get('/iuran/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching iuran summary:', error);
      throw error;
    }
  },
};

// Kartu Keluarga API Service
export const kartuKeluargaService = {
  // Get semua kartu keluarga
  getAllKartuKeluarga: async () => {
    try {
      // Tambahkan parameter nocache dengan timestamp untuk menghindari cache
      const timestamp = new Date().getTime();
      const response = await api.get(`/kartukeluarga?nocache=${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching kartu keluarga:', error);
      throw error;
    }
  },

  // Get kartu keluarga by ID
  getKartuKeluargaById: async (id) => {
    try {
      const response = await api.get(`/kartukeluarga/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching kartu keluarga with id ${id}:`, error);
      throw error;
    }
  },

  // Get kartu keluarga by Nomor KK
  getKartuKeluargaByNomorKK: async (nomorKK) => {
    try {
      const response = await api.get(`/kartukeluarga/nomor/${nomorKK}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching kartu keluarga with nomor KK ${nomorKK}:`, error);
      throw error;
    }
  },

  // Create kartu keluarga baru
  createKartuKeluarga: async (kkData) => {
    try {
      const response = await api.post('/kartukeluarga', kkData);
      return response.data;
    } catch (error) {
      console.error('Error creating kartu keluarga:', error);
      throw error;
    }
  },

  // Update kartu keluarga
  updateKartuKeluarga: async (id, kkData) => {
    try {
      const response = await api.put(`/kartukeluarga/${id}`, kkData);
      return response.data;
    } catch (error) {
      console.error(`Error updating kartu keluarga with id ${id}:`, error);
      throw error;
    }
  },

  // Delete kartu keluarga
  deleteKartuKeluarga: async (id) => {
    try {
      const response = await api.delete(`/kartukeluarga/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting kartu keluarga with id ${id}:`, error);
      throw error;
    }
  },

  // Tambah anggota ke kartu keluarga
  addAnggotaKeluarga: async (anggotaData) => {
    try {
      const response = await api.post('/kartukeluarga/anggota', anggotaData);
      return response.data;
    } catch (error) {
      console.error('Error adding anggota keluarga:', error);
      throw error;
    }
  },

  // Hapus anggota dari kartu keluarga
  removeAnggotaKeluarga: async (id) => {
    try {
      const response = await api.delete(`/kartukeluarga/anggota/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing anggota keluarga with id ${id}:`, error);
      throw error;
    }
  },

  // Update status hubungan anggota keluarga
  updateStatusHubungan: async (id, statusData) => {
    try {
      const response = await api.put(`/kartukeluarga/anggota/${id}`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Error updating status hubungan anggota with id ${id}:`, error);
      throw error;
    }
  },

  // Search Kartu Keluarga berdasarkan Nomor KK atau Nama Kepala Keluarga
  searchKartuKeluarga: async (query) => {
    try {
      const response = await api.get(`/kartukeluarga/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching kartu keluarga with query ${query}:`, error);
      throw error;
    }
  },

  // Get semua kartu keluarga dengan data kepala keluarga (endpoint diperbaiki)
  getKartuKeluargaWithKepala: async () => {
    try {
      // Tambahkan parameter nocache dengan timestamp untuk menghindari cache
      const timestamp = new Date().getTime();
      const response = await api.get(`/kartukeluarga?nocache=${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching kartu keluarga (endpoint /kartukeluarga):', error);
      throw error;
    }
  }
};

export default api; 