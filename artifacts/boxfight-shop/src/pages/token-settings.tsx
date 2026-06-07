import { useState } from "react";
import { useValidateToken, useListMyTokens, getListMyTokensQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Copy, RefreshCcw, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function TokenSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tokenInput, setTokenInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    username?: string | null;
    avatar?: string | null;
    message: string;
  } | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  const validateMutation = useValidateToken();
  const { data: myTokens, isLoading: tokensLoading } = useListMyTokens({
    query: { queryKey: getListMyTokensQueryKey() }
  });

  const handleValidate = () => {
    if (!tokenInput.trim()) return;
    setValidationResult(null);
    validateMutation.mutate({ data: { token: tokenInput.trim() } }, {
      onSuccess: (data) => {
        setValidationResult(data);
        if (data.valid) {
          queryClient.invalidateQueries({ queryKey: getListMyTokensQueryKey() });
          toast({ title: "Token valid", description: `Verified as ${data.username}` });
        }
      },
      onError: () => {
        setValidationResult({ valid: false, message: "Server error — could not validate." });
      }
    });
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied", description: "Token copied to clipboard." });
  };

  const toggleReveal = (id: number) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div>
        <h1 className="text-xl font-display font-black tracking-widest text-white uppercase">Token Settings</h1>
        <p className="text-white/30 font-mono text-xs tracking-wide mt-0.5">validate and manage your discord tokens</p>
      </div>

      {/* Validator */}
      <Card className="bg-[#0a0a0a] border-white/[0.07] shadow-xl shadow-black/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm text-white font-mono tracking-wider">
            <KeyRound className="w-4 h-4 text-white/40" />
            check token
          </CardTitle>
          <CardDescription className="text-white/25 text-xs font-mono">
            Paste any Discord user token to validate it. Valid tokens are automatically saved to your history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              type="password"
              placeholder="Paste Discord User Token..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
              className="font-mono text-sm bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/15 focus-visible:ring-white/20 focus-visible:border-white/20 h-10 transition-all"
            />
            <Button
              onClick={handleValidate}
              disabled={!tokenInput.trim() || validateMutation.isPending}
              className="h-10 px-5 bg-white text-black font-bold font-mono text-xs tracking-widest uppercase hover:bg-white/90 active:scale-[0.97] transition-all duration-150 shrink-0 shadow-lg shadow-white/10 hover:shadow-white/20 hover:-translate-y-px"
            >
              {validateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "check"}
            </Button>
          </div>

          {/* Validation result */}
          {validationResult && (
            <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all animate-in fade-in slide-in-from-bottom-1 duration-300 ${
              validationResult.valid
                ? "bg-emerald-950/20 border-emerald-500/20"
                : "bg-red-950/20 border-red-500/20"
            }`}>
              {validationResult.valid ? (
                <>
                  {validationResult.avatar ? (
                    <img src={validationResult.avatar} alt="" className="w-10 h-10 rounded-full border border-white/20 object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white text-sm">{validationResult.username}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-mono text-emerald-400/80">token is valid · saved to history</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-500/20 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-red-300 text-sm">Invalid Token</p>
                    <p className="text-[10px] font-mono text-red-400/60 mt-0.5">{validationResult.message}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token History */}
      <Card className="bg-[#0a0a0a] border-white/[0.07] shadow-xl shadow-black/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-sm text-white font-mono tracking-wider">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              my token history
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-white/20 hover:text-white/50 font-mono text-[10px] tracking-wider hover:bg-white/5 transition-all"
              onClick={() => queryClient.invalidateQueries({ queryKey: getListMyTokensQueryKey() })}
            >
              <RefreshCcw className="w-3 h-3 mr-1.5" />refresh
            </Button>
          </CardTitle>
          <CardDescription className="text-white/25 text-xs font-mono">
            Tokens you've previously validated. Only visible to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {tokensLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-white/20" />
            </div>
          ) : !myTokens?.length ? (
            <div className="mx-4 mb-4 text-center py-10 text-white/15 font-mono text-xs border border-dashed border-white/[0.06] rounded-lg">
              no token history yet · validate a token above to get started
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {myTokens.map((t) => (
                <div key={t.id} className="px-5 py-4 hover:bg-white/[0.015] transition-colors">
                  <div className="flex items-start justify-between gap-4">
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
                        <p className="text-[10px] font-mono text-white/25 mt-0.5">{t.discordUserId}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-mono text-white/25">
                        {t.lastValidated
                          ? formatDistanceToNow(new Date(t.lastValidated), { addSuffix: true })
                          : format(new Date(t.addedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/[0.06] rounded-md px-3 py-2">
                      <code className="font-mono text-[11px] text-white/40 truncate block">
                        {revealedIds[t.id]
                          ? t.token
                          : "•".repeat(Math.min(t.token.length, 48))}
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white/20 hover:text-white/50 hover:bg-white/5 transition-all shrink-0"
                      onClick={() => toggleReveal(t.id)}
                    >
                      {revealedIds[t.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
