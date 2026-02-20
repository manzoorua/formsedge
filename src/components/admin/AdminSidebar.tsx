import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gift, FileText, MessageCircle, CreditCard, UserCog, Settings, LogOut, Mail, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Mail, label: 'Contact Submissions', path: '/admin/contact-submissions' },
  { icon: Building, label: 'Company Settings', path: '/admin/company-settings' },
  { icon: Gift, label: 'Referrals', path: '/admin/referrals' },
  { icon: FileText, label: 'Templates', path: '/admin/templates' },
  { icon: MessageCircle, label: 'Chatbot', path: '/admin/chatbot' },
  { icon: CreditCard, label: 'Billing', path: '/admin/billing' },
  { icon: UserCog, label: 'User Management', path: '/admin/user-management' },
  { icon: Settings, label: 'System Config', path: '/admin/system-config' },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { open } = useSidebar();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
    navigate('/auth');
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-[hsl(0,0%,20%)]"
      style={{
        '--sidebar-width': '12rem',
        '--sidebar-background': 'hsl(0, 0%, 20%)',
        '--sidebar-foreground': '0 0% 100%',
        '--sidebar-accent': '0 0% 100%',
        '--sidebar-accent-foreground': '0 0% 0%',
      } as React.CSSProperties}
    >
      <SidebarHeader className="border-b border-border/20">
        <div className="flex items-center gap-2 px-2 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-white">FormsEdge</span>
                <span className="text-xs text-white/70">Admin Panel</span>
              </div>
            )}
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.path === '/admin' 
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);
                
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 font-medium",
                          isActive 
                            ? "text-black [&>*]:text-black"
                            : "text-white [&>*]:text-white hover:text-black hover:[&>*]:text-black"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-semibold">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout" className="text-white hover:bg-white/10 hover:text-white">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
