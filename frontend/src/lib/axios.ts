import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', //server address
});

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
