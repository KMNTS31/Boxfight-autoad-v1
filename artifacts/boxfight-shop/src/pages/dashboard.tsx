import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGetMe, getGetMeQueryKey,
  useValidateToken, useSendMessage,
  useListMessageJobs, getListMessageJobsQueryKey,
  useStopMessageJob, useGetStats, getGetStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Play, Square, Activity, Users, MessageSquare, CheckCircle2, Loader2, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const messageSchema = z.object({
  message: z.string().min(1, "Required"),
  channelId: z.string().min(1, "Required"),
  delaySeconds: z.coerce.number().min(0),
  intervalSeconds: z.coerce.number().min(1),
  repeatCount: z.coerce.number().min(0),
});
type MF = z.infer<typeof messageSchema>;

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | undefined }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/60 cursor-default">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] text-white/25 tracking-[0.3em] uppercase mb-2">{label}</p>
          <p className="text-3xl font-black text-white tabular-nums tracking-tight">
            {value !== undefined ? value : <span className="text-white/15 text-2xl">—</span>}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05] group-hover:bg-white/[0.07] group-hover:border-white/[0.09] transition-all duration-200 shrink-0">
          <Icon className="w-4 h-4 text-white/30" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });

  const [discordToken, setDiscordToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenUser, setTokenUser] = useState<{ username?: string | null; avatar?: string | null } | null>(null);

  const validateMutation = useValidateToken();
  const sendMutation = useSendMessage();
  const stopMutation = useStopMessageJob();

  const { data: jobs, isLoading: jobsLoading } = useListMessageJobs({ query: { queryKey: getListMessageJobsQueryKey() } });
  const { data: stats } = useGetStats({ query: { queryKey: getGetStatsQueryKey() } });

  const form = useForm<MF>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "", channelId: "", delaySeconds: 0, intervalSeconds: 60, repeatCount: 1 },
  });

  const handleValidate = () => {
    if (!tokenInput) return;
    validateMutation.mutate({ data: { token: tokenInput } }, {
      onSuccess: (data) => {
        if (data.valid) {
          setDiscordToken(tokenInput);
          setTokenUser({ username: data.username, avatar: data.avatar });
          toast({ title: "Token connected", description: `Signed in as ${data.username}` });
        } else {
          toast({ variant: "destructive", title: "Invalid token", description: data.message });
        }
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Validation failed." }),
    });
  };

  const onSubmit = (data: MF) => {
    if (!discordToken) return;
    sendMutation.mutate({ data: { token: discordToken, ...data } }, {
      onSuccess: () => {
        toast({ title: "Sequence started" });
        qc.invalidateQueries({ queryKey: getListMessageJobsQueryKey() });
        form.reset();
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to start." }),
    });
  };

  const handleStop = (jobId: string) => {
    stopMutation.mutate({ jobId }, {
      onSuccess: () => { toast({ title: "Job stopped" }); qc.invalidateQueries({ queryKey: getListMessageJobsQueryKey() }); },
      onError: () => toast({ variant: "destructive", title: "Error" }),
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-lg font-display font-black tracking-widest text-white uppercase">Command Center</h1>
        <p className="text-white/25 font-mono text-[10px] tracking-wide mt-0.5">
          welcome, <span className="text-white/45">{user?.username}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Authorized Users" value={stats?.totalAuthorizedUsers} />
        <StatCard icon={Activity} label="Active Jobs" value={stats?.activeJobs} />
        <StatCard icon={MessageSquare} label="Messages Sent" value={stats?.totalMessagesSent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Token + Form */}
        <div className="lg:col-span-3 space-y-4">
          {/* Token */}
          <Card className="bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="flex items-center gap-2 text-xs text-white/60 font-mono tracking-widest">
                <KeyRound className="w-3.5 h-3.5" />
                discord connection
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {discordToken ? (
                <div className="flex items-center justify-between p-3.5 bg-white/[0.025] rounded-xl border border-white/[0.07]">
                  <div className="flex items-center gap-3">
                    {tokenUser?.avatar ? (
                      <img src={tokenUser.avatar} alt="" className="w-9 h-9 rounded-full border border-white/15 object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center font-bold text-white/40">
                        {tokenUser?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white/80 font-mono">{tokenUser?.username}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[9px] font-mono text-emerald-400/70">token active</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="font-mono text-[10px] text-white/25 hover:text-white/55 transition-colors px-2 py-1 rounded hover:bg-white/5"
                    onClick={() => { setDiscordToken(""); setTokenUser(null); setTokenInput(""); }}
                  >
                    change
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <Input
                    type="password"
                    placeholder="Discord User Token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                    className="font-mono text-sm bg-white/[0.025] border-white/[0.07] text-white placeholder:text-white/15 focus-visible:ring-white/15 focus-visible:border-white/20 h-10 transition-all"
                  />
                  <Button
                    onClick={handleValidate}
                    disabled={!tokenInput || validateMutation.isPending}
                    className="h-10 px-5 bg-white text-black font-bold font-mono text-[11px] tracking-widest uppercase hover:bg-white/90 active:scale-[0.96] transition-all duration-150 shrink-0 shadow-md shadow-white/8 hover:shadow-white/15 hover:-translate-y-px"
                  >
                    {validateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "connect"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message form */}
          <Card className={`bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40 transition-all duration-300 ${!discordToken ? "opacity-35 pointer-events-none select-none" : ""}`}>
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="flex items-center gap-2 text-xs text-white/60 font-mono tracking-widest">
                <Play className="w-3.5 h-3.5" />
                sequence configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="channelId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/35 font-mono text-[10px] tracking-widest uppercase">Channel ID</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789012345678" className="font-mono text-sm bg-white/[0.025] border-white/[0.07] text-white placeholder:text-white/15 focus-visible:ring-white/15 h-10 transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/35 font-mono text-[10px] tracking-widest uppercase">Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type your message..." className="min-h-[90px] font-mono text-sm bg-white/[0.025] border-white/[0.07] text-white placeholder:text-white/15 focus-visible:ring-white/15 resize-none transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-3 gap-2.5">
                    {([
                      ["delaySeconds", "Delay (s)"],
                      ["intervalSeconds", "Interval (s)"],
                      ["repeatCount", "Repeats (0=∞)"],
                    ] as const).map(([name, label]) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/35 font-mono text-[9px] tracking-widest uppercase">{label}</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" className="font-mono text-sm bg-white/[0.025] border-white/[0.07] text-white focus-visible:ring-white/15 h-9 transition-all" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ))}
                  </div>
                  <Button
                    type="submit"
                    disabled={sendMutation.isPending}
                    className="w-full h-11 font-bold font-mono tracking-widest uppercase text-[11px] bg-white text-black hover:bg-white/90 active:scale-[0.97] transition-all duration-150 shadow-md shadow-white/8 hover:shadow-white/18 hover:-translate-y-px"
                  >
                    {sendMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />initializing...</>
                      : <><Play className="w-3.5 h-3.5 mr-2" />launch sequence</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Jobs */}
        <div className="lg:col-span-2">
          <Card className="bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40 h-full">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="flex items-center justify-between text-xs text-white/60 font-mono tracking-widest">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  active jobs
                </div>
                {jobs && jobs.length > 0 && (
                  <span className="text-[9px] text-white/20">{jobs.filter(j => j.status === "running").length} running</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {jobsLoading ? (
                <div className="flex justify-center py-14">
                  <Loader2 className="w-4 h-4 animate-spin text-white/20" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="divide-y divide-white/[0.04]">
                  {jobs.map((job) => (
                    <div key={job.id} className="px-5 py-4 hover:bg-white/[0.015] transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {job.status === "running" && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                          )}
                          <Hash className="w-3 h-3 text-white/20" />
                          <span className="font-mono text-[11px] text-white/60">{job.channelId}</span>
                        </div>
                        <Badge variant="outline" className={`text-[8px] font-mono px-1.5 h-4 border-0 ${
                          job.status === "running" ? "bg-emerald-500/10 text-emerald-400" :
                          job.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-white/5 text-white/25"
                        }`}>{job.status}</Badge>
                      </div>
                      <p className="font-mono text-[10px] text-white/25 truncate mb-2.5 italic">"{job.message}"</p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-0.5 flex-1 bg-white/[0.05] rounded-full overflow-hidden">
                            {job.repeatCount > 0 && (
                              <div className="h-full bg-white/25 rounded-full" style={{ width: `${Math.min((job.sentCount / job.repeatCount) * 100, 100)}%` }} />
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-white/25 shrink-0">
                            {job.sentCount}{job.repeatCount > 0 ? `/${job.repeatCount}` : ""}
                          </span>
                        </div>
                        {(job.status === "running" || job.status === "pending") && (
                          <button
                            className="flex items-center gap-1 text-[9px] font-mono text-red-400/40 hover:text-red-400/80 transition-colors active:scale-[0.9]"
                            onClick={() => handleStop(job.id)}
                          >
                            <Square className="w-2.5 h-2.5 fill-current" />stop
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="m-4 text-center py-10 font-mono text-[10px] text-white/12 border border-dashed border-white/[0.05] rounded-xl">
                  no active sequences
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
