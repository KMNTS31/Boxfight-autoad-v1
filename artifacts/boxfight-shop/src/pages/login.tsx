import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-sidebar border border-border flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0 duration-300">
            <Terminal className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-black text-foreground tracking-tight">
            ! boxfight shop
          </h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
            Command Center
          </p>
        </div>

        <div className="pt-8">
          <Button
            size="lg"
            className="w-full h-16 text-lg font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 shadow-lg shadow-[#5865F2]/20"
            onClick={handleLogin}
          >
            Login with Discord
          </Button>
        </div>
      </div>
    </div>
  );
}
