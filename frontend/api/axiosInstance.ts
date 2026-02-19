import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
 baseURL: 'http://127.0.0.1:8000/api/',
  // keep this since your backend uses api/v1
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access');  // ✅ changed

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
