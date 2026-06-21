import { useEffect, useState } from 'react';
import { LayoutDashboardIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Show, SignOutButton, useAuth } from '@clerk/react';
import SignInOAuthButtons from './SignInOAuthButtons';
import { axiosInstance } from '@/lib/axios';

const Topbar = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoaded || !isSignedIn) {
        setIsAdmin(false);
        return;
      }
      try {
        const response = await axiosInstance.get('/admin/check');
        if (response.status === 200) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.log(error);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [isLoaded, isSignedIn]);

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 backdrop-blur-md bg-zinc-900/75 z-10">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/spotify.svg" alt="Spotify" className="h-8 w-auto" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Show when="signed-in">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-sm hover:text-green-500 transition-colors cursor-pointer mr-2"
            >
              <LayoutDashboardIcon className="size-4" />
              Admin Dashboard
            </Link>
          )}
          <SignOutButton />
        </Show>
        <Show when="signed-out">
          <SignInOAuthButtons />
        </Show>
      </div>
    </div>
  );
};

export default Topbar;
