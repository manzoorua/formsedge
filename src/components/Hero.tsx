import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-forms.jpg";
import shopifyLogo from "@/assets/shopify-logo.png";
import wixLogo from "@/assets/wix-logo.jpg";
import squarespaceLogo from "@/assets/squarespace-logo.png";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-subtle overflow-hidden">
        <div className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-5">
            <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>The most affordable Typeform alternative</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Build Beautiful
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                Forms & Surveys
              </span>
              <span className="block">For Free</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Create unlimited forms with unlimited responses. No credit card required. 
              Start building professional surveys, lead capture forms, and quizzes in minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="hero" className="text-lg px-8 py-4" onClick={handleCreateAccount}>
              {user ? "Go To Dashboard" : "Create Free Account"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
              <Link to="/templates">
                View Templates
              </Link>
            </Button>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-border shadow-elegant">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 text-left">
              Works seamlessly with your favorite platforms
            </h3>
            <div className="flex items-center gap-4 overflow-x-auto">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.064.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.607-3.582.607M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0" />
                </svg>
                <p className="font-semibold text-foreground">WordPress</p>
              </div>
              <div className="flex items-center gap-0">
                <img src={shopifyLogo} alt="Shopify" className="w-8 h-8 object-contain" />
                <p className="font-semibold text-foreground -ml-1">Shopify</p>
              </div>
              <div className="flex items-center gap-1">
                <img src={wixLogo} alt="Wix" className="w-6 h-6 object-contain" />
                <p className="font-semibold text-foreground">Wix</p>
              </div>
              <div className="flex items-center gap-0">
                <img src={squarespaceLogo} alt="Squarespace" className="w-10 h-10 object-contain" />
                <p className="font-semibold text-foreground -ml-2">Squarespace</p>
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>Unlimited forms & responses</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span>100+ templates</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative animate-float">
            <img 
              src={heroImage} 
              alt="Modern form builder interface showing beautiful surveys and forms"
              className="w-full h-auto rounded-2xl shadow-elegant"
            />
            <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-2xl"></div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-primary p-4 animate-pulse-slow">
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-xs text-muted-foreground">Unlimited</div>
          </div>
          
          <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground rounded-lg shadow-secondary p-4 animate-float">
            <div className="text-lg font-bold">FREE</div>
            <div className="text-xs">Forever</div>
          </div>
        </div>
        </div>
      </section>
  );
};

export default Hero;