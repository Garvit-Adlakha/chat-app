import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});
export const fileUploadInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 300000, // 5 minutes
  headers: {
    'Content-Type': ['multipart/form-data']
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB max content length
  maxBodyLength: 50 * 1024 * 1024 // 50MB max body length
});

export default axiosInstance;
