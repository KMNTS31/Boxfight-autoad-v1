import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false
    }
  });

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem("disclaimer_accepted") === "true";
    if (!disclaimerAccepted) {
      setLocation("/");
    } else if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-sm w-full relative z-10 space-y-8">
        <div className="space-y-6">
          <img
            src="/boxfight-banner.png"
            alt="! boxfight auto ad"
            className="w-full rounded-lg border border-white/10 brightness-90 shadow-2xl shadow-black"
          />
          <div className="text-center space-y-1">
            <h1 className="text-xl font-display font-black tracking-widest text-white uppercase">
              ! boxfight auto ad
            </h1>
            <p className="font-mono text-[11px] text-white/30 tracking-[0.35em] uppercase">
              command center
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full h-13 text-sm font-bold tracking-widest uppercase bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 shadow-lg shadow-[#5865F2]/20"
            onClick={handleLogin}
          >
            Login with Discord
          </Button>
          <p className="text-center font-mono text-[10px] text-white/20 tracking-wider">
            authorized users only
          </p>
        </div>
      </div>
    </div>
  );
}
