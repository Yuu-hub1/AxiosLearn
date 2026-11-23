import api from './api';

export const httpClient = {
  // GET dengan dukungan query params otomatis (misal: { _limit: 5, page: 1 })
  get: async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
  },

  // POST untuk mengirim data baru
  post: async (url, data = {}) => {
    const response = await api.post(url, data);
    return response.data;
  },

  // PUT untuk mengganti seluruh data
  put: async (url, data = {}) => {
    const response = await api.put(url, data);
    return response.data;
  },

  // PATCH untuk mengubah sebagian data
  patch: async (url, data = {}) => {
    const response = await api.patch(url, data);
    return response.data;
  },

  // DELETE untuk menghapus data
  delete: async (url) => {
    const response = await api.delete(url);
    return response.data;
  },
};
