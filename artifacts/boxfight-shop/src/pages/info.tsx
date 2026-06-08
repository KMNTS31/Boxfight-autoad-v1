import { useState } from "react";
import { useListTokens, getListTokensQueryKey, useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Users, Activity, MessageSquare, Copy, Eye, EyeOff, Loader2, Briefcase, Timer, StopCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | undefined }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c0c] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.1] hover:shadow-lg hover:shadow-black/50 cursor-default">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[8px] text-white/20 tracking-[0.35em] uppercase mb-1.5">{label}</p>
          <p className="text-2xl font-black text-white tabular-nums">{value ?? <span className="text-white/15 text-xl">—</span>}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04] group-hover:bg-white/[0.06] transition-colors shrink-0">
          <Icon className="w-3.5 h-3.5 text-white/25" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function Info() {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const { data: tokens, isLoading } = useListTokens({ query: { queryKey: getListTokensQueryKey() } });
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });

  const copy = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied" });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h1 className="text-lg font-display font-black tracking-widest text-white uppercase">Tokens & Stats</h1>
        <p className="text-white/25 font-mono text-[10px] tracking-wide mt-0.5">full platform overview · admin only</p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatCard icon={Users} label="Authorized Users" value={stats.totalAuthorizedUsers} />
            <StatCard icon={Activity} label="Active Jobs" value={stats.activeJobs} />
            <StatCard icon={MessageSquare} label="Messages Sent" value={stats.totalMessagesSent} />
            <StatCard icon={KeyRound} label="Total Tokens" value={stats.totalTokens} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatCard icon={Briefcase} label="Total Jobs" value={stats.totalJobs} />
            <StatCard icon={Timer} label="Pending" value={stats.pendingJobs} />
            <StatCard icon={StopCircle} label="Stopped" value={stats.stoppedJobs} />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completedJobs} />
          </div>
        </>
      )}

      <Card className="bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="flex items-center justify-between text-xs text-white/60 font-mono tracking-widest">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5" />
              captured tokens
            </div>
            {tokens && <span className="text-[9px] text-white/20 font-normal">{tokens.length} stored</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-4 h-4 animate-spin text-white/20" />
            </div>
          ) : !tokens?.length ? (
            <div className="m-4 text-center py-10 font-mono text-[10px] text-white/12 border border-dashed border-white/[0.05] rounded-xl">
              no tokens stored yet
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {tokens.map((t) => (
                <div key={t.id} className="px-5 py-4 hover:bg-white/[0.012] transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {t.discordAvatar ? (
                        <img src={t.discordAvatar} alt="" className="w-8 h-8 rounded-full border border-white/10 object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white/30 shrink-0">
                          {t.discordUsername[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white/75 font-mono truncate">{t.discordUsername}</p>
                        <p className="text-[9px] font-mono text-white/20 truncate">{t.discordUserId}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-mono text-white/25">
                        by <span className="text-white/40">{t.addedByUsername}</span>
                      </p>
                      <p className="text-[9px] font-mono text-white/15 mt-0.5">
                        {t.lastValidated ? formatDistanceToNow(new Date(t.lastValidated), { addSuffix: true }) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white/[0.025] border border-white/[0.05] rounded-lg px-3 py-2">
                      <code className="font-mono text-[9px] text-white/30 truncate block">
                        {revealed[t.id] ? t.token : "•".repeat(Math.min(t.token.length, 60))}
                      </code>
                    </div>
                    <button
                      className="p-2 rounded-lg text-white/20 hover:text-white/55 hover:bg-white/[0.05] active:scale-[0.9] transition-all shrink-0"
                      onClick={() => setRevealed(p => ({ ...p, [t.id]: !p[t.id] }))}
                    >
                      {revealed[t.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      className="p-2 rounded-lg text-white/20 hover:text-white/55 hover:bg-white/[0.05] active:scale-[0.9] transition-all shrink-0"
                      onClick={() => copy(t.token)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
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
