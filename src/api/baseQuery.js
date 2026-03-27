import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getToken = () => localStorage.getItem('accessToken');

export const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
  transformResponse: (response) => {
    if (!response?.success) return response;
    if (response.pagination) return { data: response.data, pagination: response.pagination };
    return response.data;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return result;
};
