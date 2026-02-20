import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface DocsBreadcrumbProps {
  items: BreadcrumbItem[];
}

const DocsBreadcrumb = ({ items }: DocsBreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center">
          {idx > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
          {idx === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link to={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default DocsBreadcrumb;
