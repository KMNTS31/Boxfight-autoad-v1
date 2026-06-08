import { useState } from "react";
import { useValidateToken, useListMyTokens, getListMyTokensQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Copy, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TokenSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [tokenInput, setTokenInput] = useState("");
  const [result, setResult] = useState<{
    valid: boolean; username?: string | null; avatar?: string | null; message: string;
  } | null>(null);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const validateMutation = useValidateToken();
  const { data: myTokens, isLoading } = useListMyTokens({ query: { queryKey: getListMyTokensQueryKey() } });

  const handleValidate = () => {
    if (!tokenInput.trim()) return;
    setResult(null);
    validateMutation.mutate({ data: { token: tokenInput.trim() } }, {
      onSuccess: (data) => {
        setResult(data);
        if (data.valid) {
          qc.invalidateQueries({ queryKey: getListMyTokensQueryKey() });
          toast({ title: "Token valid", description: `Verified as ${data.username}` });
        }
      },
      onError: () => setResult({ valid: false, message: "Server error." }),
    });
  };

  const copy = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-lg font-display font-black tracking-widest text-white uppercase">Token Settings</h1>
        <p className="text-white/25 font-mono text-[10px] tracking-wide mt-0.5">validate and manage your discord tokens</p>
      </div>

      {/* Validator */}
      <Card className="bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="flex items-center gap-2 text-xs text-white/60 font-mono tracking-widest">
            <KeyRound className="w-3.5 h-3.5" />
            check token
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <div className="flex gap-2.5">
            <Input
              type="password"
              placeholder="Paste Discord User Token..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
              className="font-mono text-sm bg-white/[0.025] border-white/[0.07] text-white placeholder:text-white/15 focus-visible:ring-white/15 focus-visible:border-white/20 h-10 transition-all"
            />
            <Button
              onClick={handleValidate}
              disabled={!tokenInput.trim() || validateMutation.isPending}
              className="h-10 px-5 bg-white text-black font-bold font-mono text-[11px] tracking-widest uppercase hover:bg-white/90 active:scale-[0.96] transition-all duration-150 shrink-0 shadow-md shadow-white/8 hover:shadow-white/18 hover:-translate-y-px"
            >
              {validateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "check"}
            </Button>
          </div>

          {result && (
            <div className={`flex items-center gap-4 p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-1 duration-200 ${
              result.valid ? "bg-emerald-950/25 border-emerald-500/15" : "bg-red-950/25 border-red-500/15"
            }`}>
              {result.valid ? (
                <>
                  {result.avatar ? (
                    <img src={result.avatar} alt="" className="w-10 h-10 rounded-full border border-white/15 object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white/85 text-sm font-mono">{result.username}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      <span className="text-[9px] font-mono text-emerald-400/70">valid · saved to history</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-red-900/30 border border-red-500/20 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5 text-red-400/70" />
                  </div>
                  <div>
                    <p className="font-bold text-red-300/80 text-sm font-mono">Invalid Token</p>
                    <p className="text-[9px] font-mono text-red-400/50 mt-0.5">{result.message}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="flex items-center justify-between text-xs text-white/60 font-mono tracking-widest">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              my token history
            </div>
            {myTokens?.length ? <span className="text-[9px] text-white/20 font-normal">{myTokens.length} stored</span> : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-4 h-4 animate-spin text-white/20" />
            </div>
          ) : !myTokens?.length ? (
            <div className="m-4 text-center py-10 font-mono text-[10px] text-white/12 border border-dashed border-white/[0.05] rounded-xl">
              no token history · validate a token above to get started
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {myTokens.map((t) => (
                <div key={t.id} className="px-5 py-4 hover:bg-white/[0.015] transition-colors">
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
                    <p className="text-[9px] font-mono text-white/20 shrink-0">
                      {t.lastValidated ? formatDistanceToNow(new Date(t.lastValidated), { addSuffix: true }) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-white/[0.025] border border-white/[0.05] rounded-lg px-3 py-2">
                      <code className="font-mono text-[10px] text-white/35 truncate block">
                        {revealed[t.id] ? t.token : "•".repeat(Math.min(t.token.length, 48))}
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
