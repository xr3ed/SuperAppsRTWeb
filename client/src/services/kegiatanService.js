import axios from 'axios';

// Gunakan variabel lingkungan untuk API_URL, dengan fallback ke localhost untuk development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get semua kegiatan
export const getAllKegiatan = async () => {
  try {
    const response = await axios.get(`${API_URL}/kegiatan`);
    return response.data;
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    throw error;
  }
};

// Get detail kegiatan berdasarkan ID
export const getKegiatanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching kegiatan id ${id}:`, error);
    throw error;
  }
};

// Create kegiatan baru
export const createKegiatan = async (kegiatanData) => {
  try {
    const response = await axios.post(API_URL, kegiatanData);
    return response.data;
  } catch (error) {
    console.error('Error creating kegiatan:', error);
    throw error;
  }
};

// Update kegiatan
export const updateKegiatan = async (id, kegiatanData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, kegiatanData);
    return response.data;
  } catch (error) {
    console.error(`Error updating kegiatan id ${id}:`, error);
    throw error;
  }
};

// Delete kegiatan
export const deleteKegiatan = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting kegiatan id ${id}:`, error);
    throw error;
  }
};

// Tambah peserta ke kegiatan
export const addPesertaKegiatan = async (pesertaData) => {
  try {
    const response = await axios.post(`${API_URL}/peserta`, pesertaData);
    return response.data;
  } catch (error) {
    console.error('Error adding peserta:', error);
    throw error;
  }
};

// Update status kehadiran peserta
export const updateStatusKehadiran = async (id, statusData) => {
  try {
    const response = await axios.put(`${API_URL}/peserta/${id}`, statusData);
    return response.data;
  } catch (error) {
    console.error(`Error updating peserta status id ${id}:`, error);
    throw error;
  }
};

// Hapus peserta dari kegiatan
export const removePesertaKegiatan = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/peserta/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing peserta id ${id}:`, error);
    throw error;
  }
}; 