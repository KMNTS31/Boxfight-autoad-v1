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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.04)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-2xl w-full relative z-10">
        <div className="mb-8 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-white/5">
          <img
            src="/boxfight-banner.png"
            alt="! boxfight auto ad"
            className="w-full object-cover max-h-64 brightness-90 contrast-110"
          />
        </div>

        <div className="bg-[#080808] border border-white/10 rounded-xl p-8 shadow-2xl shadow-black space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-widest text-white uppercase">
              ! boxfight auto ad
            </h1>
            <p className="font-mono text-xs text-white/40 tracking-[0.3em] uppercase">restricted access</p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] rounded-lg p-5 font-mono text-sm space-y-3 text-white/70 leading-relaxed">
            <p>
              <span className="text-red-400 font-bold">[WARNING]</span>{" "}
              This tool automates Discord user accounts ("self-bots").
            </p>
            <p>
              Self-botting violates Discord's ToS and risks permanent account termination.
            </p>
            <p className="text-white/50">By proceeding you confirm:</p>
            <ul className="list-none space-y-1.5 pl-2 text-white/60">
              <li className="flex gap-2"><span className="text-white/30">—</span> You use this at your own risk.</li>
              <li className="flex gap-2"><span className="text-white/30">—</span> Developers hold zero liability for bans or losses.</li>
              <li className="flex gap-2"><span className="text-white/30">—</span> You understand the consequences.</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-12 font-bold tracking-widest uppercase text-sm bg-transparent border-white/15 text-white/50 hover:bg-white/5 hover:text-white/80 hover:border-white/25"
              onClick={handleDecline}
            >
              Leave
            </Button>
            <Button
              size="lg"
              className="flex-1 h-12 font-bold tracking-widest uppercase text-sm bg-white text-black hover:bg-white/90 border-0 shadow-lg shadow-white/10"
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
