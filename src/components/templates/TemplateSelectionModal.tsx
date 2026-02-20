import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FormTemplate } from '../../types/form';
import { supabase } from '../../integrations/supabase/client';
import { Search, Filter, Star, Eye, Plus, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { TemplatePreview } from './TemplatePreview';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface TemplateSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

export const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<FormTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

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

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const useTemplate = async (template: FormTemplate) => {
    try {
      if (!user) {
        navigate('/auth');
        return;
      }

      onClose();
      navigate(`/forms/new?template=${template.id}`);
      
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to apply template. Please try again.');
    }
  };

  const startFromScratch = () => {
    onClose();
    navigate('/forms/new');
  };

  const featuredTemplates = filteredTemplates.filter(t => t.is_featured);
  const regularTemplates = filteredTemplates.filter(t => !t.is_featured);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Choose a Template
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={startFromScratch}
                variant="outline"
                className="flex-1 h-12 border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5"
              >
                <FileText className="h-5 w-5 mr-2" />
                Start from Scratch
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
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

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-16 bg-muted rounded mb-4"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Featured Templates */}
                  {featuredTemplates.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-warning" />
                        <h3 className="text-lg font-semibold">Featured</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredTemplates.map((template) => (
                          <Card 
                            key={template.id} 
                            className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="capitalize bg-primary/20 text-primary">
                                  {template.category}
                                </Badge>
                                <Star className="h-4 w-4 text-warning fill-current" />
                              </div>
                              <CardTitle className="text-lg leading-tight">
                                {template.title}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-sm">
                                {template.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setPreviewTemplate(template)}
                                  className="flex-1"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => useTemplate(template)}
                                  className="flex-1 bg-gradient-primary text-white shadow-primary"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Use
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Templates */}
                  {regularTemplates.length > 0 && (
                    <div>
                      {featuredTemplates.length > 0 && (
                        <h3 className="text-lg font-semibold mb-4">More Templates</h3>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {regularTemplates.map((template) => (
                          <Card 
                            key={template.id} 
                            className="hover:shadow-lg transition-all duration-300 hover:scale-105 border hover:border-primary/30"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize">
                                  {template.category}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg leading-tight">
                                {template.title}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-sm">
                                {template.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setPreviewTemplate(template)}
                                  className="flex-1"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => useTemplate(template)}
                                  className="flex-1"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Use
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No templates found */}
                  {filteredTemplates.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-xl font-semibold mb-2">No templates found</h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your search criteria or start from scratch.
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
        </DialogContent>
      </Dialog>

      <TemplatePreview
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={useTemplate}
      />
    </>
  );
};