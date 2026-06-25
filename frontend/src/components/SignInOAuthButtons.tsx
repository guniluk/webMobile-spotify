import { useAuth, useSignIn } from "@clerk/react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();

  if (!isLoaded) return null;

  const handleSignIn = async (strategy: "oauth_google") => {
    try {
      await signIn.sso({
        strategy,
        redirectUrl: "/auth-callback",
        redirectCallbackUrl: "/sso-callback",
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={"secondary"}
        onClick={() => handleSignIn("oauth_google")}
        className="flex items-center justify-center w-full gap-2 text-white border-zinc-200 h-11"
      >
        <img src="/google.png" alt="Google" className="w-5 h-5" />
        Sign in with Google
      </Button>
    </div>
  );
};

export default SignInOAuthButtons;
