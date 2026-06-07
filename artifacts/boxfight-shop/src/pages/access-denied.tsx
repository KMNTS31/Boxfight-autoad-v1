import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function AccessDenied() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleBackToLogin = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — proceed anyway
    }
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0a0a0a] border border-white/[0.07] rounded-xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-950/30 flex items-center justify-center border border-red-500/20 mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-400/70" />
        </div>

        <div className="space-y-2">
          <h1 className="font-gothic text-3xl text-white leading-none tracking-wide">
            Access Denied
          </h1>
          <p className="font-mono text-[10px] text-white/20 tracking-[0.3em] uppercase">
            unauthorized
          </p>
        </div>

        <p className="text-white/35 text-sm leading-relaxed font-mono">
          Your account is not authorized to use this tool. Contact an administrator to request access.
        </p>

        <Button
          className="w-full h-10 bg-white text-black font-bold font-mono text-xs tracking-widest uppercase hover:bg-white/90 active:scale-[0.97] transition-all duration-150 shadow-lg shadow-white/10 hover:-translate-y-px"
          onClick={handleBackToLogin}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "back to login"}
        </Button>
      </div>
    </div>
  );
}
