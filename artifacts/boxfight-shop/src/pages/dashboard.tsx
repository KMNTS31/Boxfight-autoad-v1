import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGetMe,
  getGetMeQueryKey,
  useValidateToken,
  useSendMessage,
  useListMessageJobs,
  getListMessageJobsQueryKey,
  useStopMessageJob,
  useGetStats,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Play, Square, RefreshCcw, Activity, Users, Hash, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const messageSchema = z.object({
  message: z.string().min(1, "Message content is required"),
  channelId: z.string().min(1, "Channel ID is required"),
  delaySeconds: z.coerce.number().min(0, "Delay must be at least 0"),
  intervalSeconds: z.coerce.number().min(1, "Interval must be at least 1"),
  repeatCount: z.coerce.number().min(0, "Repeat count must be at least 0 (0 for infinite)"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  
  const [discordToken, setDiscordToken] = useState<string>("");
  const [tokenInputStr, setTokenInputStr] = useState<string>("");
  const [validatedUser, setValidatedUser] = useState<{username?: string | null, avatar?: string | null, discriminator?: string | null} | null>(null);

  const validateTokenMutation = useValidateToken();
  const sendMessageMutation = useSendMessage();
  const stopJobMutation = useStopMessageJob();

  const { data: jobs, isLoading: jobsLoading } = useListMessageJobs({
    query: { queryKey: getListMessageJobsQueryKey() }
  });

  const { data: stats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey(), enabled: !!user?.isAdmin }
  });

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
      channelId: "",
      delaySeconds: 0,
      intervalSeconds: 60,
      repeatCount: 1,
    },
  });

  const handleValidateToken = () => {
    if (!tokenInputStr) return;
    
    validateTokenMutation.mutate({ data: { token: tokenInputStr } }, {
      onSuccess: (data) => {
        if (data.valid) {
          setDiscordToken(tokenInputStr);
          setValidatedUser({
            username: data.username,
            avatar: data.avatar,
            discriminator: data.discriminator
          });
          toast({
            title: "Token Validated",
            description: `Connected as ${data.username}`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Validation Failed",
            description: data.message || "Invalid token provided.",
          });
        }
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to validate token.",
        });
      }
    });
  };

  const onSubmit = (data: MessageFormValues) => {
    if (!discordToken) return;

    sendMessageMutation.mutate({
      data: {
        token: discordToken,
        ...data,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Job Started",
          description: "Message sequence has been queued.",
        });
        queryClient.invalidateQueries({ queryKey: getListMessageJobsQueryKey() });
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to start job.",
        });
      }
    });
  };

  const handleStopJob = (jobId: string) => {
    stopJobMutation.mutate({ jobId }, {
      onSuccess: () => {
        toast({
          title: "Job Stopped",
          description: "The sequence has been terminated.",
        });
        queryClient.invalidateQueries({ queryKey: getListMessageJobsQueryKey() });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.error || "Failed to stop job.",
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Command Center</h1>
        <p className="text-muted-foreground mt-1">Configure and manage your automated sequences.</p>
      </div>

      {user?.isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-lg"><Users className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authorized Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalAuthorizedUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-secondary/10 text-secondary rounded-lg"><Activity className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeJobs}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-accent/50 text-foreground rounded-lg"><KeyRound className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalTokens}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-chart-3/10 text-chart-3 rounded-lg"><MessageSquare className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages Sent</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMessagesSent}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Discord Connection
              </CardTitle>
              <CardDescription>Provide a user token to execute actions on behalf of the account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {discordToken ? (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    {validatedUser?.avatar ? (
                      <img src={validatedUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-primary/50" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {validatedUser?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-foreground">{validatedUser?.username}</p>
                      <p className="text-xs text-muted-foreground font-mono">Token Active</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setDiscordToken("")}>
                    Change Token
                  </Button>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Input
                    type="password"
                    placeholder="Enter Discord User Token"
                    value={tokenInputStr}
                    onChange={(e) => setTokenInputStr(e.target.value)}
                    className="font-mono"
                  />
                  <Button 
                    onClick={handleValidateToken} 
                    disabled={!tokenInputStr || validateTokenMutation.isPending}
                    className="shrink-0"
                  >
                    {validateTokenMutation.isPending ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : null}
                    Validate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={!discordToken ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-secondary" />
                Sequence Configuration
              </CardTitle>
              <CardDescription>Setup your automated message payload and timing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="channelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 123456789012345678" className="font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Type your message here..." 
                            className="min-h-[120px] font-mono text-sm resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="delaySeconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Delay (sec)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="intervalSeconds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interval (sec)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="repeatCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Count</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormDescription className="text-[10px]">0 = Infinite</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-bold tracking-wide" 
                    size="lg"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Initialize Sequence
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-chart-3" />
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0 px-6 pb-6">
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCcw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm font-medium">{job.channelId}</span>
                        </div>
                        <Badge variant={job.status === "running" ? "default" : job.status === "pending" ? "secondary" : "outline"}
                          className={job.status === "running" ? "bg-secondary text-secondary-foreground" : ""}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        "{job.message}"
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="text-xs">
                          <span className="text-foreground font-bold">{job.sentCount}</span> sent
                          {job.repeatCount > 0 && <span className="text-muted-foreground"> / {job.repeatCount}</span>}
                        </div>
                        {(job.status === "running" || job.status === "pending") && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-7 text-xs px-2"
                            onClick={() => handleStopJob(job.id)}
                            disabled={stopJobMutation.isPending}
                          >
                            <Square className="w-3 h-3 mr-1 fill-current" /> Stop
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  No active sequences.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
