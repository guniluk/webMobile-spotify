import { useState } from "react";
import { createPortal } from "react-dom";
import { LayoutDashboardIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Show, useAuth, useUser } from "@clerk/react";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/store/useAuthStore";

const Topbar = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { isAdmin } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 backdrop-blur-md bg-zinc-900/75 z-10">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/spotify.svg" alt="Spotify" className="h-8 w-auto" />
          <span className="text-2xl font-bold">Spotify</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Show when="signed-in">
          {isAdmin && location.pathname !== "/admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-sm hover:text-green-500 transition-colors cursor-pointer mr-2"
            >
              <LayoutDashboardIcon className="size-4" />
              Admin Dashboard
            </Link>
          )}
          {user && (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 hover:border-white transition-all cursor-pointer focus:outline-none"
            >
              <img
                src={user.imageUrl}
                alt={user.fullName || "User profile"}
                className="w-full h-full object-cover"
              />
            </button>
          )}
        </Show>
        <Show when="signed-out">
          <SignInOAuthButtons />
        </Show>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100"
              onClick={() => setShowLogoutModal(false)}
            />
            {/* Modal Content */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#181818] border border-zinc-800 p-6 rounded-lg max-w-xs w-[90%] md:w-full shadow-2xl text-center space-y-4 z-100 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-lg font-bold text-white">
                Log out of Spotify?
              </h4>
              <p className="text-xs text-zinc-400">
                You will need to sign in again to access all features.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setShowLogoutModal(false);
                  }}
                  className="px-6 py-2 bg-white text-black hover:bg-neutral-200 transition-colors text-xs font-bold rounded-full"
                >
                  OK
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

export default Topbar;
