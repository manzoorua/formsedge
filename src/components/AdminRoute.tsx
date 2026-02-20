import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import AdminBootstrap from '@/components/admin/AdminBootstrap';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    const checkAdminStatus = async () => {
      if (!user) {
        if (!isCancelled) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
        return;
      }

      // Prevent redundant calls - cache admin status briefly
      const cacheKey = `admin_status_${user.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
      
      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 30000) {
        if (!isCancelled) {
          setIsAdmin(cached === 'true');
          setCheckingAdmin(false);
        }
        return;
      }

      try {
        console.log('Checking admin status for user:', user.id);
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (isCancelled) return;
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          // Check if this is because no admins exist yet
          const { count: adminCount } = await supabase
            .from('admin_users')
            .select('id', { count: 'exact', head: true });
          if (!isCancelled && (adminCount || 0) === 0) {
            setNeedsBootstrap(true);
          }
        } else {
          const adminStatus = data || false;
          setIsAdmin(adminStatus);
          
          // Cache the result
          sessionStorage.setItem(cacheKey, adminStatus.toString());
          sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
          
          if (!adminStatus) {
            // Double-check if bootstrap is needed
            const { count: adminCount } = await supabase
              .from('admin_users')
              .select('id', { count: 'exact', head: true });
            if (!isCancelled && (adminCount || 0) === 0) {
              setNeedsBootstrap(true);
            }
          }
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } finally {
        if (!isCancelled) {
          setCheckingAdmin(false);
        }
      }
    };

    if (!loading && user) {
      checkAdminStatus();
    } else if (!loading && !user) {
      setIsAdmin(false);
      setCheckingAdmin(false);
    }
    
    return () => {
      isCancelled = true;
    };
  }, [user?.id, loading]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (needsBootstrap) {
    return (
      <AdminBootstrap 
        onSuccess={() => {
          setIsAdmin(true);
          setNeedsBootstrap(false);
        }} 
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;