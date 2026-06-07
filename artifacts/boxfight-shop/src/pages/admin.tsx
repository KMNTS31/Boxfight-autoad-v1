import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useListAuthorizedUsers,
  getListAuthorizedUsersQueryKey,
  useAddAuthorizedUser,
  useRemoveAuthorizedUser,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Search, Plus, Trash2, Shield, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

const addUserSchema = z.object({
  discordId: z.string().min(1, "Discord ID is required"),
  username: z.string().min(1, "Username is required"),
  avatar: z.string().optional(),
  notes: z.string().optional(),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: users, isLoading } = useListAuthorizedUsers(
    { query: { params: { search: search || undefined } } },
    { query: { queryKey: getListAuthorizedUsersQueryKey({ query: { params: { search: search || undefined } } }) } }
  );

  const addUserMutation = useAddAuthorizedUser();
  const removeUserMutation = useRemoveAuthorizedUser();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      discordId: "",
      username: "",
      avatar: "",
      notes: "",
    },
  });

  const onSubmit = (data: AddUserFormValues) => {
    addUserMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "User Added", description: "Successfully authorized user." });
        queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        setIsAddModalOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "Error", description: error.error || "Failed to add user." });
      }
    });
  };

  const handleRevoke = (discordId: string) => {
    if (confirm("Are you sure you want to revoke access for this user?")) {
      removeUserMutation.mutate({ discordId }, {
        onSuccess: () => {
          toast({ title: "Access Revoked", description: "User has been removed from authorization list." });
          queryClient.invalidateQueries({ queryKey: getListAuthorizedUsersQueryKey() });
        },
        onError: (error) => {
          toast({ variant: "destructive", title: "Error", description: error.error || "Failed to revoke access." });
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-destructive" />
            User Authorization
          </h1>
          <p className="text-muted-foreground mt-1">Manage who has access to the command center.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-border bg-card">
            <DialogHeader>
              <DialogTitle>Authorize New User</DialogTitle>
              <DialogDescription>
                Grant a user access to the dashboard using their Discord ID.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="discordId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 123456789012345678" className="font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Discord username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Reason for access..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending ? "Adding..." : "Authorize User"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Discord ID</TableHead>
                  <TableHead>Authorized By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No authorized users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium text-foreground">{u.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{u.discordId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="w-3 h-3" /> {u.authorizedBy}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" /> {format(new Date(u.authorizedAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {u.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRevoke(u.discordId)}
                          disabled={removeUserMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Revoke
                        </Button>
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
