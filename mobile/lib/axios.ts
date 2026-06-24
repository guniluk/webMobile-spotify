import axios from 'axios';
import Constants from 'expo-constants';

// Expo dev 환경에서 실행 중인 호스트 PC의 로컬 IP를 동적으로 탐색하여 API 주소 설정
const localhost = Constants.expoConfig?.hostUri?.split(':').shift();
const baseURL = localhost ? `http://${localhost}:3000/api` : 'http://localhost:3000/api';

export const axiosInstance = axios.create({
  baseURL,
});

let tokenFetcher: (() => Promise<string | null>) | null = null;

// 전역 Axios 인터셉터 설정 및 초기화 함수
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (tokenFetcher) {
        const token = await tokenFetcher();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error fetching Clerk token on mobile:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setupAxiosInterceptors = (getToken: () => Promise<string | null>) => {
  tokenFetcher = getToken;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
