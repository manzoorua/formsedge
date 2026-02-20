import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReferralPopup } from './ReferralPopup';
import { RewardsPopup } from './RewardsPopup';
import { Sparkles } from 'lucide-react';

interface AnimatedProfileButtonProps {
  firstName: string;
  avatarUrl?: string;
}

export function AnimatedProfileButton({ firstName, avatarUrl }: AnimatedProfileButtonProps) {
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [showRewardsPopup, setShowRewardsPopup] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleShowRewards = () => {
    setShowReferralPopup(false);
    setShowRewardsPopup(true);
  };

  const handleBackToReferral = () => {
    setShowRewardsPopup(false);
    setShowReferralPopup(true);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {avatarUrl && (
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={firstName} />
            <AvatarFallback>{getInitials(firstName)}</AvatarFallback>
          </Avatar>
        )}
        
        <Button
          variant="ghost"
          onClick={() => setShowReferralPopup(true)}
          className="group relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse" />
            {firstName}
          </span>
          
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
        </Button>
      </div>

      <ReferralPopup
        open={showReferralPopup}
        onOpenChange={setShowReferralPopup}
        onShowRewards={handleShowRewards}
      />

      <RewardsPopup
        open={showRewardsPopup}
        onOpenChange={setShowRewardsPopup}
        onBack={handleBackToReferral}
      />
    </>
  );
}