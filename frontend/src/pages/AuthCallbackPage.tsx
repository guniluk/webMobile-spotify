import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Music } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { axiosInstance } from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

const AuthCallbackPage = () => {
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const syncAttemped = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user || syncAttemped.current) return;
      try {
        syncAttemped.current = true;
        await axiosInstance.post('/auth/callback', {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        });
      } catch (error) {
        console.log('error at auth callback:', error);
      } finally {
        navigate('/');
      }
    };
    syncUser();
  }, [isLoaded, user, navigate]);
  return (
    <div className="h-screen w-full bg-[radial-gradient(ellipse_at_top, var(--tw-gradient-stops))] from-emerald-950/20 via-zinc-950 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 shadow-2xl shadow-emerald-950/10">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          {/* Logo / Icon Container with Glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-16 h-16 bg-zinc-800/80 rounded-full flex items-center justify-center border border-emerald-500/30">
              <Music
                className="w-8 h-8 text-emerald-500 animate-bounce"
                style={{ animationDuration: '2s' }}
              />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight mb-2">
            Logging you in
          </h2>

          {/* Subtext */}
          <p className="text-sm text-zinc-400 max-w-xs mb-8 leading-relaxed">
            Connecting to Spotify
            <br />
            Please wait...
          </p>

          {/* Elegant Loading Bar or Spinner */}
          <div className="flex items-center gap-3 bg-zinc-950/50 px-4 py-2.5 rounded-full border border-zinc-800/50">
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
            <span className="text-xs font-medium text-emerald-500/90 tracking-wide uppercase">
              Connecting to Spotify
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
