import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  BookOpen, Rocket, BarChart3, Link2, 
  FileText, Search, ArrowRight 
} from "lucide-react";

const LearningCenter = () => {
  const categories = [
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn the basics and create your first form",
      link: "/docs/getting-started",
      color: "text-primary"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Building Forms",
      description: "Master the form builder with detailed guides",
      link: "/docs/form-builder",
      color: "text-accent"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Managing Responses",
      description: "View, export, and analyze your form data",
      link: "/docs/responses",
      color: "text-chart-2"
    },
    {
      icon: <Link2 className="w-6 h-6" />,
      title: "Integrations",
      description: "Connect with your favorite tools and services",
      link: "/docs/integrations",
      color: "text-chart-3"
    }
  ];

  return (
    <section className="py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Learning Center</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Learn How to Build
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-2">
              Amazing Forms
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Step-by-step guides, tutorials, and documentation to help you get the most out of FormsEdge
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search documentation..."
              className="pl-10 py-6 text-lg"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/docs';
              }}
              readOnly
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categories.map((category, index) => (
            <Link key={index} to={category.link}>
              <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-border">
                <CardHeader>
                  <div className={`${category.color} mb-4`}>
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg mb-2">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
          <h3 className="text-2xl font-bold mb-6">Popular Guides</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/docs/building-first-form" className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="font-medium">Create Your First Form in 5 Minutes</span>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link to="/docs/url-parameters" className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="font-medium">Using URL Parameters & Hidden Fields</span>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link to="/docs/embedding" className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="font-medium">Embedding Forms on Your Website</span>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
            <Link to="/docs/troubleshooting" className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
              <span className="font-medium">Troubleshooting Common Issues</span>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <Link to="/docs">
              <BookOpen className="w-5 h-5 mr-2" />
              Browse All Documentation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LearningCenter;
