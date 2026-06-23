import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader } from 'lucide-react';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { checkAdminStatus, reset } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error setting auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  useEffect(() => {
    const initAuth = async () => {
      if (isLoaded) {
        if (isSignedIn) {
          try {
            await checkAdminStatus();
          } catch (error) {
            console.error('Error checking admin status:', error);
          }
        } else {
          reset();
        }
        setLoading(false);
      }
    };
    initAuth();
  }, [isLoaded, isSignedIn, checkAdminStatus, reset]);

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  return <>{children}</>;
};

export default AuthProvider;
