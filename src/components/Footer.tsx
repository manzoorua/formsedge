import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl">FormsEdge</span>
            </div>
            <p className="text-muted mb-4">
              The most affordable Typeform alternative with unlimited forms and responses.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <div className="space-y-2">
              <Link to="/templates" className="block text-muted hover:text-white transition-colors">
                Templates
              </Link>
              <Link to="/pricing" className="block text-muted hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/integrations" className="block text-muted hover:text-white transition-colors">
                Integrations
              </Link>
              <Link to="/features" className="block text-muted hover:text-white transition-colors">
                Features
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-muted hover:text-white transition-colors">
                About Us
              </Link>
              <Link to="/blog" className="block text-muted hover:text-white transition-colors">
                Blog
              </Link>
              <Link to="/careers" className="block text-muted hover:text-white transition-colors">
                Careers
              </Link>
              <Link to="/contact" className="block text-muted hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <div className="space-y-2">
              <Link to="/docs" className="block text-muted hover:text-white transition-colors">
                Documentation
              </Link>
              <Link to="/docs/getting-started" className="block text-muted hover:text-white transition-colors">
                Getting Started
              </Link>
              <Link to="/docs/troubleshooting" className="block text-muted hover:text-white transition-colors">
                Troubleshooting
              </Link>
              <Link to="/templates" className="block text-muted hover:text-white transition-colors">
                Form Templates
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-muted hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-muted hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/security" className="block text-muted hover:text-white transition-colors">
                Security
              </Link>
              <Link to="/gdpr" className="block text-muted hover:text-white transition-colors">
                GDPR
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-muted/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted text-sm">
            © 2024 FormsEdge. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-sm text-muted">🇪🇺 EU servers</span>
            <span className="text-sm text-muted">🔒 GDPR compliant</span>
            <span className="text-sm text-muted">⚡ 99.9% uptime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;