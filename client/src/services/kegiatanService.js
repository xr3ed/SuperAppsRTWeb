import api from './api'; // Asumsikan api.js ada di direktori yang sama atau sesuaikan path

// Hapus definisi API_URL lokal karena kita akan menggunakan baseURL dari instance api
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get semua kegiatan
export const getAllKegiatan = async () => {
  try {
    // Gunakan instance 'api' yang sudah dikonfigurasi
    const response = await api.get('/kegiatan');
    return response.data;
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    throw error;
  }
};

// Get detail kegiatan berdasarkan ID
export const getKegiatanById = async (id) => {
  try {
    // Gunakan instance 'api'
    const response = await api.get(`/kegiatan/${id}`); // Path sudah relatif terhadap baseURL di 'api'
    return response.data;
  } catch (error) {
    console.error(`Error fetching kegiatan id ${id}:`, error);
    throw error;
  }
};

// Create kegiatan baru
export const createKegiatan = async (kegiatanData) => {
  try {
    // Gunakan instance 'api'
    const response = await api.post('/kegiatan', kegiatanData); // Path sudah relatif
    return response.data;
  } catch (error) {
    console.error('Error creating kegiatan:', error);
    throw error;
  }
};

// Update kegiatan
export const updateKegiatan = async (id, kegiatanData) => {
  try {
    // Gunakan instance 'api'
    const response = await api.put(`/kegiatan/${id}`, kegiatanData); // Path sudah relatif
    return response.data;
  } catch (error) {
    console.error(`Error updating kegiatan id ${id}:`, error);
    throw error;
  }
};

// Delete kegiatan
export const deleteKegiatan = async (id) => {
  try {
    // Gunakan instance 'api'
    const response = await api.delete(`/kegiatan/${id}`); // Path sudah relatif
    return response.data;
  } catch (error) {
    console.error(`Error deleting kegiatan id ${id}:`, error);
    throw error;
  }
};

// Tambah peserta ke kegiatan
export const addPesertaKegiatan = async (pesertaData) => {
  try {
    // Gunakan instance 'api'
    const response = await api.post('/kegiatan/peserta', pesertaData); // Path sudah relatif
    return response.data;
  } catch (error) {
    console.error('Error adding peserta:', error);
    throw error;
  }
};

// Update status kehadiran peserta
export const updateStatusKehadiran = async (id, statusData) => {
  try {
    // Gunakan instance 'api'
    const response = await api.put(`/kegiatan/peserta/${id}`, statusData); // Path sudah relatif
    return response.data;
  } catch (error) {
    console.error(`Error updating peserta status id ${id}:`, error);
    throw error;
  }
};

// Hapus peserta dari kegiatan
export const removePesertaKegiatan = async (id) => {
  try {
    // Gunakan instance 'api'
    const response = await api.delete(`/kegiatan/peserta/${id}`); // Path sudah relatif
    return response.data;
  } catch (error) {
    console.error(`Error removing peserta id ${id}:`, error);
    throw error;
  }
}; 