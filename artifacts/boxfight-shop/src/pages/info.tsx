import { useState } from "react";
import { useListTokens, getListTokensQueryKey, useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Users, Activity, MessageSquare, Copy, Eye, EyeOff, Loader2, Briefcase, Timer, StopCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | undefined; sub?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#0c0c0c] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/50 cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[9px] text-white/25 tracking-widest uppercase mb-1">{label}</p>
          <p className="text-2xl font-black text-white tabular-nums">{value ?? <span className="text-white/20 text-lg">—</span>}</p>
          {sub && <p className="font-mono text-[9px] text-white/20 mt-1">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.05] transition-colors">
          <Icon className="w-4 h-4 text-white/30" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function Info() {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const { data: tokens, isLoading: tokensLoading } = useListTokens({ query: { queryKey: getListTokensQueryKey() } });
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });

  const toggleReveal = (id: number) => setRevealed(p => ({ ...p, [id]: !p[id] }));
  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied", description: "Token copied to clipboard." });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-display font-black tracking-widest text-white uppercase">Tokens & Stats</h1>
        <p className="text-white/30 font-mono text-xs tracking-wide mt-0.5">full platform overview · admin only</p>
      </div>

      {stats && (
        <>
          {/* Primary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Authorized Users" value={stats.totalAuthorizedUsers} />
            <StatCard icon={Activity} label="Active Jobs" value={stats.activeJobs} />
            <StatCard icon={MessageSquare} label="Messages Sent" value={stats.totalMessagesSent} />
            <StatCard icon={KeyRound} label="Total Tokens" value={stats.totalTokens} />
          </div>

          {/* Extended job stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Briefcase} label="Total Jobs" value={stats.totalJobs} />
            <StatCard icon={Timer} label="Pending" value={stats.pendingJobs} />
            <StatCard icon={StopCircle} label="Stopped" value={stats.stoppedJobs} />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completedJobs} />
          </div>
        </>
      )}

      {/* Tokens table */}
      <Card className="bg-[#0a0a0a] border-white/[0.07] shadow-xl shadow-black/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-white font-mono tracking-wider">
            <KeyRound className="w-4 h-4 text-white/40" />
            captured tokens
            {tokens && (
              <span className="ml-auto text-[10px] text-white/20 font-mono font-normal">{tokens.length} stored</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tokensLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
          ) : !tokens?.length ? (
            <div className="mx-4 mb-4 text-center py-10 text-white/15 font-mono text-xs border border-dashed border-white/[0.06] rounded-lg">
              no tokens stored yet
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {tokens.map((t) => (
                <div key={t.id} className="px-5 py-4 hover:bg-white/[0.015] transition-colors">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {t.discordAvatar ? (
                        <img src={t.discordAvatar} alt="" className="w-9 h-9 rounded-full border border-white/10 object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-sm font-bold text-white/30 shrink-0">
                          {t.discordUsername[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white/80 font-mono">{t.discordUsername}</p>
                        <p className="text-[10px] font-mono text-white/25">{t.discordUserId}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-mono text-white/30">added by <span className="text-white/50">{t.addedByUsername}</span></p>
                      <p className="text-[10px] font-mono text-white/20 mt-0.5">
                        {t.lastValidated
                          ? `validated ${formatDistanceToNow(new Date(t.lastValidated), { addSuffix: true })}`
                          : format(new Date(t.addedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.05] rounded-md px-3 py-2">
                      <code className="font-mono text-[10px] text-white/35 truncate block">
                        {revealed[t.id] ? t.token : "•".repeat(Math.min(t.token.length, 60))}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/20 hover:text-white/50 hover:bg-white/5 transition-all shrink-0"
                      onClick={() => toggleReveal(t.id)}
                    >
                      {revealed[t.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/20 hover:text-white/50 hover:bg-white/5 transition-all shrink-0"
                      onClick={() => copyToken(t.token)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
