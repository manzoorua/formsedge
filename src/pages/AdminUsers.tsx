import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, User, FileText, MessageSquare, Trash2, Plus, AlertCircle, Shield, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserSummary {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_end: string | null;
  total_forms: number;
  total_responses: number;
}

interface SupportNote {
  id: string;
  note: string;
  priority: string;
  created_at: string;
  admin_email: string | null;
}

interface UserDetails extends UserSummary {
  support_notes: SupportNote[];
}

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notePriority, setNotePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator'>('admin');
  const [removeAdminId, setRemoveAdminId] = useState<string | null>(null);
  const { toast } = useToast();

  const searchUsers = async (query?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'search', searchQuery: query || searchQuery },
      });

      if (error) throw error;
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      setDetailsLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'get_user_details', userId },
      });

      if (error) throw error;
      setSelectedUser(data.user);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const addSupportNote = async () => {
    if (!selectedUser || !newNote.trim()) return;

    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'add_support_note',
          userId: selectedUser.id,
          noteData: { note: newNote, priority: notePriority },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Support note added successfully"
      });

      setNewNote('');
      setNotePriority('low');
      // Refresh user details
      fetchUserDetails(selectedUser.id);
    } catch (error) {
      console.error('Error adding support note:', error);
      toast({
        title: "Error",
        description: "Failed to add support note",
        variant: "destructive"
      });
    }
  };

  const deleteSupportNote = async (noteId: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'delete_support_note', noteId },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Support note deleted successfully"
      });

      // Refresh user details
      fetchUserDetails(selectedUser.id);
    } catch (error) {
      console.error('Error deleting support note:', error);
      toast({
        title: "Error",
        description: "Failed to delete support note",
        variant: "destructive"
      });
    }
  };

  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action: 'list_admins' },
      });

      if (error) throw error;
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive"
      });
    } finally {
      setAdminsLoading(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'promote_to_admin',
          targetUserId: selectedUser.id,
          role: selectedRole,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User promoted to ${selectedRole} successfully`
      });

      setPromoteDialogOpen(false);
      setIsDialogOpen(false);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive"
      });
    }
  };

  const removeAdmin = async (adminUserId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'remove_admin',
          adminUserId,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Admin access removed successfully"
      });

      setRemoveAdminId(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin access",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    searchUsers('');
    fetchAdmins();
  }, []);

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-500/10 text-gray-500',
      pro: 'bg-blue-500/10 text-blue-500',
      enterprise: 'bg-purple-500/10 text-purple-500',
    };
    return (
      <Badge variant="outline" className={colors[tier] || 'bg-gray-500/10 text-gray-500'}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500',
      canceled: 'bg-red-500/10 text-red-500',
      inactive: 'bg-gray-500/10 text-gray-500',
      past_due: 'bg-yellow-500/10 text-yellow-500',
    };
    return (
      <Badge variant="outline" className={colors[status] || 'bg-gray-500/10 text-gray-500'}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500/10 text-blue-500',
      medium: 'bg-yellow-500/10 text-yellow-500',
      high: 'bg-orange-500/10 text-orange-500',
      critical: 'bg-red-500/10 text-red-500',
    };
    return (
      <Badge variant="outline" className={colors[priority] || 'bg-gray-500/10 text-gray-500'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const isUserAdmin = (userId: string) => {
    return admins.some(admin => admin.user_id === userId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Search and manage user accounts</p>
        </div>
      </div>

      {/* Admin Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <CardDescription>Manage administrator access</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    {admin.first_name && admin.last_name
                      ? `${admin.first_name} ${admin.last_name}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                      {admin.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(admin.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRemoveAdminId(admin.user_id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {admins.length === 0 && !adminsLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No admin users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Search users by email or name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                className="pl-10"
              />
            </div>
            <Button onClick={() => searchUsers()} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Forms</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getTierBadge(user.subscription_tier)}</TableCell>
                  <TableCell>{getStatusBadge(user.subscription_status)}</TableCell>
                  <TableCell>{user.total_forms}</TableCell>
                  <TableCell>{user.total_responses}</TableCell>
                  <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchUserDetails(user.id)}
                      disabled={detailsLoading}
                    >
                      <User className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
              <p className="text-sm mt-2">Try searching with different keywords</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View user information and add support notes
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Account Information</span>
                    {!isUserAdmin(selectedUser.id) && (
                      <Button
                        size="sm"
                        onClick={() => setPromoteDialogOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Promote to Admin
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {selectedUser.first_name && selectedUser.last_name
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Tier</p>
                    {getTierBadge(selectedUser.subscription_tier)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedUser.subscription_status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Forms</p>
                    <p className="font-medium">{selectedUser.total_forms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Responses</p>
                    <p className="font-medium">{selectedUser.total_responses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {format(new Date(selectedUser.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {selectedUser.subscription_end && (
                    <div>
                      <p className="text-sm text-muted-foreground">Subscription End</p>
                      <p className="font-medium">
                        {format(new Date(selectedUser.subscription_end), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Support Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Support Notes</span>
                    <Badge variant="outline">{selectedUser.support_notes.length} notes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note Form */}
                  <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4" />
                      <p className="font-medium">Add New Note</p>
                    </div>
                    <Textarea
                      placeholder="Enter support note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center gap-2">
                      <Select value={notePriority} onValueChange={(val) => setNotePriority(val as any)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addSupportNote} disabled={!newNote.trim()}>
                        Add Note
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3">
                    {selectedUser.support_notes.map((note) => (
                      <div key={note.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(note.priority)}
                            <span className="text-sm text-muted-foreground">
                              by {note.admin_email} • {format(new Date(note.created_at), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSupportNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                      </div>
                    ))}
                    {selectedUser.support_notes.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No support notes yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote to Admin Dialog */}
      <AlertDialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote User to Administrator</AlertDialogTitle>
            <AlertDialogDescription>
              Select the admin role for {selectedUser?.email}. This action will grant administrative privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as 'admin' | 'moderator')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">Full system access</div>
                  </div>
                </SelectItem>
                <SelectItem value="moderator">
                  <div>
                    <div className="font-medium">Moderator</div>
                    <div className="text-xs text-muted-foreground">Limited admin access</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={promoteToAdmin}>Promote</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Admin Confirmation Dialog */}
      <AlertDialog open={!!removeAdminId} onOpenChange={(open) => !open && setRemoveAdminId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Remove Administrator Access
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove admin privileges from this user. They will lose access to all admin features immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => removeAdminId && removeAdmin(removeAdminId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
