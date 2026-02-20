import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { FormTemplate } from '../types/form';
import { supabase } from '../integrations/supabase/client';
import { Search, Filter, Star, Eye, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { TemplatePreview } from '../components/templates/TemplatePreview';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Templates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);
  const [importUrl, setImportUrl] = useState('');

  const [filteredTemplates, setFilteredTemplates] = useState<FormTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(((data || []).map(template => ({
        ...template,
        template_data: template.template_data as unknown as any
      })) as FormTemplate[]) || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(t => t.category) || [])];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by search query
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const useTemplate = (template: FormTemplate) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Use navigation-based template application for consistency
    navigate(`/forms/new?template=${template.id}`);
    setPreviewTemplate(null);
  };

  const featuredTemplates = filteredTemplates.filter(t => t.is_featured);
  const regularTemplates = filteredTemplates.filter(t => !t.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="min-h-screen bg-gradient-subtle pt-16">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-3xl"></div>
          <div className="relative py-16 px-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Form Templates
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get started quickly with professionally designed form templates for every use case. 
              <span className="block mt-2 text-primary font-medium">Save time and create beautiful forms in minutes.</span>
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg bg-background/80 backdrop-blur-sm border-2 focus:border-primary/50 shadow-elegant"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[220px] h-12 bg-background/80 backdrop-blur-sm border-2 focus:border-primary/50 shadow-elegant">
              <Filter className="h-5 w-5 mr-2" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-gradient-to-br from-muted/50 to-muted/30 border-0 shadow-elegant">
                <CardHeader>
                  <div className="h-6 bg-muted rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-muted rounded-lg w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded-lg w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded-lg mb-6"></div>
                  <div className="flex gap-2">
                    <div className="h-9 bg-muted rounded-lg flex-1"></div>
                    <div className="h-9 bg-muted rounded-lg flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Templates */}
            {featuredTemplates.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="h-5 w-5 text-white fill-current" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-500 bg-clip-text text-transparent">
                    Featured Templates
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredTemplates.map((template, index) => {
                    const gradientClasses = [
                      'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/50 dark:to-violet-800/50 border-purple-200 dark:border-purple-700',
                      'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-800/50 border-teal-200 dark:border-teal-700', 
                      'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-800/50 border-blue-200 dark:border-blue-700',
                      'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/50 dark:to-emerald-800/50 border-green-200 dark:border-green-700',
                      'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/50 dark:to-amber-800/50 border-orange-200 dark:border-orange-700'
                    ];
                    const gradientClass = gradientClasses[index % gradientClasses.length];
                    
                    return (
                      <Card 
                        key={template.id} 
                        className={`${gradientClass} hover:shadow-glow transition-all duration-500 hover:scale-105 hover:-translate-y-2 group border-2 backdrop-blur-sm`}
                      >
                        <CardHeader className="relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-10 rounded-full -mr-10 -mt-10"></div>
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="capitalize bg-primary/20 text-primary font-semibold border-primary/30">
                                {template.category}
                              </Badge>
                              {template.tags?.includes('recall') && (
                                <Badge variant="secondary" className="bg-gradient-primary text-white">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Recall
                                </Badge>
                              )}
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-warning to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                              <Star className="h-4 w-4 text-white fill-current" />
                            </div>
                          </div>
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                            {template.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-muted-foreground/80">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-background/60 dark:bg-background/80 backdrop-blur-sm rounded-lg m-3 mt-0">
                          <div className="flex flex-wrap gap-2 mb-6">
                            {template.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs bg-background/80 border-primary/20">
                                {tag}
                              </Badge>
                            ))}
                            {(template.tags?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-xs bg-background/80 border-primary/20">
                                +{(template.tags?.length || 0) - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setPreviewTemplate(template)}
                              className="flex-1 bg-background/80 hover:bg-background/90 border-primary/20 hover:border-primary/40"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => useTemplate(template)}
                              className="flex-1 bg-gradient-primary text-white shadow-primary hover:opacity-90"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Regular Templates */}
            {regularTemplates.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-8">All Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularTemplates.map((template, index) => {
                    const categoryColors = {
                      'contact': 'from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-blue-200 dark:border-blue-700',
                      'survey': 'from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-green-200 dark:border-green-700',
                      'feedback': 'from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 border-purple-200 dark:border-purple-700',
                      'registration': 'from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50 border-orange-200 dark:border-orange-700',
                      'application': 'from-teal-50 to-teal-100 dark:from-teal-900/50 dark:to-teal-800/50 border-teal-200 dark:border-teal-700',
                      'default': 'from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border-gray-200 dark:border-gray-700'
                    };
                    const colorClass = categoryColors[template.category as keyof typeof categoryColors] || categoryColors.default;
                    
                    return (
                      <Card 
                        key={template.id} 
                        className={`bg-gradient-to-br ${colorClass} hover:shadow-elegant transition-all duration-500 hover:scale-105 hover:-translate-y-1 group border-2 backdrop-blur-sm`}
                      >
                        <CardHeader className="relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-primary opacity-5 rounded-full -mr-8 -mt-8"></div>
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize bg-background/80 border-primary/20">
                                {template.category}
                              </Badge>
                              {template.tags?.includes('recall') && (
                                <Badge variant="secondary" className="bg-gradient-primary text-white">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Recall
                                </Badge>
                              )}
                            </div>
                          </div>
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                            {template.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-muted-foreground/80">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-background/60 dark:bg-background/80 backdrop-blur-sm rounded-lg m-3 mt-0">
                          <div className="flex flex-wrap gap-2 mb-6">
                            {template.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs bg-background/80 border-primary/20">
                                {tag}
                              </Badge>
                            ))}
                            {(template.tags?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-xs bg-background/80 border-primary/20">
                                +{(template.tags?.length || 0) - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setPreviewTemplate(template)}
                              className="flex-1 bg-background/80 hover:bg-background/90 border-primary/20 hover:border-primary/40"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => useTemplate(template)}
                              className="flex-1"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No templates found */}
            {filteredTemplates.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or check back later for new templates.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
      
      {/* Typeform Import Section */}
      <div className="container mx-auto px-4 pb-20">
        <TooltipProvider>
          <Card className="max-w-2xl mx-auto shadow-elegant">
            <CardHeader>
              <CardTitle>Migrate from Typeform</CardTitle>
              <CardDescription>
                Already using Typeform? Import your existing forms and make the switch seamlessly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input 
                  placeholder="Paste your Typeform URL here..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="flex-1"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="default">Import</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>
      
      <Footer />
      
      <TemplatePreview
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={useTemplate}
      />
    </div>
  );
}