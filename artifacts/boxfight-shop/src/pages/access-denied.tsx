import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-destructive/20 rounded-xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-display font-black text-foreground uppercase tracking-tight">
          Access Denied
        </h1>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your account is not authorized to use this tool. Please contact an administrator to request access.
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setLocation("/login")}
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
}
