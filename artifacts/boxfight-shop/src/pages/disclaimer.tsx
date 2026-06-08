import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  const [, setLocation] = useLocation();

  const handleAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,rgba(255,255,255,0.025)_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(255,255,255,0.015)_0%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Banner */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-white/[0.07] shadow-2xl shadow-black/80">
          <img src="/boxfight-banner.png" alt="! boxfight" className="w-full object-cover max-h-52 brightness-85" />
        </div>

        {/* Card */}
        <div className="bg-[#080808] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="px-7 pt-7 pb-5 border-b border-white/[0.05] text-center">
            <h1 className="font-gothic text-3xl text-white leading-none tracking-wide mb-1">
              ! boxfight auto ad
            </h1>
            <p className="font-mono text-[9px] text-white/20 tracking-[0.45em] uppercase">
              restricted access
            </p>
          </div>

          {/* Warning */}
          <div className="px-7 py-5">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/20 border border-red-500/15 mb-5">
              <AlertTriangle className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" />
              <div className="font-mono text-xs text-white/50 space-y-1.5 leading-relaxed">
                <p><span className="text-red-400 font-bold">WARNING</span> — This tool automates Discord user accounts ("self-bots") which violates Discord's ToS.</p>
                <p className="text-white/30">Permanent account termination is a real risk.</p>
              </div>
            </div>

            <p className="font-mono text-[11px] text-white/30 mb-3">By clicking <span className="text-white/50">I Accept</span> you confirm:</p>
            <ul className="space-y-2 mb-6">
              {[
                "You use this entirely at your own risk",
                "Developers hold zero liability for bans or losses",
                "You understand and accept the consequences",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-white/15 font-mono text-xs shrink-0 mt-0.5">—</span>
                  <span className="font-mono text-xs text-white/40 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-11 font-mono font-bold tracking-widest uppercase text-[11px] bg-transparent border-white/[0.08] text-white/30 hover:bg-white/[0.04] hover:text-white/55 hover:border-white/15 active:scale-[0.97] transition-all duration-150"
                onClick={() => window.location.href = "https://discord.com"}
              >
                Leave
              </Button>
              <Button
                className="flex-1 h-11 font-mono font-bold tracking-widest uppercase text-[11px] bg-white text-black hover:bg-white/92 active:scale-[0.97] transition-all duration-150 shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-px"
                onClick={handleAccept}
              >
                I Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
