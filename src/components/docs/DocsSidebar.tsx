import { Link, useLocation } from "react-router-dom";
import { Rocket, FileText, BarChart3, Link2, AlertCircle, Settings, Users, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
}

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const DocsSidebar = () => {
  const location = useLocation();

  const sections: NavSection[] = [
    {
      title: "Getting Started",
      icon: <Rocket className="w-4 h-4" />,
      items: [
        { title: "Introduction", href: "/docs/getting-started" },
        { title: "Build Your First Form", href: "/docs/building-first-form" },
      ]
    },
    {
      title: "Building Forms",
      icon: <FileText className="w-4 h-4" />,
      items: [
        { title: "Form Builder Guide", href: "/docs/form-builder" },
        { title: "URL Parameters", href: "/docs/url-parameters" },
      ]
    },
    {
      title: "Responses",
      icon: <BarChart3 className="w-4 h-4" />,
      items: [
        { title: "Managing Responses", href: "/docs/responses" },
      ]
    },
    {
      title: "Distribution",
      icon: <Link2 className="w-4 h-4" />,
      items: [
        { title: "Embedding Forms", href: "/docs/embedding" },
        { title: "Integrations", href: "/docs/integrations" },
        { title: "API Documentation", href: "/docs/api" },
      ]
    },
    {
      title: "Organization",
      icon: <Settings className="w-4 h-4" />,
      items: [
        { title: "Team Collaboration", href: "/docs/team-collaboration" },
      ]
    },
    {
      title: "Account",
      icon: <Settings className="w-4 h-4" />,
      items: [
        { title: "Billing & Subscriptions", href: "/docs/billing" },
        { title: "Account Settings", href: "/docs/account" },
      ]
    },
    {
      title: "Help",
      icon: <AlertCircle className="w-4 h-4" />,
      items: [
        { title: "Troubleshooting", href: "/docs/troubleshooting" },
      ]
    }
  ];

  return (
    <aside className="sticky top-4">
      <nav className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="flex items-center space-x-2 text-sm font-semibold text-foreground mb-3">
              {section.icon}
              <span>{section.title}</span>
            </div>
            <ul className="space-y-2 pl-6 border-l border-border">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <Link
                    to={item.href}
                    className={cn(
                      "block text-sm py-1 transition-colors",
                      location.pathname === item.href
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default DocsSidebar;
