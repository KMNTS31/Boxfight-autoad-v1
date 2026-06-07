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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Play, Square, RefreshCcw, Activity, Users, MessageSquare, Hash, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const messageSchema = z.object({
  message: z.string().min(1, "Required"),
  channelId: z.string().min(1, "Required"),
  delaySeconds: z.coerce.number().min(0),
  intervalSeconds: z.coerce.number().min(1),
  repeatCount: z.coerce.number().min(0),
});
type MessageFormValues = z.infer<typeof messageSchema>;

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | undefined; color: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-xl border bg-[#0a0a0a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl hover:shadow-black/50 cursor-default ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase mb-1">{label}</p>
          <p className="text-3xl font-black text-white tabular-nums">
            {value ?? <span className="text-white/20">—</span>}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.07] transition-colors">
          <Icon className="w-5 h-5 text-white/40" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });

  const [discordToken, setDiscordToken] = useState("");
  const [tokenInputStr, setTokenInputStr] = useState("");
  const [validatedUser, setValidatedUser] = useState<{ username?: string | null; avatar?: string | null } | null>(null);

  const validateTokenMutation = useValidateToken();
  const sendMessageMutation = useSendMessage();
  const stopJobMutation = useStopMessageJob();

  const { data: jobs, isLoading: jobsLoading } = useListMessageJobs({
    query: { queryKey: getListMessageJobsQueryKey() }
  });
  const { data: stats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: "", channelId: "", delaySeconds: 0, intervalSeconds: 60, repeatCount: 1 },
  });

  const handleValidateToken = () => {
    if (!tokenInputStr) return;
    validateTokenMutation.mutate({ data: { token: tokenInputStr } }, {
      onSuccess: (data) => {
        if (data.valid) {
          setDiscordToken(tokenInputStr);
          setValidatedUser({ username: data.username, avatar: data.avatar });
          toast({ title: "Token validated", description: `Connected as ${data.username}` });
        } else {
          toast({ variant: "destructive", title: "Invalid token", description: data.message });
        }
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to validate token." }),
    });
  };

  const onSubmit = (data: MessageFormValues) => {
    if (!discordToken) return;
    sendMessageMutation.mutate({ data: { token: discordToken, ...data } }, {
      onSuccess: () => {
        toast({ title: "Job started", description: "Message sequence queued." });
        queryClient.invalidateQueries({ queryKey: getListMessageJobsQueryKey() });
        form.reset();
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to start job." }),
    });
  };

  const handleStop = (jobId: string) => {
    stopJobMutation.mutate({ jobId }, {
      onSuccess: () => {
        toast({ title: "Job stopped" });
        queryClient.invalidateQueries({ queryKey: getListMessageJobsQueryKey() });
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to stop job." }),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div>
        <h1 className="text-xl font-display font-black tracking-widest text-white uppercase">Command Center</h1>
        <p className="text-white/30 font-mono text-xs tracking-wide mt-0.5">
          welcome back, <span className="text-white/50">{user?.username}</span>
        </p>
      </div>

      {/* Stats — visible to all */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Users} label="Authorized Users" value={stats?.totalAuthorizedUsers} color="border-white/[0.07]" />
        <StatCard icon={Activity} label="Active Jobs" value={stats?.activeJobs} color="border-white/[0.07]" />
        <StatCard icon={MessageSquare} label="Messages Sent" value={stats?.totalMessagesSent} color="border-white/[0.07]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          {/* Token connector */}
          <Card className="bg-[#0a0a0a] border-white/[0.07] shadow-xl shadow-black/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm text-white font-mono tracking-wider">
                <KeyRound className="w-4 h-4 text-white/40" />
                discord connection
              </CardTitle>
              <CardDescription className="text-white/25 text-xs font-mono">Provide a user token to execute actions on behalf of the account.</CardDescription>
            </CardHeader>
            <CardContent>
              {discordToken ? (
                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-lg border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    {validatedUser?.avatar ? (
                      <img src={validatedUser.avatar} alt="" className="w-9 h-9 rounded-full border border-white/20 object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-sm font-bold text-white/60">
                        {validatedUser?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{validatedUser?.username}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-mono text-emerald-400/80">token active</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/30 hover:text-white/60 font-mono text-xs h-8 px-3 hover:bg-white/5 transition-all"
                    onClick={() => { setDiscordToken(""); setValidatedUser(null); setTokenInputStr(""); }}
                  >
                    change
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    type="password"
                    placeholder="Enter Discord User Token"
                    value={tokenInputStr}
                    onChange={(e) => setTokenInputStr(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleValidateToken()}
                    className="font-mono text-sm bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/15 focus-visible:ring-white/20 focus-visible:border-white/20 h-10 transition-all"
                  />
                  <Button
                    onClick={handleValidateToken}
                    disabled={!tokenInputStr || validateTokenMutation.isPending}
                    className="h-10 px-5 bg-white text-black font-bold font-mono text-xs tracking-widest uppercase hover:bg-white/90 active:scale-[0.97] transition-all duration-150 shrink-0 shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-px"
                  >
                    {validateTokenMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : "validate"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message sequence */}
          <Card className={`bg-[#0a0a0a] border-white/[0.07] shadow-xl shadow-black/30 transition-all duration-300 ${!discordToken ? "opacity-40 pointer-events-none" : ""}`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm text-white font-mono tracking-wider">
                <Play className="w-4 h-4 text-white/40" />
                sequence configuration
              </CardTitle>
              <CardDescription className="text-white/25 text-xs font-mono">Configure your automated message payload and timing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField control={form.control} name="channelId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 font-mono text-xs tracking-wider uppercase">Channel ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123456789012345678" className="font-mono text-sm bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/15 focus-visible:ring-white/20 h-10 transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 font-mono text-xs tracking-wider uppercase">Message Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Type your message..." className="min-h-[100px] font-mono text-sm bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/15 focus-visible:ring-white/20 resize-none transition-all" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { name: "delaySeconds" as const, label: "Delay (sec)" },
                      { name: "intervalSeconds" as const, label: "Interval (sec)" },
                      { name: "repeatCount" as const, label: "Repeats (0=∞)" },
                    ].map(({ name, label }) => (
                      <FormField key={name} control={form.control} name={name} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/50 font-mono text-[10px] tracking-wider uppercase">{label}</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" className="font-mono text-sm bg-white/[0.03] border-white/[0.08] text-white focus-visible:ring-white/20 h-9 transition-all" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-bold font-mono tracking-widest uppercase text-xs bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-px"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />initializing...</>
                      : <><Play className="w-4 h-4 mr-2" />initialize sequence</>}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Active jobs */}
        <div className="lg:col-span-2">
          <Card className="bg-[#0a0a0a] border-white/[0.07] shadow-xl shadow-black/30 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm text-white font-mono tracking-wider">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white/40" />
                  active jobs
                </div>
                {jobs && jobs.length > 0 && (
                  <span className="text-[10px] text-white/25 font-mono">{jobs.length} running</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {jobsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="divide-y divide-white/[0.05]">
                  {jobs.map((job) => (
                    <div key={job.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {job.status === "running" && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                          )}
                          <Hash className="w-3 h-3 text-white/30" />
                          <span className="font-mono text-xs text-white/70">{job.channelId}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono px-2 h-5 border-0 ${
                            job.status === "running" ? "bg-emerald-500/10 text-emerald-400" :
                            job.status === "pending" ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-white/5 text-white/30"
                          }`}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="font-mono text-[11px] text-white/30 truncate mb-3">"{job.message}"</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-16 bg-white/[0.06] rounded-full overflow-hidden">
                            {job.repeatCount > 0 && (
                              <div
                                className="h-full bg-white/30 rounded-full transition-all"
                                style={{ width: `${Math.min((job.sentCount / job.repeatCount) * 100, 100)}%` }}
                              />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-white/30">
                            {job.sentCount}{job.repeatCount > 0 ? `/${job.repeatCount}` : ""}
                          </span>
                        </div>
                        {(job.status === "running" || job.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2.5 text-[10px] font-mono text-red-400/60 hover:text-red-400 hover:bg-red-900/10 transition-all"
                            onClick={() => handleStop(job.id)}
                            disabled={stopJobMutation.isPending}
                          >
                            <Square className="w-2.5 h-2.5 mr-1 fill-current" />stop
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mx-4 mb-4 text-center py-10 text-white/15 font-mono text-xs border border-dashed border-white/[0.06] rounded-lg">
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
