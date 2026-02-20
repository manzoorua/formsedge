import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocsSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const searchItems = [
    { title: "Getting Started", url: "/docs/getting-started", keywords: ["start", "begin", "intro", "introduction"] },
    { title: "Build Your First Form", url: "/docs/building-first-form", keywords: ["create", "first", "tutorial", "guide"] },
    { title: "Form Builder Guide", url: "/docs/form-builder", keywords: ["builder", "interface", "editor"] },
    { title: "URL Parameters", url: "/docs/url-parameters", keywords: ["url", "params", "hidden", "utm", "tracking"] },
    { title: "Managing Responses", url: "/docs/responses", keywords: ["response", "data", "export", "view"] },
    { title: "Embedding Forms", url: "/docs/embedding", keywords: ["embed", "iframe", "script", "website", "popup", "slider", "inline", "icon", "tooltip"] },
    { title: "Integrations", url: "/docs/integrations", keywords: ["webhook", "zapier", "integration", "connect"] },
    { title: "API Documentation", url: "/docs/api", keywords: ["api", "developer", "programmatic", "rest", "endpoint"] },
    { title: "Team Collaboration", url: "/docs/team-collaboration", keywords: ["team", "invite", "member", "collaboration", "roles", "permissions", "organization", "share"] },
    { title: "Billing & Subscriptions", url: "/docs/billing", keywords: ["billing", "subscription", "pricing", "upgrade", "plan", "payment", "invoice", "pro", "enterprise"] },
    { title: "Account Settings", url: "/docs/account", keywords: ["account", "profile", "settings", "password", "delete", "security", "email"] },
    { title: "Troubleshooting", url: "/docs/troubleshooting", keywords: ["help", "problem", "issue", "error", "fix"] },
  ];

  const filteredResults = query.length > 0
    ? searchItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        placeholder="Search documentation..."
        className="pl-10 py-6 text-lg"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {filteredResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredResults.map((result, idx) => (
            <button
              key={idx}
              onClick={() => {
                navigate(result.url);
                setQuery("");
              }}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
            >
              <div className="font-medium text-foreground">{result.title}</div>
              <div className="text-sm text-muted-foreground">{result.url}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocsSearch;
