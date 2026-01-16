import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const authService = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },
};
