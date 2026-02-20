import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EnhancedReferralSettingsManager from '@/components/admin/EnhancedReferralSettingsManager';

interface ReferralCode {
  id: string;
  code: string;
  user_id: string;
  current_uses: number;
  max_uses: number | null;
  is_active: boolean;
  created_at: string;
  profiles?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

interface ReferralEntry {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: string;
  reward_earned: number;
  created_at: string;
  referrer_profile?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  referred_profile?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

interface ReferralReward {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  profiles?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

export default function AdminReferrals() {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReferralCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('id, code, user_id, current_uses, max_uses, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const referralCodesWithProfiles = await Promise.all(
        (data || []).map(async (code) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', code.user_id)
            .single();

          return {
            ...code,
            profiles: profile || undefined
          };
        })
      );

      setReferralCodes(referralCodesWithProfiles);
    } catch (error) {
      console.error('Error fetching referral codes:', error);
    }
  };

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referrer_id, referred_id, status, reward_earned, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const referralsWithProfiles = await Promise.all(
        (data || []).map(async (referral) => {
          const [referrerProfile, referredProfile] = await Promise.all([
            supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', referral.referrer_id)
              .single(),
            supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', referral.referred_id)
              .single()
          ]);

          return {
            ...referral,
            referrer_profile: referrerProfile.data || undefined,
            referred_profile: referredProfile.data || undefined
          };
        })
      );

      setReferrals(referralsWithProfiles);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchReferralRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('id, user_id, amount, status, created_at, paid_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rewardsWithProfiles = await Promise.all(
        (data || []).map(async (reward) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', reward.user_id)
            .single();

          return {
            ...reward,
            profiles: profile || undefined
          };
        })
      );

      setReferralRewards(rewardsWithProfiles);
    } catch (error) {
      console.error('Error fetching referral rewards:', error);
    }
  };

  const toggleReferralCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('referral_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Referral code ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchReferralCodes();
    } catch (error) {
      console.error('Error toggling referral code status:', error);
      toast({
        title: "Error",
        description: "Failed to update referral code status",
        variant: "destructive"
      });
    }
  };

  const markRewardAsPaid = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from('referral_rewards')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', rewardId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reward marked as paid successfully"
      });

      fetchReferralRewards();
    } catch (error) {
      console.error('Error marking reward as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark reward as paid",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchReferralCodes(), 
        fetchReferrals(), 
        fetchReferralRewards()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral System</h1>
        <p className="text-muted-foreground">Manage referral codes, tracking, and rewards</p>
      </div>

      <EnhancedReferralSettingsManager />

      <Accordion type="multiple" className="space-y-4">
        {/* Referral Codes */}
        <AccordionItem value="codes">
          <AccordionTrigger>
            <CardTitle>Referral Codes ({referralCodes.length})</CardTitle>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono">{code.code}</TableCell>
                        <TableCell>{code.profiles?.email || 'Unknown'}</TableCell>
                        <TableCell>
                          {code.current_uses} / {code.max_uses || '∞'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={code.is_active ? 'default' : 'secondary'}>
                            {code.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(code.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleReferralCodeStatus(code.id, code.is_active)}
                          >
                            {code.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Referrals */}
        <AccordionItem value="referrals">
          <AccordionTrigger>
            <CardTitle>Referrals ({referrals.length})</CardTitle>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Referred</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>{referral.referrer_profile?.email || 'Unknown'}</TableCell>
                        <TableCell>{referral.referred_profile?.email || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${referral.reward_earned}</TableCell>
                        <TableCell>{new Date(referral.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Rewards */}
        <AccordionItem value="rewards">
          <AccordionTrigger>
            <CardTitle>Rewards ({referralRewards.length})</CardTitle>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralRewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell>{reward.profiles?.email || 'Unknown'}</TableCell>
                        <TableCell>${reward.amount}</TableCell>
                        <TableCell>
                          <Badge variant={reward.status === 'paid' ? 'default' : 'secondary'}>
                            {reward.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(reward.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {reward.paid_at ? new Date(reward.paid_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {reward.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markRewardAsPaid(reward.id)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
