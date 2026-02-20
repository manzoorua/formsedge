import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, UserCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdminBootstrapProps {
  onSuccess: () => void;
}

const AdminBootstrap: React.FC<AdminBootstrapProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const setupFirstAdmin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('setup_first_admin');
      
      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "Admin Setup Complete",
          description: "You have been successfully set up as the first administrator.",
        });
        onSuccess();
      } else {
        setError("Admin users already exist. Please contact an existing administrator.");
      }
    } catch (err) {
      console.error('Error setting up first admin:', err);
      setError(err instanceof Error ? err.message : 'Failed to setup administrator');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Admin Setup Required</CardTitle>
          <CardDescription>
            Set up your administrator account to access admin features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will grant you full administrative privileges including:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>Referral system configuration</li>
                <li>User management</li>
                <li>System administration</li>
              </ul>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={setupFirstAdmin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              "Setting up..."
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Become Administrator
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Only the first user can use this setup. Contact an existing admin if this fails.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBootstrap;