import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionLimits {
  maxForms: number;
  maxResponsesPerForm: number;
  maxOrgMembers: number;
  canUseAdvancedFeatures: boolean;
  canUseCustomBranding: boolean;
  canUseFileUploads: boolean;
  canUseIntegrations: boolean;
  canUseTeamCollaboration: boolean;
  canUseOrganizations: boolean;
  canUseWhiteLabel: boolean;
}

export function useSubscription(isAdmin: boolean = false) {
  const { subscription } = useAuth();
  
  const currentTier = isAdmin ? "admin" : (subscription?.subscription_tier || "free");
  
  const limits: SubscriptionLimits = {
    maxForms: isAdmin ? -1 : currentTier === "free" ? 3 : currentTier === "pro" ? 50 : -1,
    maxResponsesPerForm: isAdmin ? -1 : currentTier === "free" ? 100 : currentTier === "pro" ? 1000 : -1,
    maxOrgMembers: isAdmin ? -1 : currentTier === "free" ? 0 : currentTier === "pro" ? 3 : currentTier === "enterprise" ? 10 : 0,
    canUseAdvancedFeatures: isAdmin || ["pro", "enterprise"].includes(currentTier),
    canUseCustomBranding: isAdmin || ["pro", "enterprise"].includes(currentTier),
    canUseFileUploads: isAdmin || ["pro", "enterprise"].includes(currentTier),
    canUseIntegrations: isAdmin || ["pro", "enterprise"].includes(currentTier),
    canUseTeamCollaboration: isAdmin || ["pro", "enterprise"].includes(currentTier),
    canUseOrganizations: isAdmin || ["pro", "enterprise"].includes(currentTier),
    canUseWhiteLabel: isAdmin || currentTier === "enterprise",
  };

  const hasFeature = (feature: keyof SubscriptionLimits): boolean => {
    return limits[feature] as boolean;
  };

  const isWithinLimit = (currentCount: number, limitType: "forms" | "responses"): boolean => {
    const limit = limitType === "forms" ? limits.maxForms : limits.maxResponsesPerForm;
    return limit === -1 || currentCount < limit;
  };

  const canAddOrgMember = (currentMemberCount: number): boolean => {
    if (!limits.canUseOrganizations) return false;
    if (limits.maxOrgMembers === -1) return true;
    return currentMemberCount < limits.maxOrgMembers;
  };

  const getUpgradeMessage = (feature: string): string => {
    if (currentTier === "free") {
      return `Upgrade to Pro to unlock ${feature}`;
    }
    return `Upgrade to Enterprise to unlock ${feature}`;
  };

  const getOrgMemberLimitMessage = (currentCount: number): string => {
    if (!limits.canUseOrganizations) {
      return "Upgrade to Pro to invite team members";
    }
    if (limits.maxOrgMembers !== -1 && currentCount >= limits.maxOrgMembers) {
      if (currentTier === "pro") {
        return "Pro plan limit reached (3 members). Upgrade to Enterprise for up to 10 members.";
      }
      return "Organization member limit reached.";
    }
    return "";
  };

  return {
    subscription,
    currentTier,
    limits,
    hasFeature,
    isWithinLimit,
    canAddOrgMember,
    getUpgradeMessage,
    getOrgMemberLimitMessage,
    isSubscribed: subscription?.subscribed || false,
  };
}
