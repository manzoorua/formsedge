import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Copy, Gift, Check, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useReferralSettings } from '@/hooks/useReferralSettings';

interface ReferralData {
  code: string;
  url: string;
}

interface ReferralPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowRewards: () => void;
}

export function ReferralPopup({ open, onOpenChange, onShowRewards }: ReferralPopupProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { settings } = useReferralSettings();

  useEffect(() => {
    if (open) {
      fetchReferralData();
    }
  }, [open]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Try edge function first
      const { data, error } = await supabase.functions.invoke('generate-referral-code');
      
      if (error) {
        console.error('Edge function error:', error);
        // Fallback: try to get existing referral code directly from database
        await fetchExistingReferralCode();
        return;
      }
      
      setReferralData(data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Fallback: try to get existing referral code directly from database
      await fetchExistingReferralCode();
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: codes, error } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (codes && codes.length > 0) {
        const code = codes[0].code;
        setReferralData({
          code,
          url: `${window.location.origin}/auth?ref=${code}`
        });
        toast({
          title: "Referral Code Found",
          description: "Loaded your existing referral code.",
        });
      } else {
        toast({
          title: "No Referral Code",
          description: "You don't have an active referral code yet. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fallback error:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share && referralData) {
      try {
        await navigator.share({
          title: 'Join me on FormCraft',
          text: 'Get 50% off your first subscription!',
          url: referralData.url,
        });
      } catch (error) {
        copyToClipboard(referralData.url);
      }
    } else if (referralData) {
      copyToClipboard(referralData.url);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Invite Friends & Earn Rewards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* How it works */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">How it works:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge variant="default" className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm bg-primary text-primary-foreground">1</Badge>
                <span className="text-sm">Share your unique referral link</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge variant="default" className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm bg-primary text-primary-foreground">2</Badge>
                <span className="text-sm">Friends get <strong>{settings?.friend_discount_percentage?.value || 50}% off</strong> their first subscription</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge variant="default" className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm bg-primary text-primary-foreground">3</Badge>
                <span className="text-sm">You earn up to <strong>${settings?.maximum_earning_per_referral?.value || 500}</strong> per referral</span>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your referral link:</h3>
            <div className="relative">
              <div className="flex gap-2 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex-1 text-sm font-mono text-foreground break-all pr-2">
                  {referralData?.url}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(referralData?.url || '')}
                  className="shrink-0 bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={shareLink} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </Button>
            <Button variant="outline" onClick={onShowRewards} className="flex-1 h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Trophy className="h-4 w-4 mr-2" />
              View Rewards
            </Button>
          </div>

          {/* Referral Code */}
          <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground mb-2">Referral Code</div>
            <div className="text-3xl font-bold tracking-wider text-primary font-mono">
              {referralData?.code}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}