import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Gift, ChevronDown, Zap, BarChart3 } from "lucide-react";
import { useState } from "react";
import { ReferralPopup } from "@/components/ReferralPopup";
import { RewardsPopup } from "@/components/RewardsPopup";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user } = useAuth();
  const [referralOpen, setReferralOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);

  const showRewards = () => {
    setReferralOpen(false);
    setRewardsOpen(true);
  };

  const showReferral = () => {
    setRewardsOpen(false);
    setReferralOpen(true);
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-xl text-foreground">FormsEdge</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
              <span>Features</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background z-50">
              <DropdownMenuItem asChild>
                <Link to="/features" className="w-full cursor-pointer">
                  <Zap className="mr-2 h-4 w-4" />
                  All Features
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/comparison" className="w-full cursor-pointer flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                  <span className="flex-1">Compare with Typeform</span>
                  <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary text-xs">New</Badge>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">
            Integrations
          </Link>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
            Templates
          </Link>
          <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
            Tutorial
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
              <span>Company</span>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background z-50">
              <DropdownMenuItem asChild>
                <Link to="/about" className="w-full cursor-pointer">
                  About Us
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/contact" className="w-full cursor-pointer">
                  Contact
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {user ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => setReferralOpen(true)}
                className="text-primary hover:text-primary-foreground hover:bg-primary"
              >
                <Gift className="h-4 w-4 mr-2" />
                Refer & Earn
              </Button>
              <Button variant="hero" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/auth">Create Free Account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <ReferralPopup 
        open={referralOpen} 
        onOpenChange={setReferralOpen} 
        onShowRewards={showRewards}
      />
      
      <RewardsPopup 
        open={rewardsOpen} 
        onOpenChange={setRewardsOpen} 
        onBack={showReferral}
      />
    </header>
  );
};

export default Header;