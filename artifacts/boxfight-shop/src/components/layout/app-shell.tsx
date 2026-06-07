import { Link, useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useLogout } from "@workspace/api-client-react";
import { ShieldAlert, KeyRound, LogOut, Loader2, LayoutDashboard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/login");
      },
      onError: () => {
        queryClient.clear();
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
      <aside className="w-full md:w-52 bg-[#070707] border-r border-white/[0.06] flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <span className="font-gothic text-lg text-white leading-none tracking-wide">! boxfight</span>
          </div>
          <p className="font-mono text-[8px] text-white/15 tracking-[0.35em] uppercase mt-0.5 pl-5">auto ad</p>
        </div>

        <nav className="flex-1 px-2.5 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-all duration-100 text-xs font-mono tracking-wider ${
                location === item.href
                  ? "bg-white/10 text-white"
                  : "text-white/35 hover:bg-white/[0.04] hover:text-white/60"
              }`}>
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label.toLowerCase()}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md mb-1">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-white/15 shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40 shrink-0">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-white/75 truncate">{user?.username}</p>
              <p className="text-[9px] font-mono text-white/25 truncate">
                {user?.isAdmin ? "admin" : "user"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-7 text-white/25 hover:text-red-400/80 hover:bg-red-900/10 font-mono text-[10px] tracking-wider px-2 transition-colors"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <LogOut className="w-3 h-3" />
            }
            {logoutMutation.isPending ? "logging out..." : "logout"}
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#030303]">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
