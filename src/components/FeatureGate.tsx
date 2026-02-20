import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Star } from "lucide-react";

interface FeatureGateProps {
  children: ReactNode;
  requiredPlan: "pro" | "enterprise";
  featureName: string;
  description?: string;
  fallback?: ReactNode;
}

export function FeatureGate({ 
  children, 
  requiredPlan, 
  featureName, 
  description,
  fallback 
}: FeatureGateProps) {
  const { subscription } = useAuth();
  
  const currentTier = subscription?.subscription_tier || "free";
  const hasAccess = 
    (requiredPlan === "pro" && ["pro", "enterprise"].includes(currentTier)) ||
    (requiredPlan === "enterprise" && currentTier === "enterprise");

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          {requiredPlan === "enterprise" ? (
            <Star className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <CardTitle className="text-lg">{featureName}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          This feature requires a {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan or higher.
        </p>
        <Button 
          onClick={() => window.open('/billing', '_blank')}
          className="w-full"
        >
          Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
        </Button>
      </CardContent>
    </Card>
  );
}

export default FeatureGate;