import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Mail, Loader2, AlertTriangle, Crown } from 'lucide-react';

type TeamRole = 'viewer' | 'editor' | 'admin';

interface InviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId?: string;
  orgId?: string;
  onInviteSent?: () => void;
  memberCount?: number;
  maxMembers?: number;
}

export const InviteTeamMemberDialog: React.FC<InviteTeamMemberDialogProps> = ({
  open,
  onOpenChange,
  formId,
  orgId,
  onInviteSent,
  memberCount = 0,
  maxMembers = 0,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const isAtLimit = maxMembers > 0 && memberCount >= maxMembers;

  const handleInvite = async () => {
    if (!email || !user?.id) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setErrorCode(null);

    try {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: { email, role, formId, orgId },
      });

      if (error) throw error;

      if (data?.error) {
        setErrorCode(data.code || null);
        throw new Error(data.error);
      }

      toast({
        title: 'Invitation sent',
        description: `An invitation has been sent to ${email}.`,
      });

      setEmail('');
      setRole('viewer');
      onOpenChange(false);
      onInviteSent?.();
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      
      if (err.message?.includes('SUBSCRIPTION_REQUIRED') || errorCode === 'SUBSCRIPTION_REQUIRED') {
        toast({
          title: 'Upgrade required',
          description: 'Organization features require a Pro or Enterprise subscription.',
          variant: 'destructive',
        });
      } else if (err.message?.includes('MEMBER_LIMIT_REACHED') || errorCode === 'MEMBER_LIMIT_REACHED') {
        toast({
          title: 'Member limit reached',
          description: 'Upgrade your plan to invite more team members.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Failed to send invitation',
          description: err.message || 'An error occurred while sending the invitation.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/billing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            {formId
              ? 'Invite someone to collaborate on this form.'
              : 'Invite someone to join your organization.'}
          </DialogDescription>
        </DialogHeader>

        {maxMembers > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
            <span>Team members</span>
            <span className={isAtLimit ? 'text-destructive font-medium' : ''}>
              {memberCount} / {maxMembers}
            </span>
          </div>
        )}

        {isAtLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2">
              <span>You've reached your plan's member limit.</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleUpgrade}
                className="w-fit"
              >
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isAtLimit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value as TeamRole)}
              disabled={isAtLimit}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div className="flex flex-col">
                    <span>Viewer</span>
                    <span className="text-xs text-muted-foreground">
                      Can view forms and responses
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex flex-col">
                    <span>Editor</span>
                    <span className="text-xs text-muted-foreground">
                      Can edit forms and manage responses
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex flex-col">
                    <span>Admin</span>
                    <span className="text-xs text-muted-foreground">
                      Full access including team management
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isLoading || !email || isAtLimit}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
