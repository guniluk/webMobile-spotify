import { create, isAxiosError } from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

// 1. .env에 설정된 백엔드 API 주소가 있다면 이를 우선 사용 (환경 변수가 빌드 시점에 주입됨)
const envBaseURL = process.env.EXPO_PUBLIC_BACKEND_URL;

// 2. Expo dev 환경에서 실행 중인 호스트 PC의 로컬 IP를 동적으로 탐색하여 API 주소 설정
const hostIp = Constants.expoConfig?.hostUri?.split(':').shift();

// iOS 시뮬레이터는 localhost, 안드로이드 에뮬레이터는 10.0.2.2를 사용하여 호스트 PC의 로컬 서버에 접근합니다.
const defaultLocalhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

let baseURL = envBaseURL;

// 만약 환경 변수에 localhost가 정의되어 있어 모바일 실기기에서 접속이 안 되는 경우를 위해 동적 IP로 자동 변환합니다.
if (!baseURL || baseURL.includes('localhost') || baseURL.includes('127.0.0.1')) {
  const targetHost = hostIp || defaultLocalhost;
  if (baseURL) {
    baseURL = baseURL.replace('localhost', targetHost).replace('127.0.0.1', targetHost);
  } else {
    baseURL = `http://${targetHost}:3000/api`;
  }
}

console.log(`[Axios] Env backend URL:`, envBaseURL);
console.log(`[Axios] Expo Host URI:`, Constants.expoConfig?.hostUri);
console.log(`[Axios] Platform OS:`, Platform.OS);
console.log(`[Axios] Determined baseURL:`, baseURL);

export const axiosInstance = create({
  baseURL,
  timeout: 5000, // 5초 타임아웃 설정으로 네트워크 장애 시 무한 대기 방지
});

// 비동기 작업에 타임아웃을 적용하는 헬퍼 함수
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: T,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
};

let tokenFetcher: (() => Promise<string | null>) | null = null;

// 전역 Axios 인터셉터 설정 및 초기화 함수
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      if (tokenFetcher) {
        // Clerk getToken() 호출에 3초 타임아웃을 걸어 모바일 환경 무한 대기 방지
        const token = await withTimeout(tokenFetcher(), 3000, null);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Error fetching Clerk token on mobile:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export const setupAxiosInterceptors = (
  getToken: () => Promise<string | null>,
) => {
  tokenFetcher = getToken;
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
