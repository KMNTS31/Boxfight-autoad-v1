import { Link, useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useLogout } from "@workspace/api-client-react";
import { ShieldAlert, KeyRound, LogOut, Loader2, LayoutDashboard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location, setLocation] = useLocation();
  const { data: user } = useGetMe({
    query: { queryKey: getGetMeQueryKey() }
  });
  
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(user?.isAdmin ? [
      { href: "/admin", label: "Authorize", icon: ShieldAlert },
      { href: "/info", label: "Tokens & Stats", icon: KeyRound }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      <aside className="w-full md:w-56 bg-[#080808] border-r border-white/[0.07] flex flex-col">
        <div className="p-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2 font-display font-black text-white tracking-widest uppercase text-sm">
            <Zap className="w-4 h-4 text-white/60" />
            <span>! boxfight</span>
          </div>
          <p className="font-mono text-[9px] text-white/20 tracking-[0.3em] uppercase mt-0.5 pl-6">auto ad</p>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all text-sm font-mono tracking-wide ${
                  location === item.href
                    ? "bg-white/10 text-white font-bold"
                    : "text-white/40 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.07] space-y-3">
          <div className="flex items-center gap-3 px-1">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full border border-white/20" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/80 truncate font-mono">{user?.username}</p>
              <p className="text-[10px] text-white/30 truncate font-mono">
                {user?.isAdmin ? "admin" : "user"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8 text-white/30 hover:text-red-400 hover:bg-red-400/5 font-mono text-xs tracking-wide"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
            logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
