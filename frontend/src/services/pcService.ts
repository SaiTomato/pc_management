import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface PC {
  id: number;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  os?: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  status: 'active' | 'inactive' | 'maintenance';
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PCInput {
  name: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  os?: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  purchaseDate?: string;
  notes?: string;
}

export const pcService = {
  getPCs: async (page: number = 1, limit: number = 10, search: string = '') => {
    const response = await axios.get(`${API_URL}/pcs`, {
      params: { page, limit, search },
      ...getAuthHeaders(),
    });
    return response.data;
  },

  getPC: async (id: number) => {
    const response = await axios.get(`${API_URL}/pcs/${id}`, getAuthHeaders());
    return response.data;
  },

  createPC: async (pc: PCInput) => {
    const response = await axios.post(`${API_URL}/pcs`, pc, getAuthHeaders());
    return response.data;
  },

  updatePC: async (id: number, pc: PCInput) => {
    const response = await axios.put(`${API_URL}/pcs/${id}`, pc, getAuthHeaders());
    return response.data;
  },

  deletePC: async (id: number) => {
    await axios.delete(`${API_URL}/pcs/${id}`, getAuthHeaders());
  },
};
