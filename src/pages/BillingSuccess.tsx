import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BillingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Refresh subscription status after successful payment
      refreshSubscription();
    }
  }, [sessionId]);

  const refreshSubscription = async () => {
    try {
      await supabase.functions.invoke('check-subscription');
      toast.success("Subscription activated successfully!");
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Thank you for your purchase. You can now access all the features included in your plan.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/billing")} 
              variant="outline" 
              className="w-full"
            >
              View Billing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}