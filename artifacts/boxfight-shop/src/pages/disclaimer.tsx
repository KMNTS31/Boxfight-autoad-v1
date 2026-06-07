import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-destructive/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl w-full bg-card border border-destructive/20 rounded-xl p-8 md:p-12 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 mb-2">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-display font-black text-foreground uppercase tracking-tight">
            RESTRICTED <span className="text-destructive">ACCESS</span>
          </h1>
          
          <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed font-mono text-left bg-black/40 p-6 rounded-lg border border-border">
            <p>
              <span className="text-destructive font-bold">[WARNING]</span> You are about to access a tool designed for Discord automation.
            </p>
            <p>
              Using automated user accounts ("self-bots") is strictly against Discord's Terms of Service. Utilizing this tool carries a significant risk of having your Discord account permanently banned.
            </p>
            <p>
              By proceeding, you acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-foreground/80">
              <li>You are using this software entirely at your own risk.</li>
              <li>The developers take zero responsibility for any account actions, bans, or data loss.</li>
              <li>You understand the consequences of automating user accounts.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full pt-6">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-14 font-bold tracking-wide uppercase border-muted-foreground/30 hover:bg-muted"
              onClick={handleDecline}
            >
              Leave Site
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="flex-1 h-14 font-bold tracking-wide uppercase"
              onClick={handleAccept}
            >
              I Understand & Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
