import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldX, Loader2 } from "lucide-react";

export default function AccessDenied() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleBackToLogin = async () => {
    setLoading(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(220,38,38,0.04)_0%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-[#0a0a0a] border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/60 text-center space-y-6">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full" />
            <div className="relative w-16 h-16 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-red-400/60" />
            </div>
          </div>

          <div>
            <h1 className="font-gothic text-3xl text-white leading-none tracking-wide mb-1">
              Access Denied
            </h1>
            <p className="font-mono text-[9px] text-white/20 tracking-[0.4em] uppercase">unauthorized</p>
          </div>

          <p className="text-white/30 text-sm leading-relaxed font-mono text-center">
            Your account is not authorized.<br />Contact an admin to request access.
          </p>

          <Button
            className="w-full h-11 bg-white text-black font-bold font-mono text-xs tracking-widest uppercase hover:bg-white/92 active:scale-[0.97] transition-all duration-150 shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-px"
            onClick={handleBackToLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "back to login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
