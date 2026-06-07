import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem("disclaimer_accepted") === "true";
    if (!disclaimerAccepted) {
      setLocation("/");
      return;
    }

    if (error) {
      setLocation("/login");
    }
  }, [error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (!user.isAuthorized && !user.isAdmin) {
    setLocation("/access-denied");
    return null;
  }

  if (requireAdmin && !user.isAdmin) {
    setLocation("/dashboard");
    return null;
  }

  return <>{children}</>;
}
