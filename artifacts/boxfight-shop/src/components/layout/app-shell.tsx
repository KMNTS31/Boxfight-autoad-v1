import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, useLogout } from "@workspace/api-client-react";
import {
  ShieldAlert, KeyRound, LogOut, Loader2, LayoutDashboard,
  Activity, Menu, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface AppShellProps { children: React.ReactNode }

export function AppShell({ children }: AppShellProps) {
  const [location, setLocation] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  const logoutMutation = useLogout();

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { queryClient.clear(); setLocation("/login"); },
      onError: () => { queryClient.clear(); setLocation("/login"); },
    });
  };

  const navItems = [
    { href: "/dashboard", label: "dashboard", icon: LayoutDashboard },
    { href: "/token-settings", label: "tokens", icon: KeyRound },
    ...(user?.isAdmin ? [
      { href: "/admin", label: "authorize", icon: ShieldAlert },
      { href: "/info", label: "stats & logs", icon: Activity },
    ] : []),
  ];

  const NavContent = () => (
    <>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 text-xs font-mono tracking-wider ${
                active
                  ? "bg-white/[0.09] text-white"
                  : "text-white/35 hover:bg-white/[0.05] hover:text-white/65 active:scale-[0.97]"
              }`}>
                <item.icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? "text-white/70" : "text-white/20 group-hover:text-white/45"}`} />
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/40" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full border border-white/15 shrink-0 object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-xs font-bold text-white/40 shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono font-bold text-white/70 truncate">{user?.username}</p>
            <p className="text-[9px] font-mono text-white/20">{user?.isAdmin ? "admin" : "user"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-7 text-white/20 hover:text-red-400/70 hover:bg-red-900/10 font-mono text-[10px] tracking-wider px-2 transition-all duration-150 active:scale-[0.97]"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
          {logoutMutation.isPending ? "logging out..." : "logout"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#020202] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-48 bg-[#070707] border-r border-white/[0.05] flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-4 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <img src="/favicon.png" alt="" className="w-5 h-5 rounded-full object-cover shrink-0 opacity-80" />
            <span className="font-gothic text-[17px] text-white leading-none tracking-wide">! boxfight</span>
          </div>
          <p className="font-mono text-[7px] text-white/15 tracking-[0.4em] uppercase mt-0.5 pl-6">auto ad</p>
        </div>
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[#070707]/95 backdrop-blur-sm border-b border-white/[0.05] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 opacity-80" />
          <span className="font-gothic text-lg text-white leading-none tracking-wide">! boxfight</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 active:scale-[0.93] transition-all duration-150"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#070707] border-r border-white/[0.07] flex flex-col transition-transform duration-200 ease-out ${
        drawerOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="px-4 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="" className="w-6 h-6 rounded-full object-cover shrink-0 opacity-80" />
            <span className="font-gothic text-lg text-white leading-none tracking-wide">! boxfight</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 active:scale-[0.93] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <NavContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
