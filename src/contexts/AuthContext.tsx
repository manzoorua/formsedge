import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string;
  subscription_status: string;
  subscription_end: string;
  cancel_at_period_end: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionInfo | null;
  checkSubscription: () => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; success?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener with proper error handling
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        
        // Handle token refresh errors by clearing invalid sessions
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing auth state');
          localStorage.removeItem('supabase.auth.token');
          setSession(null);
          setUser(null);
          setSubscription(null);
          setLoading(false);
          return;
        }
        
        // Handle sign out or invalid sessions
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setSubscription(null);
          setLoading(false);
          return;
        }
        
        // Validate session before setting state
        if (session && session.expires_at && session.expires_at > Date.now() / 1000) {
          setSession(session);
          setUser(session.user);
          setLoading(false);
        } else if (session && session.expires_at && session.expires_at <= Date.now() / 1000) {
          console.log('Session expired, clearing auth state');
          localStorage.removeItem('supabase.auth.token');
          setSession(null);
          setUser(null);
          setSubscription(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session with validation
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          localStorage.removeItem('supabase.auth.token');
          setSession(null);
          setUser(null);
          setSubscription(null);
          setLoading(false);
          return;
        }
        
        console.log('Initial session:', session?.user?.id);
        
        // Validate session expiry
        if (session && session.expires_at && session.expires_at > Date.now() / 1000) {
          setSession(session);
          setUser(session.user);
        } else {
          console.log('Initial session invalid or expired');
          setSession(null);
          setUser(null);
          setSubscription(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          localStorage.removeItem('supabase.auth.token');
          setSession(null);
          setUser(null);
          setSubscription(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
    };
  }, []);

  // Separate effect for subscription checking with better error handling
  useEffect(() => {
    if (!user || loading || !session) return;
    
    let isStale = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchSubscription = async () => {
      try {
        // Validate session before making subscription call
        if (session.expires_at && session.expires_at <= Date.now() / 1000) {
          console.log('Session expired, skipping subscription check');
          return;
        }
        
        console.log('Checking subscription for user:', user.id);
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (!isStale && !error && data) {
          setSubscription(data);
          retryCount = 0; // Reset retry count on success
        } else if (!isStale && error) {
          console.error("Error checking subscription:", error);
          
          // Retry with exponential backoff for transient errors
          if (retryCount < maxRetries && !error.message?.includes('401') && !error.message?.includes('403')) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            setTimeout(() => {
              if (!isStale) fetchSubscription();
            }, delay);
          }
        }
      } catch (error) {
        if (!isStale) {
          console.error("Error checking subscription:", error);
        }
      }
    };
    
    // Debounce subscription check with increased delay
    const timeoutId = setTimeout(fetchSubscription, 1000);
    
    return () => {
      isStale = true;
      clearTimeout(timeoutId);
    };
  }, [user?.id, session?.expires_at, loading]);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      let errorMessage = error.message;
      let errorTitle = "Sign up failed";
      
      // Handle specific error cases with better messaging
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        errorTitle = "Too many requests";
        errorMessage = "Please wait a moment before trying again. If you already signed up, check your email or try signing in.";
      } else if (error.message.includes("already registered")) {
        errorTitle = "Account exists";
        errorMessage = "This email is already registered. Try signing in instead.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      return { error };
    } else {
      toast({
        title: "Check your email!",
        description: "We've sent you a verification link to complete your account setup.",
        duration: 6000,
      });
      return { error: null, success: true };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link.",
      });
    }

    return { error };
  };

  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      }
    });

    if (error) {
      let errorMessage = error.message;
      if (error.message.includes("429") || error.message.includes("rate limit")) {
        errorMessage = "Please wait before requesting another verification email.";
      }
      
      toast({
        title: "Resend failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Verification email sent",
        description: "Check your email for the verification link.",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    checkSubscription,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};