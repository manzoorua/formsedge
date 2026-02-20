import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, Zap, Heart, Lock, Globe } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Built for
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                Creators Like You
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We were frustrated with expensive form builders that limited responses and charged premium prices. 
              So we built the form tool we always wanted - powerful, affordable, and generous.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm shadow-elegant">
                <div className="flex items-center space-x-3 mb-8">
                  <Heart className="w-8 h-8 text-red-500" />
                  <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
                </div>
                
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-6">
                  <p>
                    It started with a simple frustration. As entrepreneurs and creators, we needed forms for our projects - 
                    lead capture pages, customer surveys, product feedback forms. But every tool we tried had the same problem: 
                    tiny response limits on free plans and expensive upgrades for basic features.
                  </p>
                  
                  <p>
                    <strong className="text-foreground">Typeform charged $25-83/month</strong> for features we considered essential. 
                    Other alternatives weren't much better. We realized there had to be a better way - a form builder that 
                    was both powerful and accessible to everyone.
                  </p>
                  
                  <p>
                    So we built FormsEdge with a different philosophy: <strong className="text-foreground">unlimited everything on the free plan</strong>. 
                    No artificial limits, no credit card requirements, no "gotchas." Just a great form builder that works for 
                    solo creators and growing businesses alike.
                  </p>
                  
                  <p>
                    Today, over 50,000 creators trust FormsEdge to collect millions of responses every month. 
                    We're profitable, bootstrapped, and committed to keeping forms accessible for everyone.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                What We
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  Stand For
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-4">Creator First</h3>
                <p className="text-muted-foreground">
                  Every feature we build is designed with creators in mind. If it doesn't help you create better forms, we don't build it.
                </p>
              </Card>
              
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-4">Fast & Simple</h3>
                <p className="text-muted-foreground">
                  Complex doesn't mean better. We believe the best tools are simple, fast, and get out of your way.
                </p>
              </Card>
              
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-4">Honest Pricing</h3>
                <p className="text-muted-foreground">
                  No hidden fees, no artificial limits, no surprises. Fair pricing that scales with your success.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Trust Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Security &
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  Trust
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your data is precious. We treat it that way.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <Lock className="w-8 h-8 text-success mb-4" />
                <h3 className="font-semibold text-lg text-foreground mb-2">End-to-End Encryption</h3>
                <p className="text-muted-foreground text-sm">
                  All data is encrypted in transit and at rest using industry-standard AES-256 encryption.
                </p>
              </Card>
              
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <Globe className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="font-semibold text-lg text-foreground mb-2">EU Servers</h3>
                <p className="text-muted-foreground text-sm">
                  Data stored on secure AWS servers in the European Union with full GDPR compliance.
                </p>
              </Card>
              
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <Shield className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-foreground mb-2">99.9% Uptime</h3>
                <p className="text-muted-foreground text-sm">
                  Reliable infrastructure with automatic backups and 24/7 monitoring.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Team & Sustainability */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-foreground mb-8">
                Built to
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  Last
                </span>
              </h2>
              
              <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm">
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  We're bootstrapped, profitable, and here for the long haul. No venture capital pressure, 
                  no artificial growth targets. Just a sustainable business built on happy customers.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 mb-6">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
                    <div className="text-muted-foreground">Active users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">5M+</div>
                    <div className="text-muted-foreground">Forms created</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">100M+</div>
                    <div className="text-muted-foreground">Responses collected</div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  Got ideas for new features? We love hearing from our community and ship new features every week.
                </p>
                
                <Button variant="hero" size="lg">
                  Request a Feature
                </Button>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;