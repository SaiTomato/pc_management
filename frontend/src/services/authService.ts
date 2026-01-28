import { api } from './api';

export const authService = {
  login: async (username: string, password: string) => {
    const res = await api.post(
      '/auth/login',
      { username, password },
      { withCredentials: true } // withCredentials: true to allow cookies
    );

    // only store access tokens in localStorage
    localStorage.setItem('accessToken', res.data.accessToken);
    console.log('login response:', res.data);

    return res.data;
  },

  logout: async () => {
    // don't store any tokens in localStorage
    const res = await api.post(
      '/auth/logout',
      {},
      { withCredentials: true } // withCredentials: true to allow cookies
    );
    return res.data;
  },
};