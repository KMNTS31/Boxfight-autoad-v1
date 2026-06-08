import { useState } from "react";
import {
  useListAuthorizedUsers, getListAuthorizedUsersQueryKey,
  useAddAuthorizedUser, useRemoveAuthorizedUser,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Search, Plus, Trash2, User, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Admin() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [newId, setNewId] = useState("");

  const searchParams = search ? { search } : undefined;
  const { data: users, isLoading } = useListAuthorizedUsers(
    searchParams,
    { query: { queryKey: getListAuthorizedUsersQueryKey(searchParams) } }
  );

  const addMutation = useAddAuthorizedUser();
  const removeMutation = useRemoveAuthorizedUser();

  const handleAdd = () => {
    const id = newId.trim();
    if (!id) return;
    addMutation.mutate({ data: { discordId: id } }, {
      onSuccess: () => {
        toast({ title: "User authorized", description: `ID ${id} granted access.` });
        qc.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        setNewId("");
      },
      onError: () => toast({ variant: "destructive", title: "Error", description: "Failed — user may already be authorized." }),
    });
  };

  const handleRevoke = (discordId: string) => {
    if (!confirm("Revoke access for this user?")) return;
    removeMutation.mutate({ discordId }, {
      onSuccess: () => { toast({ title: "Access revoked" }); qc.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() }); },
      onError: () => toast({ variant: "destructive", title: "Error" }),
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-lg font-display font-black tracking-widest text-white uppercase">Authorize</h1>
        <p className="text-white/25 font-mono text-[10px] tracking-wide mt-0.5">manage access by discord id</p>
      </div>

      {/* Add user */}
      <Card className="bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="flex items-center gap-2 text-xs text-white/60 font-mono tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5" />
            add user
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex gap-2.5">
            <Input
              placeholder="Discord User ID  (e.g. 123456789012345678)"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="font-mono text-sm bg-white/[0.025] border-white/[0.07] text-white placeholder:text-white/15 focus-visible:ring-white/15 h-10 transition-all"
            />
            <Button
              onClick={handleAdd}
              disabled={!newId.trim() || addMutation.isPending}
              className="h-10 px-5 bg-white text-black font-bold font-mono text-[11px] tracking-widest uppercase hover:bg-white/90 active:scale-[0.96] transition-all duration-150 shrink-0 shadow-md shadow-white/8 hover:shadow-white/18 hover:-translate-y-px"
            >
              {addMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Plus className="w-3.5 h-3.5 mr-1.5" />Add</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User list */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 font-mono text-sm bg-[#0a0a0a] border-white/[0.06] text-white placeholder:text-white/15 focus-visible:ring-white/15 h-9 transition-all"
          />
        </div>

        <Card className="bg-[#0a0a0a] border-white/[0.06] shadow-xl shadow-black/40">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-4 h-4 animate-spin text-white/20" />
              </div>
            ) : !users?.length ? (
              <div className="m-4 text-center py-10 font-mono text-[10px] text-white/12 border border-dashed border-white/[0.05] rounded-xl">
                {search ? `no users matching "${search}"` : "no authorized users yet"}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.015] transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10 object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-white/25" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-bold text-white/75 truncate">{u.username}</p>
                        <p className="text-[9px] font-mono text-white/25 truncate">{u.discordId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="hidden sm:block text-[9px] font-mono text-white/20">
                        {formatDistanceToNow(new Date(u.authorizedAt), { addSuffix: true })}
                      </span>
                      <button
                        className="flex items-center gap-1 text-[10px] font-mono text-white/20 hover:text-red-400/70 active:scale-[0.9] transition-all px-2.5 py-1.5 rounded-lg hover:bg-red-900/10"
                        onClick={() => handleRevoke(u.discordId)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:block">Revoke</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
