import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 127.14 96.36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
    </svg>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const setLocationRef = useRef(setLocation);
  setLocationRef.current = setLocation;

  const { data: user, isLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), retry: false }
  });

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem("disclaimer_accepted") === "true";
    if (!disclaimerAccepted) {
      setLocationRef.current("/");
    } else if (user) {
      setLocationRef.current("/dashboard");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_rgba(255,255,255,0.025)_0%,_transparent_100%)] pointer-events-none" />

      <div className="max-w-sm w-full relative z-10 space-y-7">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl shadow-black">
            <img
              src="/boxfight-banner.png"
              alt="! boxfight auto ad"
              className="w-full object-cover brightness-90"
            />
          </div>
          <div className="text-center space-y-1">
            <h1 className="font-gothic text-3xl text-white leading-none tracking-wide">
              ! boxfight auto ad
            </h1>
            <p className="font-mono text-[10px] text-white/25 tracking-[0.4em] uppercase">
              command center
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="w-full h-12 text-sm font-bold bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3b45b0] text-white border-0 shadow-lg shadow-[#5865F2]/20 transition-all duration-150 gap-3"
            onClick={handleLogin}
          >
            <DiscordIcon className="w-5 h-5 shrink-0" />
            Login with Discord
          </Button>
          <p className="text-center font-mono text-[10px] text-white/15 tracking-wider">
            authorized users only · admins auto-approved
          </p>
        </div>
      </div>
    </div>
  );
}
