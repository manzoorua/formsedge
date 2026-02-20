import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trophy, DollarSign, Clock, CheckCircle, ArrowLeft, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useReferralSettings } from '@/hooks/useReferralSettings';

interface Referral {
  id: string;
  created_at: string;
  reward_earned: number;
  status: string;
  referral_rewards: Array<{
    amount: number;
    status: string;
    created_at: string;
    paid_at: string | null;
  }>;
}

interface RewardsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
}

export function RewardsPopup({ open, onOpenChange, onBack }: RewardsPopupProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const { settings } = useReferralSettings();

  useEffect(() => {
    if (open) {
      fetchRewards();
    }
  }, [open]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          id,
          created_at,
          reward_earned,
          status,
          referral_rewards (
            amount,
            status,
            created_at,
            paid_at
          )
        `)
        .eq('referrer_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReferrals(referrals || []);
      
      const total = referrals?.reduce((sum, ref) => sum + (ref.reward_earned || 0), 0) || 0;
      const pending = referrals?.reduce((sum, ref) => 
        sum + (ref.referral_rewards?.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0) || 0), 0
      ) || 0;
      
      setTotalEarnings(total);
      setPendingAmount(pending);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-0 h-6 w-6"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Trophy className="h-5 w-5 text-primary" />
            Your Rewards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Pending Rewards</div>
              </CardContent>
            </Card>
          </div>

          {/* Rewards List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Reward History</h3>
            
            {referrals.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">No rewards yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start referring friends to earn rewards!
                  </p>
                </CardContent>
              </Card>
            ) : (
              referrals.map((referral) => (
                <Card key={referral.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {format(new Date(referral.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        +${referral.reward_earned.toFixed(2)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {referral.referral_rewards.map((reward, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-t">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(reward.status)}
                            <span className="text-sm">Referral Bonus</span>
                          </div>
                          <div className="text-sm font-medium">
                            ${reward.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Payout Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Payment Information</h4>
                  <p className="text-xs text-muted-foreground">
                    Rewards are processed {settings?.payment_processing_frequency?.value?.toLowerCase() || 'monthly'}. Pending rewards will be paid out 
                    to your registered payment method within {settings?.payment_schedule_days?.value || '5-7 business days'}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}