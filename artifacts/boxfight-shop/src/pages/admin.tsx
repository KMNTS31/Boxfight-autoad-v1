import { useState } from "react";
import {
  useListAuthorizedUsers,
  getListAuthorizedUsersQueryKey,
  useAddAuthorizedUser,
  useRemoveAuthorizedUser,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Search, Plus, Trash2, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [newDiscordId, setNewDiscordId] = useState("");

  const searchParams = search ? { search } : undefined;
  const { data: users, isLoading } = useListAuthorizedUsers(
    searchParams,
    { query: { queryKey: getListAuthorizedUsersQueryKey(searchParams) } }
  );

  const addUserMutation = useAddAuthorizedUser();
  const removeUserMutation = useRemoveAuthorizedUser();

  const handleAdd = () => {
    const id = newDiscordId.trim();
    if (!id) return;
    addUserMutation.mutate({ data: { discordId: id } }, {
      onSuccess: () => {
        toast({ title: "User authorized", description: `Discord ID ${id} now has access.` });
        queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        setNewDiscordId("");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to add user. They may already be authorized." });
      }
    });
  };

  const handleRevoke = (discordId: string) => {
    if (confirm("Revoke access for this user?")) {
      removeUserMutation.mutate({ discordId }, {
        onSuccess: () => {
          toast({ title: "Access revoked" });
          queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to revoke access." });
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-white/40" />
        <div>
          <h1 className="text-lg font-display font-black tracking-widest text-white uppercase">Authorize</h1>
          <p className="text-white/30 font-mono text-xs tracking-wide">manage access by discord id</p>
        </div>
      </div>

      <Card className="bg-[#0a0a0a] border-white/[0.07]">
        <CardContent className="p-5">
          <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-3">Add User</p>
          <div className="flex gap-3">
            <Input
              placeholder="Discord User ID (e.g. 123456789012345678)"
              value={newDiscordId}
              onChange={(e) => setNewDiscordId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="font-mono text-sm bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/20 h-10"
            />
            <Button
              onClick={handleAdd}
              disabled={!newDiscordId.trim() || addUserMutation.isPending}
              className="h-10 px-5 bg-white text-black font-bold font-mono text-xs tracking-widest uppercase hover:bg-white/90 shrink-0"
            >
              {addUserMutation.isPending ? "..." : <><Plus className="w-4 h-4 mr-1.5" />Add</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <Input
            placeholder="Search users..."
            className="pl-9 font-mono text-sm bg-[#0a0a0a] border-white/[0.07] text-white placeholder:text-white/20 focus-visible:ring-white/20 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="bg-[#0a0a0a] border-white/[0.07]">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-white/20 font-mono text-xs">loading...</div>
            ) : !users?.length ? (
              <div className="text-center py-12 text-white/20 font-mono text-xs border border-dashed border-white/[0.07] rounded-lg m-4">
                no authorized users
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-white/10 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-white/30" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-white/80 font-bold truncate">{u.username}</p>
                        <p className="text-[11px] font-mono text-white/30 truncate">{u.discordId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-white/20">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(u.authorizedAt), "MMM d, yyyy")}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-3 text-white/20 hover:text-red-400 hover:bg-red-400/5 font-mono text-xs"
                        onClick={() => handleRevoke(u.discordId)}
                        disabled={removeUserMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3 mr-1.5" /> Revoke
                      </Button>
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
