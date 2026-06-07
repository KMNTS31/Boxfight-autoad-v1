import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Disclaimer() {
  const [, setLocation] = useLocation();

  const handleAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setLocation("/login");
  };

  const handleDecline = () => {
    window.location.href = "https://discord.com";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,_rgba(255,255,255,0.03)_0%,_transparent_100%)] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 space-y-4">
        <div className="overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl shadow-black">
          <img
            src="/boxfight-banner.png"
            alt="! boxfight auto ad"
            className="w-full object-cover max-h-56 brightness-90"
          />
        </div>

        <div className="bg-[#080808] border border-white/[0.08] rounded-xl p-7 shadow-2xl shadow-black space-y-5">
          <div className="text-center space-y-1">
            <h1 className="font-gothic text-3xl text-white leading-none tracking-wide">
              ! boxfight auto ad
            </h1>
            <p className="font-mono text-[10px] text-white/25 tracking-[0.35em] uppercase">restricted access</p>
          </div>

          <div className="border border-white/[0.07] bg-white/[0.015] rounded-lg p-5 font-mono text-sm space-y-3 text-white/60 leading-relaxed">
            <p>
              <span className="text-red-400 font-bold">[WARNING]</span>{" "}
              This tool automates Discord user accounts ("self-bots").
            </p>
            <p>Self-botting violates Discord's ToS and risks permanent account termination.</p>
            <p className="text-white/40">By proceeding you confirm:</p>
            <ul className="space-y-1.5 pl-1 text-white/50">
              <li className="flex gap-2.5"><span className="text-white/20 shrink-0">—</span>You use this entirely at your own risk.</li>
              <li className="flex gap-2.5"><span className="text-white/20 shrink-0">—</span>Developers hold zero liability for bans or losses.</li>
              <li className="flex gap-2.5"><span className="text-white/20 shrink-0">—</span>You understand the consequences.</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 font-bold tracking-widest uppercase text-xs bg-transparent border-white/10 text-white/40 hover:bg-white/[0.04] hover:text-white/60 hover:border-white/20 transition-all"
              onClick={handleDecline}
            >
              Leave
            </Button>
            <Button
              className="flex-1 h-11 font-bold tracking-widest uppercase text-xs bg-white text-black hover:bg-white/90 active:bg-white/80 border-0 shadow-lg shadow-white/10 transition-all"
              onClick={handleAccept}
            >
              I Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
