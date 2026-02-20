import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useOrganization } from '@/hooks/useOrganization';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, User, Mail, Building2, Crown, UserPlus, Server, CreditCard, Trash2, AlertTriangle, Camera, Users, Lock } from 'lucide-react';
import { InviteTeamMemberDialog } from '@/components/team/InviteTeamMemberDialog';
import { useNavigate } from 'react-router-dom';
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  avatar_url?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
}

interface GlobalSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onProfileUpdate: (profile: Profile) => void;
}

export const GlobalSettingsDialog: React.FC<GlobalSettingsDialogProps> = ({
  open,
  onOpenChange,
  profile,
  onProfileUpdate,
}) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { limits } = useSubscription();
  const { currentOrg, memberCount, maxMembers, canInviteMore, refreshMemberCount } = useOrganization();
  const [activeTab, setActiveTab] = useState('settings');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canUseTeamFeatures = limits.canUseOrganizations;
  
  // Form states
  const [organizationName, setOrganizationName] = useState(profile?.company_name || '');
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  
  // SMTP Settings
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      
      if (!user?.id) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadAvatar(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          company_name: organizationName,
          first_name: firstName,
          last_name: lastName,
          email: email,
          avatar_url: avatarUrl,
        })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data as Profile);
      toast({
        title: "Settings Updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Implementation for account deletion would go here
    toast({
      title: "Account Deletion",
      description: "Account deletion functionality coming soon.",
    });
    setShowDeleteConfirm(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'pro': return 'default';
      case 'enterprise': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[98vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0 shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <DialogTitle className="text-2xl font-semibold">Settings</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 shrink-0">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="settings">Organization</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-4 pb-12">
              {/* Organization Settings Tab */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organization Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your organization details and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className="text-lg">
                            {getInitials(firstName, lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Profile Picture</Label>
                        <p className="text-sm text-muted-foreground">
                          Click the camera icon to upload a new profile picture
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          placeholder="Enter organization name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter first name"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveProfile} disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-6 mt-0">
                {!canUseTeamFeatures ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                          Invite team members to collaborate on forms. Upgrade to Pro for up to 3 members, or Enterprise for up to 10.
                        </p>
                        <Button onClick={() => { onOpenChange(false); navigate('/billing'); }}>
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade to Pro
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Team Members
                          {maxMembers > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {memberCount} / {maxMembers}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          className="flex items-center gap-2"
                          onClick={() => setInviteDialogOpen(true)}
                          disabled={!canInviteMore()}
                        >
                          <UserPlus className="h-4 w-4" />
                          Invite Team
                        </Button>
                      </CardTitle>
                      <CardDescription>
                        Manage who has access to your workspace and forms.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!canInviteMore() && (
                        <Alert className="mb-4">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            You've reached your plan's member limit. 
                            <Button 
                              variant="link" 
                              className="p-0 h-auto ml-1"
                              onClick={() => { onOpenChange(false); navigate('/billing'); }}
                            >
                              Upgrade your plan
                            </Button>
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-4">
                        {/* Current User (Owner) */}
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-gradient-primary text-white">
                                {getInitials(profile?.first_name || '', profile?.last_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {profile?.first_name} {profile?.last_name}
                                <span className="text-muted-foreground text-sm ml-2">(You)</span>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {profile?.email}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        </div>
                        
                        {/* Placeholder for team members */}
                        {teamMembers.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No team members yet</p>
                            <p className="text-sm">Invite colleagues to collaborate on your forms</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* SMTP Settings Tab */}
              <TabsContent value="smtp" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      SMTP Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure email delivery settings for your forms.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Enable SMTP</Label>
                        <p className="text-sm text-muted-foreground">
                          Use custom SMTP server for email delivery
                        </p>
                      </div>
                      <Switch
                        checked={smtpEnabled}
                        onCheckedChange={setSmtpEnabled}
                      />
                    </div>
                    
                    {smtpEnabled && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="smtp-host">SMTP Host</Label>
                            <Input
                              id="smtp-host"
                              value={smtpHost}
                              onChange={(e) => setSmtpHost(e.target.value)}
                              placeholder="smtp.gmail.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtp-port">Port</Label>
                            <Input
                              id="smtp-port"
                              value={smtpPort}
                              onChange={(e) => setSmtpPort(e.target.value)}
                              placeholder="587"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="smtp-username">Username</Label>
                            <Input
                              id="smtp-username"
                              value={smtpUsername}
                              onChange={(e) => setSmtpUsername(e.target.value)}
                              placeholder="your-email@gmail.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtp-password">Password</Label>
                            <Input
                              id="smtp-password"
                              type="password"
                              value={smtpPassword}
                              onChange={(e) => setSmtpPassword(e.target.value)}
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button>Save SMTP Settings</Button>
                          <Button variant="outline">Test Connection</Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>
                      Manage your subscription and billing details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <div className="font-medium capitalize">
                          {profile?.subscription_plan || 'Free'} Plan
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {profile?.subscription_plan === 'free' 
                            ? 'Limited features and forms' 
                            : 'Full access to all features'
                          }
                        </div>
                      </div>
                      <Badge variant={getPlanBadgeVariant(profile?.subscription_plan || 'free')}>
                        {profile?.subscription_plan === 'free' ? 'Current' : 'Active'}
                      </Badge>
                    </div>

                    {profile?.subscription_plan === 'free' && (
                      <div className="space-y-4">
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-2">Upgrade to PRO</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Unlock unlimited forms, advanced analytics, and premium features.
                          </p>
                          <div className="flex items-center gap-4">
                            <Button>
                              Buy PRO - $19/month
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              Start your free trial today
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {profile?.subscription_plan !== 'free' && (
                      <div className="space-y-4">
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-2">Manage Subscription</h3>
                          <div className="flex gap-2">
                            <Button variant="outline">
                              View Billing History
                            </Button>
                            <Button variant="outline">
                              Update Payment Method
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Permanently delete your account and all associated data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showDeleteConfirm ? (
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Account
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            This action cannot be undone. All your forms and data will be permanently deleted.
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                          >
                            Yes, Delete Account
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
      
      <InviteTeamMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        orgId={currentOrg?.org_id}
        memberCount={memberCount}
        maxMembers={maxMembers}
        onInviteSent={() => {
          refreshMemberCount();
        }}
      />
    </Dialog>
  );
};