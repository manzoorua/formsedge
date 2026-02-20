import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, UserPlus, LogIn } from 'lucide-react';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  form_id?: string;
  org_id?: string;
  expires_at: string;
  inviter_name?: string;
  form_title?: string;
  org_name?: string;
}

const AcceptInvitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('team_invitations')
          .select('*')
          .eq('token', token)
          .is('accepted_at', null)
          .single();

        if (fetchError || !data) {
          setError('This invitation is invalid or has already been used.');
          setLoading(false);
          return;
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          setError('This invitation has expired.');
          setLoading(false);
          return;
        }

        setInvitation(data as InvitationDetails);
      } catch (err) {
        setError('Failed to load invitation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!invitation || !user?.id || !token) return;

    // Check if email matches
    if (user.email !== invitation.email) {
      toast({
        title: 'Email mismatch',
        description: `This invitation was sent to ${invitation.email}. Please sign in with that email address.`,
        variant: 'destructive',
      });
      return;
    }

    setAccepting(true);

    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: { token },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSuccess(true);
      toast({
        title: 'Invitation accepted!',
        description: 'You now have access to the shared resource.',
      });

      // Redirect after short delay
      setTimeout(() => {
        if (invitation.form_id) {
          navigate(`/forms/${invitation.form_id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      toast({
        title: 'Failed to accept invitation',
        description: err.message || 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setAccepting(false);
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <CardTitle>Invitation Accepted!</CardTitle>
            <CardDescription>
              Redirecting you to your new access...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Team Invitation</CardTitle>
            <CardDescription>
              You've been invited to collaborate. Please sign in to accept.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Invited as:</span> {invitation?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Role:</span>{' '}
                <span className="capitalize">{invitation?.role}</span>
              </p>
            </div>
            <Button className="w-full" asChild>
              <Link to={`/auth?redirect=/accept-invite/${token}`}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Accept
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in - show accept button
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Accept Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to collaborate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <span className="font-medium">Invited email:</span> {invitation?.email}
            </p>
            <p className="text-sm">
              <span className="font-medium">Role:</span>{' '}
              <span className="capitalize">{invitation?.role}</span>
            </p>
            {invitation?.form_title && (
              <p className="text-sm">
                <span className="font-medium">Form:</span> {invitation.form_title}
              </p>
            )}
            {invitation?.org_name && (
              <p className="text-sm">
                <span className="font-medium">Organization:</span> {invitation.org_name}
              </p>
            )}
          </div>

          {user.email !== invitation?.email && (
            <div className="bg-warning/10 border border-warning rounded-lg p-4">
              <p className="text-sm text-warning-foreground">
                You're signed in as <strong>{user.email}</strong>, but this invitation was sent to{' '}
                <strong>{invitation?.email}</strong>. Please sign in with the correct email.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/dashboard">Decline</Link>
            </Button>
            <Button
              className="flex-1"
              onClick={handleAcceptInvitation}
              disabled={accepting || user.email !== invitation?.email}
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
