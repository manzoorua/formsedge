import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Copy, Eye, Settings, Code, ExternalLink, Monitor, Smartphone, Tablet, Share2, Mail, Twitter, Facebook, Linkedin, Link as LinkIcon, RotateCcw, Sparkles, ArrowRight, Maximize2, PanelRightOpen, SidebarOpen, X, AlertCircle, Lock, Unlock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { EmbedPreview } from '@/components/embed/EmbedPreview';
import { EmbedCodeGenerator } from '@/components/embed/EmbedCodeGenerator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FormUrlParamConfig } from '@/lib/urlParamValidation';
import { Checkbox } from '@/components/ui/checkbox';
import { EmbedModeSelector, EmbedMode } from '@/components/embed/EmbedModeSelector';
import { DimensionPresets } from '@/components/embed/DimensionPresets';
import { PositionSelector, PositionType } from '@/components/embed/PositionSelector';
import { ThemeSelector, ThemeType } from '@/components/embed/ThemeSelector';
import { PopupConfigSection } from '@/components/embed/PopupConfigSection';
import { PlatformInstructions } from '@/components/embed/PlatformInstructions';
import { EmbedDiagnosticPanel } from '@/components/embed/EmbedDiagnosticPanel';
import { useDiagnosticEnabled } from '@/hooks/useDiagnosticEnabled';

interface Form {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  status: string;
  is_public: boolean;
  url_params_config?: FormUrlParamConfig[];
}
interface EmbedConfig {
  type: 'iframe' | 'popup' | 'slider' | 'widget';
  width: string;
  height: string;
  position: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  trigger: 'immediate' | 'scroll' | 'time' | 'click' | 'exit';
  triggerValue: string;
  theme: 'light' | 'dark' | 'auto';
  hideTitle: boolean;
  hideDescription: boolean;
  customCss: string;
  borderRadius: string;
  showBranding: boolean;
}
const FormEmbed = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig>({
    type: 'iframe',
    width: '100%',
    height: '600px',
    position: 'center',
    trigger: 'immediate',
    triggerValue: '',
    theme: 'light',
    hideTitle: false,
    hideDescription: false,
    customCss: '',
    borderRadius: '8px',
    showBranding: true
  });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [embedMode, setEmbedMode] = useState<'script' | 'iframe'>('script');
  const [scriptConfig, setScriptConfig] = useState({
    mode: 'inline' as EmbedMode,
    theme: 'light' as ThemeType,
    progress: 'top' as 'top' | 'bottom' | 'none',
    progressColor: '#8B5CF6',
    autoresize: true,
    width: '100%',
    height: '600px',
    position: 'center' as PositionType,
    trigger: 'immediate' as 'immediate' | 'scroll' | 'time' | 'click' | 'exit',
    triggerValue: '',
    mobileFullscreen: true,
    hideTitle: false,
    hideDescription: false,
    backgroundOpacity: 100,
    closeOnSubmit: false,
    popupSize: 'large' as 'large' | 'medium' | 'small',
    buttonText: 'Open Form',
    buttonColor: '#8B5CF6',
    buttonFontSize: 16,
    buttonBorderRadius: 8,
    buttonAsText: false,
    slideDirection: 'right' as 'left' | 'right',
    tabText: 'Try me!',
    buttonIcon: '',
    iconSize: 20,
    tooltipText: '',
    // Advanced behavior properties
    customLaunchEnabled: false,
    showLaunchButton: true,
    preventReopen: false,
    closeOnSubmitDelay: 0,
    scrollPercentage: '60' as '30' | '60' | '90'
  });
  const [urlParamValues, setUrlParamValues] = useState<Record<string, {
    value: string;
    transitive: boolean;
  }>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string>('wordpress');
  const [isUpdatingPublic, setIsUpdatingPublic] = useState(false);
  const { enabled: diagnosticEnabled } = useDiagnosticEnabled();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (user && id) {
      fetchForm();
    }
  }, [user, id]);

  // Initialize URL param values when form loads
  useEffect(() => {
    if (form?.url_params_config) {
      const initial: Record<string, {
        value: string;
        transitive: boolean;
      }> = {};
      form.url_params_config.forEach((param: FormUrlParamConfig) => {
        initial[param.name] = {
          value: param.default_value || '',
          transitive: param.transitive_default || false
        };
      });
      setUrlParamValues(initial);
    }
  }, [form]);
  const fetchForm = async () => {
    try {
      // Check if user can access this form
      const {
        data: formData,
        error: formError
      } = await supabase.from('forms').select('id, title, description, owner_id, status, is_public, url_params_config').eq('id', id).single();
      if (formError) throw formError;

      // Check access permissions
      const {
        data: hasAccess
      } = await supabase.rpc('can_access_form', {
        form_id: id,
        user_id: user?.id
      });
      if (!hasAccess) {
        toast({
          title: "Access denied",
          description: "You don't have permission to embed this form",
          variant: "destructive"
        });
        return;
      }
      setForm({
        ...formData,
        url_params_config: formData.url_params_config as unknown as FormUrlParamConfig[] || undefined
      });
    } catch (error: any) {
      toast({
        title: "Error loading form",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleConfigChange = (key: keyof EmbedConfig, value: any) => {
    setEmbedConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Embed code has been copied to your clipboard"
    });
  };
  const handleSocialShare = (platform: string) => {
    const formUrl = `${window.location.origin}/f/${id}`;
    const shareUrl = encodeURIComponent(formUrl);
    const shareTitle = encodeURIComponent(form?.title || 'Check out this form');
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
    }
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };
  const handleEmailShare = () => {
    const formUrl = `${window.location.origin}/f/${id}`;
    const subject = encodeURIComponent(`Check out this form: ${form?.title || 'Form'}`);
    const body = encodeURIComponent(`Hi,\n\nI'd like to share this form with you: ${form?.title}\n\n${form?.description ? form.description + '\n\n' : ''}You can fill it out here: ${formUrl}\n\nBest regards`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  const handleCopyShareLink = () => {
    const formUrl = `${window.location.origin}/f/${id}`;
    copyToClipboard(formUrl);
    toast({
      title: "Link copied!",
      description: "Form URL copied to clipboard"
    });
  };
  const handleMakePublic = async () => {
    setIsUpdatingPublic(true);
    try {
      const {
        error
      } = await supabase.from('forms').update({
        is_public: true
      }).eq('id', id);
      if (error) throw error;
      setForm(prev => prev ? {
        ...prev,
        is_public: true
      } : null);
      toast({
        title: "Form is now public",
        description: "The iframe preview will now work correctly"
      });
    } catch (error: any) {
      toast({
        title: "Error updating form",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPublic(false);
    }
  };
  const generateScriptSnippet = () => {
    const baseUrl = window.location.origin;

    // Build data-fe-hidden string
    const hiddenPairs: string[] = [];
    Object.entries(urlParamValues).forEach(([name, config]) => {
      if (config.value && !config.transitive) {
        hiddenPairs.push(`${name}=${config.value}`);
      }
    });
    const hiddenAttr = hiddenPairs.length > 0 ? `\n  data-fe-hidden="${hiddenPairs.join(',')}"` : '';

    // Build data-fe-transitive-params string
    const transitiveKeys = Object.entries(urlParamValues).filter(([_, config]) => config.transitive).map(([name, _]) => name);
    const transitiveAttr = transitiveKeys.length > 0 ? `\n  data-fe-transitive-params="${transitiveKeys.join(',')}"` : '';
    const extraAttrs = [];
    if (scriptConfig.width && scriptConfig.width !== '100%') extraAttrs.push(`data-fe-width="${scriptConfig.width}"`);
    if (scriptConfig.height && scriptConfig.height !== '600px') extraAttrs.push(`data-fe-height="${scriptConfig.height}"`);
    if (scriptConfig.position !== 'center') extraAttrs.push(`data-fe-position="${scriptConfig.position}"`);
    if (scriptConfig.mobileFullscreen) extraAttrs.push(`data-fe-mobile-fullscreen="true"`);
    if (scriptConfig.backgroundOpacity !== 100) extraAttrs.push(`data-fe-background-opacity="${scriptConfig.backgroundOpacity}"`);
    if (scriptConfig.closeOnSubmit) extraAttrs.push(`data-fe-close-on-submit="true"`);

    // NEW: Custom launch attributes
    if (scriptConfig.customLaunchEnabled && scriptConfig.mode !== 'inline') {
      extraAttrs.push(`data-fe-trigger="${scriptConfig.trigger}"`);
      if (scriptConfig.trigger === 'scroll') {
        extraAttrs.push(`data-fe-scroll-percentage="${scriptConfig.scrollPercentage}"`);
      } else if (scriptConfig.trigger === 'time') {
        extraAttrs.push(`data-fe-delay="${scriptConfig.triggerValue}"`);
      }
      if (scriptConfig.preventReopen) {
        extraAttrs.push(`data-fe-prevent-reopen="true"`);
      }
    }
    if (!scriptConfig.showLaunchButton && scriptConfig.mode !== 'inline') {
      extraAttrs.push(`data-fe-auto-launch="true"`);
    }
    if (scriptConfig.closeOnSubmit && scriptConfig.closeOnSubmitDelay > 0) {
      extraAttrs.push(`data-fe-close-delay="${scriptConfig.closeOnSubmitDelay}"`);
    }
    const extraAttrsStr = extraAttrs.length > 0 ? '\n  ' + extraAttrs.join('\n  ') : '';
    if (scriptConfig.mode === 'inline') {
      return `<!-- FormsEdge Inline Embed -->
<div
  data-fe-form="${id}"
  data-fe-mode="inline"
  data-fe-theme="${scriptConfig.theme}"
  data-fe-progress="${scriptConfig.progress}"
  data-fe-autoresize="${scriptConfig.autoresize}"${hiddenAttr}${transitiveAttr}${extraAttrsStr}
></div>
<script src="${baseUrl}/formsedge-embed.js" async></script>`;
    }
    const modeLabels = {
      popup: 'Popup',
      slidein: 'Slider'
    };
    const buttonAttrs = [`data-fe-open="${id}"`, `data-fe-mode="${scriptConfig.mode}"`, `data-fe-theme="${scriptConfig.theme}"`, `data-fe-popup-size="${scriptConfig.popupSize}"`, `data-fe-button-color="${scriptConfig.buttonColor}"`, `data-fe-button-font-size="${scriptConfig.buttonFontSize}"`, `data-fe-button-radius="${scriptConfig.buttonBorderRadius}"`, scriptConfig.buttonAsText && `data-fe-button-as-text="true"`, scriptConfig.mode === 'slidein' && `data-fe-slide-direction="${scriptConfig.slideDirection}"`, scriptConfig.mode === 'slidein' && scriptConfig.tabText && `data-fe-tab-text="${scriptConfig.tabText}"`, scriptConfig.buttonIcon && `data-fe-icon="${scriptConfig.buttonIcon}"`, scriptConfig.buttonIcon && scriptConfig.iconSize && `data-fe-icon-size="${scriptConfig.iconSize}"`, scriptConfig.tooltipText && `data-fe-tooltip="${scriptConfig.tooltipText}"`].filter(Boolean);
    const urlParamsStr = Object.keys(urlParamValues).length > 0 ? '\n  ' + Object.entries(urlParamValues).map(([key, config]) => {
      if (config.value && !config.transitive) {
        return `data-fe-param-${key}="${config.value}"`;
      }
      return null;
    }).filter(Boolean).join('\n  ') : '';
    const buttonTag = scriptConfig.buttonAsText ? 'a' : 'button';
    const buttonStyle = scriptConfig.buttonAsText ? `color: ${scriptConfig.buttonColor}; text-decoration: underline; font-size: ${scriptConfig.buttonFontSize}px; cursor: pointer;` : `background-color: ${scriptConfig.buttonColor}; color: white; padding: 12px 24px; font-size: ${scriptConfig.buttonFontSize}px; border-radius: ${scriptConfig.buttonBorderRadius}%; border: none; cursor: pointer;`;
    return `<!-- FormsEdge ${modeLabels[scriptConfig.mode] || 'Modal'} Embed -->
<${buttonTag}
  ${buttonAttrs.join('\n  ')}${hiddenAttr}${transitiveAttr}${extraAttrsStr}${urlParamsStr}
  style="${buttonStyle}"
>
  ${scriptConfig.buttonText}
</${buttonTag}>
<script src="${baseUrl}/formsedge-embed.js" async></script>`;
  };
  const handleReset = () => {
    setScriptConfig({
      mode: 'inline',
      theme: 'light',
      progress: 'top',
      progressColor: '#8B5CF6',
      autoresize: true,
      width: '100%',
      height: '600px',
      position: 'center',
      trigger: 'immediate',
      triggerValue: '',
      mobileFullscreen: true,
      hideTitle: false,
      hideDescription: false,
      backgroundOpacity: 100,
      closeOnSubmit: false,
      popupSize: 'large',
      buttonText: 'Open Form',
      buttonColor: '#8B5CF6',
      buttonFontSize: 16,
      buttonBorderRadius: 8,
      buttonAsText: false,
      slideDirection: 'right',
      tabText: 'Try me!',
      buttonIcon: '',
      iconSize: 20,
      tooltipText: '',
      customLaunchEnabled: false,
      showLaunchButton: true,
      preventReopen: false,
      closeOnSubmitDelay: 0,
      scrollPercentage: '60'
    });
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults"
    });
  };

  // Detect if advanced features are enabled (requires script-based embed)
  const hasAdvancedFeatures = (config: typeof scriptConfig): boolean => {
    const isAdvancedMode = config.mode !== 'inline';
    const hasCustomTrigger = config.customLaunchEnabled && config.trigger !== 'immediate';
    const hasPreventReopen = config.preventReopen;
    const hasCloseDelay = config.closeOnSubmit && config.closeOnSubmitDelay > 0;
    const hasAutoLaunch = !config.showLaunchButton;
    const hasCustomButton = config.buttonColor !== '#8B5CF6' || config.buttonFontSize !== 16 || config.buttonBorderRadius !== 8 || config.buttonAsText;
    const hasBackgroundOpacity = config.backgroundOpacity !== 100;
    const hasCustomProgress = config.progress !== 'top';
    const hasMobileFullscreen = config.mobileFullscreen && config.mode !== 'inline';
    return isAdvancedMode || hasCustomTrigger || hasPreventReopen || hasCloseDelay || hasAutoLaunch || hasCustomButton || hasBackgroundOpacity || hasCustomProgress || hasMobileFullscreen;
  };

  // Determine actual code type to generate
  const actualCodeType = embedMode === 'iframe' && hasAdvancedFeatures(scriptConfig) ? 'script' : embedMode;
  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (!form) {
    return <Navigate to="/dashboard" replace />;
  }
  const formUrl = `${window.location.origin}/f/${form.id}`;
  return <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{form.title}</h1>
              <p className="text-sm text-muted-foreground">Embed & Share</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
              {form.status}
            </Badge>
            <Button variant="outline" asChild>
              <Link to={`/forms/${id}/responses`}>
                Responses
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Public Status Warning */}
        {!form.is_public && <Alert className="mb-6 border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Form is Private</AlertTitle>
            <AlertDescription className="text-warning/90">
              This form is currently private. The iframe preview won't work until you make it public.
              <Button onClick={handleMakePublic} disabled={isUpdatingPublic} size="sm" variant="outline" className="ml-4 border-warning text-warning hover:bg-warning/20">
                <Unlock className="h-3 w-3 mr-2" />
                {isUpdatingPublic ? 'Making Public...' : 'Make Public Now'}
              </Button>
            </AlertDescription>
          </Alert>}

        {/* Embed Mode Selector */}
        <Tabs value={embedMode} onValueChange={v => setEmbedMode(v as 'script' | 'iframe')} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="script">
              <Code className="h-4 w-4 mr-2" />
              Script-based (Recommended)
            </TabsTrigger>
            <TabsTrigger value="iframe">
              Legacy iframe
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Form Status Warning */}
            {form.status !== 'published' && <Card className="border-warning bg-warning/5">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-warning">
                      Form must be published to be embedded
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Publish your form from the builder to make it available for embedding.
                  </p>
                </CardContent>
              </Card>}

            {/* Quick Share */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Quick Share</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-url">Form URL</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input id="form-url" value={formUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(formUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share on Social
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share This Form</DialogTitle>
                        <DialogDescription>
                          Choose a platform to share your form
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleSocialShare('twitter')}>
                          <Twitter className="h-4 w-4 mr-2" />
                          Share on Twitter
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleSocialShare('facebook')}>
                          <Facebook className="h-4 w-4 mr-2" />
                          Share on Facebook
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleSocialShare('linkedin')}>
                          <Linkedin className="h-4 w-4 mr-2" />
                          Share on LinkedIn
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={handleCopyShareLink}>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleEmailShare}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Script-based Embed Configuration */}
            {embedMode === 'script' && <>
                {/* New Tabs: Design, Advanced, Embed SDK */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Embed Configuration</span>
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="design" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="design">Design</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        <TabsTrigger value="sdk">Embed SDK</TabsTrigger>
                      </TabsList>

                      {/* Design Tab */}
                      <TabsContent value="design" className="space-y-6">
                        {/* Embed Mode Selector */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Embed Mode</Label>
                          <EmbedModeSelector value={scriptConfig.mode} onChange={mode => setScriptConfig({
                        ...scriptConfig,
                        mode
                      })} />
                        </div>

                        {/* Popup Configuration (for overlay modes) */}
                        {(scriptConfig.mode === 'popup' || scriptConfig.mode === 'slidein') && <div className="pt-4 border-t border-border">
                            <Label className="text-base font-semibold mb-4 block">
                              Trigger Button Settings
                            </Label>
                            <PopupConfigSection mode={scriptConfig.mode} config={{
                        popupSize: scriptConfig.popupSize,
                        buttonText: scriptConfig.buttonText,
                        buttonColor: scriptConfig.buttonColor,
                        buttonFontSize: scriptConfig.buttonFontSize,
                        buttonBorderRadius: scriptConfig.buttonBorderRadius,
                        buttonAsText: scriptConfig.buttonAsText,
                        slideDirection: scriptConfig.slideDirection,
                        tabText: scriptConfig.tabText,
                        buttonIcon: scriptConfig.buttonIcon,
                        iconSize: scriptConfig.iconSize,
                        tooltipText: scriptConfig.tooltipText
                      }} onChange={updates => setScriptConfig({
                        ...scriptConfig,
                        ...updates
                      })} />
                          </div>}

                        {/* Dimensions (only for inline) */}
                        {scriptConfig.mode === 'inline' && <DimensionPresets width={scriptConfig.width} height={scriptConfig.height} onWidthChange={width => setScriptConfig({
                      ...scriptConfig,
                      width
                    })} onHeightChange={height => setScriptConfig({
                      ...scriptConfig,
                      height
                    })} />}

                        {/* Display Options */}
                        <div className="space-y-4 pt-4 border-t">
                          <Label className="text-base font-semibold">Display Options</Label>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="mobile-fullscreen" className="text-sm">
                              Mobile Full-screen
                              <p className="text-xs text-muted-foreground font-normal mt-1">
                                Auto-expand to full screen on mobile devices
                              </p>
                            </Label>
                            <Switch id="mobile-fullscreen" checked={scriptConfig.mobileFullscreen} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          mobileFullscreen: v
                        })} />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="hide-title" className="text-sm">Hide Form Title</Label>
                            <Switch id="hide-title" checked={scriptConfig.hideTitle} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          hideTitle: v
                        })} />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="hide-desc" className="text-sm">Hide Form Description</Label>
                            <Switch id="hide-desc" checked={scriptConfig.hideDescription} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          hideDescription: v
                        })} />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">
                              Background Opacity: {scriptConfig.backgroundOpacity}%
                            </Label>
                            <Slider value={[scriptConfig.backgroundOpacity]} onValueChange={v => setScriptConfig({
                          ...scriptConfig,
                          backgroundOpacity: v[0]
                        })} min={0} max={100} step={5} />
                          </div>
                        </div>

                        {/* Theme Selection */}
                        <div className="pt-4 border-t">
                          <ThemeSelector value={scriptConfig.theme} onChange={theme => setScriptConfig({
                        ...scriptConfig,
                        theme
                      })} />
                        </div>
                      </TabsContent>

                      {/* Advanced Tab */}
                      <TabsContent value="advanced" className="space-y-6">
                        {/* Behaviour Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Behaviour</Label>
                            {scriptConfig.mode === 'inline' && <Badge variant="outline" className="text-xs">
                                Some features only apply to overlay modes
                              </Badge>}
                          </div>
                          
                          {/* Quick Mode Switcher Card */}
                          {scriptConfig.mode === 'inline' && <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                              <CardContent className="py-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                                      Want to use custom triggers and launch controls?
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                                      Switch to an overlay mode (popup, slide-in, etc.) to enable advanced behaviour options.
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button variant="outline" size="sm" onClick={() => {
                                  setScriptConfig({
                                    ...scriptConfig,
                                    mode: 'popup'
                                  });
                                  toast({
                                    title: "Switched to Popup mode",
                                    description: "Advanced behaviour options are now available"
                                  });
                                }} className="h-8">
                                        <Maximize2 className="h-3 w-3 mr-1" />
                                        Popup
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => {
                                  setScriptConfig({
                                    ...scriptConfig,
                                    mode: 'slidein'
                                  });
                                  toast({
                                    title: "Switched to Slider mode",
                                    description: "Advanced behaviour options are now available"
                                  });
                                }} className="h-8">
                                        <PanelRightOpen className="h-3 w-3 mr-1" />
                                        Slider
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>}
                          
                          {/* Custom Launch Options */}
                          <div className="flex items-center justify-between">
                            <Label htmlFor="custom-launch" className="text-sm font-normal">
                              Custom launch options
                              {scriptConfig.mode === 'inline' && <span className="block text-xs text-muted-foreground font-normal mt-1">
                                  Available in overlay modes (popup, slide-in, etc.)
                                </span>}
                            </Label>
                            <Switch id="custom-launch" checked={scriptConfig.customLaunchEnabled} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          customLaunchEnabled: v,
                          trigger: v ? scriptConfig.trigger : 'immediate'
                        })} disabled={scriptConfig.mode === 'inline'} />
                          </div>
                          
                          {/* Trigger Configuration */}
                          {scriptConfig.customLaunchEnabled && <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                              <Label className="text-sm">Launch trigger</Label>
                              <Select value={scriptConfig.trigger} onValueChange={v => setScriptConfig({
                          ...scriptConfig,
                          trigger: v as any,
                          triggerValue: v === 'scroll' ? '60' : v === 'time' ? '5' : ''
                        })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="immediate">On page load</SelectItem>
                                  <SelectItem value="exit">On exit intent</SelectItem>
                                  <SelectItem value="scroll">After scrolling</SelectItem>
                                  <SelectItem value="time">After a set time</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {scriptConfig.trigger === 'scroll' && <Select value={scriptConfig.scrollPercentage} onValueChange={v => setScriptConfig({
                          ...scriptConfig,
                          scrollPercentage: v as '30' | '60' | '90',
                          triggerValue: v
                        })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="30">30% of page</SelectItem>
                                    <SelectItem value="60">60% of page</SelectItem>
                                    <SelectItem value="90">90% of page</SelectItem>
                                  </SelectContent>
                                </Select>}
                              
                              {scriptConfig.trigger === 'time' && <div className="flex items-center gap-2">
                                  <Input type="number" min="1" max="60" value={scriptConfig.triggerValue} onChange={e => setScriptConfig({
                            ...scriptConfig,
                            triggerValue: e.target.value
                          })} placeholder="5" className="flex-1" />
                                  <span className="text-sm text-muted-foreground">seconds</span>
                                </div>}
                            </div>}
                          
                          {/* Show Launch Button */}
                          <div className="flex items-center justify-between">
                            <Label htmlFor="show-button" className="text-sm font-normal">
                              Show launch button
                              {scriptConfig.mode === 'inline' && <span className="block text-xs text-muted-foreground font-normal mt-1">
                                  Not applicable in inline mode
                                </span>}
                            </Label>
                            <Switch id="show-button" checked={scriptConfig.showLaunchButton} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          showLaunchButton: v
                        })} disabled={scriptConfig.mode === 'inline'} />
                          </div>
                          
                          {/* Prevent Re-open */}
                          {scriptConfig.customLaunchEnabled && <div className="flex items-center justify-between">
                              <Label htmlFor="prevent-reopen" className="text-sm font-normal">
                                Prevent re-open on close
                                <span className="block text-xs text-muted-foreground font-normal mt-1">
                                  Form won't reappear after user closes it
                                </span>
                              </Label>
                              <Switch id="prevent-reopen" checked={scriptConfig.preventReopen} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          preventReopen: v
                        })} />
                            </div>}
                          
                          {/* Close on Submit with Delay */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="close-submit" className="text-sm font-normal">
                                Close on submit
                                {scriptConfig.mode === 'inline' && <span className="block text-xs text-muted-foreground font-normal mt-1">
                                    Not applicable in inline mode
                                  </span>}
                              </Label>
                              <Switch id="close-submit" checked={scriptConfig.closeOnSubmit} onCheckedChange={v => setScriptConfig({
                            ...scriptConfig,
                            closeOnSubmit: v
                          })} disabled={scriptConfig.mode === 'inline'} />
                            </div>
                            
                            {scriptConfig.closeOnSubmit && <div className="flex items-center gap-2 pl-4">
                                <Label className="text-sm text-muted-foreground">Delay for</Label>
                                <Input type="number" min="0" max="30" value={scriptConfig.closeOnSubmitDelay} onChange={e => setScriptConfig({
                            ...scriptConfig,
                            closeOnSubmitDelay: parseInt(e.target.value) || 0
                          })} className="w-20" />
                                <span className="text-sm text-muted-foreground">seconds</span>
                              </div>}
                          </div>
                        </div>

                        {/* Display & Performance Section */}
                        <div className="space-y-4 pt-6 border-t">
                          <Label className="text-base font-semibold">Display & Performance</Label>
                          
                          {/* Progress Bar */}
                          <div className="space-y-3">
                            <Label className="text-sm">Progress Bar Position</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['top', 'bottom', 'none'] as const).map(pos => <Button key={pos} type="button" variant={scriptConfig.progress === pos ? 'default' : 'outline'} onClick={() => setScriptConfig({
                            ...scriptConfig,
                            progress: pos
                          })} className="capitalize">
                                  {pos}
                                </Button>)}
                            </div>
                          </div>

                          {/* Auto-resize for inline mode */}
                          {scriptConfig.mode === 'inline' && <div className="flex items-center justify-between">
                              <Label htmlFor="autoresize" className="text-sm font-normal">
                                Auto-resize to Content
                                <p className="text-xs text-muted-foreground font-normal mt-1">
                                  Automatically adjust height based on form content
                                </p>
                              </Label>
                              <Switch id="autoresize" checked={scriptConfig.autoresize} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          autoresize: v
                        })} />
                            </div>}
                        </div>
                      </TabsContent>

                      {/* Embed SDK Tab */}
                      <TabsContent value="sdk" className="space-y-6">
                        {/* Important notice about script URL */}
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Important:</strong> The embed code below contains an environment-specific script URL. 
                            Always copy the full code from this page—do not modify the script URL or use generic examples from other sources.
                          </AlertDescription>
                        </Alert>

                        {/* Code snippet */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Embed Code</Label>
                          <Textarea value={generateScriptSnippet()} readOnly rows={scriptConfig.mode === 'inline' ? 10 : 9} className="font-mono text-sm" />
                          <Button onClick={() => copyToClipboard(generateScriptSnippet())} className="w-full" disabled={form.status !== 'published'}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Embed Code
                          </Button>
                          {form.status !== 'published' && <p className="text-sm text-muted-foreground text-center">
                              Publish your form to generate embed code
                            </p>}
                        </div>
                        
                        {/* URL Parameters Configuration */}
                        {form?.url_params_config && form.url_params_config.length > 0 && <div className="space-y-3 pt-4 border-t">
                            <Label className="text-base font-semibold">URL Parameters</Label>
                            <p className="text-sm text-muted-foreground">
                              Configure static values or enable transitive capture from page URL
                            </p>
                            <div className="space-y-3">
                              {form.url_params_config.map((param: FormUrlParamConfig) => <div key={param.name} className="space-y-2 p-3 border rounded-lg bg-muted/20">
                                  <div className="flex items-center justify-between">
                                    <Label className="font-medium">
                                      {param.label || param.name}
                                      {param.description && <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                                          {param.description}
                                        </span>}
                                    </Label>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-xs">Static Value</Label>
                                      <Input value={urlParamValues[param.name]?.value || ''} onChange={e => setUrlParamValues(prev => ({
                                ...prev,
                                [param.name]: {
                                  ...prev[param.name],
                                  value: e.target.value
                                }
                              }))} placeholder={param.default_value || 'Enter value...'} disabled={urlParamValues[param.name]?.transitive} />
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id={`transitive-${param.name}`} checked={urlParamValues[param.name]?.transitive || false} onCheckedChange={checked => setUrlParamValues(prev => ({
                                ...prev,
                                [param.name]: {
                                  ...prev[param.name],
                                  value: checked ? '' : prev[param.name]?.value || '',
                                  transitive: checked as boolean
                                }
                              }))} />
                                      <Label htmlFor={`transitive-${param.name}`} className="text-xs">
                                        Read from page URL
                                      </Label>
                                    </div>
                                  </div>
                                </div>)}
                            </div>
                          </div>}
                        
                        {/* Platform-Specific Instructions */}
                        <div className="space-y-4 pt-6 border-t">
                          <div className="space-y-2">
                            <Label className="text-base font-semibold">
                              Choose your platform
                            </Label>
                            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="wordpress">WordPress</SelectItem>
                                <SelectItem value="squarespace">Squarespace</SelectItem>
                                <SelectItem value="webflow">Webflow</SelectItem>
                                <SelectItem value="shopify">Shopify</SelectItem>
                                <SelectItem value="wix">Wix</SelectItem>
                                <SelectItem value="html">Generic HTML</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <PlatformInstructions platform={selectedPlatform} embedCode={generateScriptSnippet()} onCopyCode={copyToClipboard} />
                        </div>
                        
                        {/* Live preview */}
                        <div className="pt-4 border-t space-y-3">
                          <Label className="text-base font-semibold">Live Preview</Label>
                          <iframe src={`/f/${id}?embed=1&mode=${scriptConfig.mode}&theme=${scriptConfig.theme}&progress=${scriptConfig.progress}`} className="w-full border rounded-lg" style={{
                        height: scriptConfig.mode === 'inline' ? '600px' : '400px'
                      }} />
                        </div>
                        
                        {/* Debugging Helper */}
                        <div className="pt-4 border-t space-y-3">
                          <Label className="text-base font-semibold">Debugging Tools</Label>
                          <p className="text-sm text-muted-foreground">
                            Test your form in isolation to diagnose embedding issues
                          </p>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                const iframeUrl = `${window.location.origin}/f/${id}?embed=1&mode=${scriptConfig.mode}&theme=${scriptConfig.theme}&progress=${scriptConfig.progress}`;
                                window.open(iframeUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open iframe URL in new tab
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              If the form is interactive in this tab but not in your embedded page, the issue is likely CSS or overlays on your host page.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>}
            
            {/* Legacy iframe Embed Configuration */}
            {embedMode === 'iframe' && <>
                {/* Status Indicator */}
                <Card className={hasAdvancedFeatures(scriptConfig) ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20" : "border-green-500/50 bg-green-50 dark:bg-green-950/20"}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      {hasAdvancedFeatures(scriptConfig) ? <>
                          <Code className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                              Generating Script-based Embed Code
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Advanced features enabled. Using FormsEdge embed script for full functionality.
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                      setEmbedMode('script');
                      toast({
                        title: "Switched to Script-based mode",
                        description: "You're now in dedicated script-based configuration"
                      });
                    }}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Switch Mode
                          </Button>
                        </> : <>
                          <Code className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                              Generating Simple iframe Code
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300">
                              Using basic iframe embed. Enable advanced features for more options.
                            </p>
                          </div>
                        </>}
                    </div>
                  </CardContent>
                </Card>

                {/* Unified Configuration Card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>iframe Embed Configuration</span>
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="design" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="design">Design</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        <TabsTrigger value="sdk">Embed SDK</TabsTrigger>
                      </TabsList>

                      {/* Design Tab */}
                      <TabsContent value="design" className="space-y-6">
                        {/* Embed Mode Selector */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold">Embed Mode</Label>
                          <EmbedModeSelector value={scriptConfig.mode} onChange={mode => setScriptConfig({
                        ...scriptConfig,
                        mode
                      })} />
                        </div>

                        {/* Popup Configuration (for overlay modes) */}
                        {(scriptConfig.mode === 'popup' || scriptConfig.mode === 'slidein') && <div className="pt-4 border-t border-border">
                            <Label className="text-base font-semibold mb-4 block">
                              Trigger Button Settings
                            </Label>
                            <PopupConfigSection mode={scriptConfig.mode} config={{
                        popupSize: scriptConfig.popupSize,
                        buttonText: scriptConfig.buttonText,
                        buttonColor: scriptConfig.buttonColor,
                        buttonFontSize: scriptConfig.buttonFontSize,
                        buttonBorderRadius: scriptConfig.buttonBorderRadius,
                        buttonAsText: scriptConfig.buttonAsText,
                        slideDirection: scriptConfig.slideDirection,
                        tabText: scriptConfig.tabText,
                        buttonIcon: scriptConfig.buttonIcon,
                        iconSize: scriptConfig.iconSize,
                        tooltipText: scriptConfig.tooltipText
                      }} onChange={updates => setScriptConfig({
                        ...scriptConfig,
                        ...updates
                      })} />
                          </div>}

                        {/* Dimensions (only for inline) */}
                        {scriptConfig.mode === 'inline' && <DimensionPresets width={scriptConfig.width} height={scriptConfig.height} onWidthChange={width => setScriptConfig({
                      ...scriptConfig,
                      width
                    })} onHeightChange={height => setScriptConfig({
                      ...scriptConfig,
                      height
                    })} />}

                        {/* Display Options */}
                        <div className="space-y-4 pt-4 border-t">
                          <Label className="text-base font-semibold">Display Options</Label>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="mobile-fullscreen" className="text-sm">
                              Mobile Full-screen
                              <p className="text-xs text-muted-foreground font-normal mt-1">
                                Auto-expand to full screen on mobile devices
                              </p>
                            </Label>
                            <Switch id="mobile-fullscreen" checked={scriptConfig.mobileFullscreen} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          mobileFullscreen: v
                        })} />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="hide-title" className="text-sm">Hide Form Title</Label>
                            <Switch id="hide-title" checked={scriptConfig.hideTitle} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          hideTitle: v
                        })} />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="hide-desc" className="text-sm">Hide Form Description</Label>
                            <Switch id="hide-desc" checked={scriptConfig.hideDescription} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          hideDescription: v
                        })} />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">
                              Background Opacity: {scriptConfig.backgroundOpacity}%
                            </Label>
                            <Slider value={[scriptConfig.backgroundOpacity]} onValueChange={v => setScriptConfig({
                          ...scriptConfig,
                          backgroundOpacity: v[0]
                        })} min={0} max={100} step={5} />
                          </div>
                        </div>

                        {/* Theme Selection */}
                        <div className="pt-4 border-t">
                          <ThemeSelector value={scriptConfig.theme} onChange={theme => setScriptConfig({
                        ...scriptConfig,
                        theme
                      })} />
                        </div>
                      </TabsContent>

                      {/* Advanced Tab */}
                      <TabsContent value="advanced" className="space-y-6">
                        {/* Behaviour Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Behaviour</Label>
                            {scriptConfig.mode === 'inline' && <Badge variant="outline" className="text-xs">
                                Some features only apply to overlay modes
                              </Badge>}
                          </div>
                          
                          {/* Quick Mode Switcher Card */}
                          {scriptConfig.mode === 'inline' && <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                              <CardContent className="py-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                                      Want to use custom triggers and launch controls?
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                                      Switch to an overlay mode (popup, slide-in, etc.) to enable advanced behaviour options.
                                    </p>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button variant="outline" size="sm" onClick={() => {
                                  setScriptConfig({
                                    ...scriptConfig,
                                    mode: 'popup'
                                  });
                                  toast({
                                    title: "Switched to Popup mode",
                                    description: "Advanced behaviour options are now available"
                                  });
                                }} className="h-8">
                                        <Maximize2 className="h-3 w-3 mr-1" />
                                        Popup
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => {
                                  setScriptConfig({
                                    ...scriptConfig,
                                    mode: 'slidein'
                                  });
                                  toast({
                                    title: "Switched to Slider mode",
                                    description: "Advanced behaviour options are now available"
                                  });
                                }} className="h-8">
                                        <PanelRightOpen className="h-3 w-3 mr-1" />
                                        Slider
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>}
                          
                          {/* Custom Launch Options */}
                          <div className="flex items-center justify-between">
                            <Label htmlFor="custom-launch-iframe" className="text-sm font-normal">
                              Custom launch options
                              {scriptConfig.mode === 'inline' && <span className="block text-xs text-muted-foreground font-normal mt-1">
                                  Available in overlay modes (popup, slide-in, etc.)
                                </span>}
                            </Label>
                            <Switch id="custom-launch-iframe" checked={scriptConfig.customLaunchEnabled} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          customLaunchEnabled: v,
                          trigger: v ? scriptConfig.trigger : 'immediate'
                        })} disabled={scriptConfig.mode === 'inline'} />
                          </div>
                          
                          {/* Trigger Configuration */}
                          {scriptConfig.customLaunchEnabled && <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                              <Label className="text-sm">Launch trigger</Label>
                              <Select value={scriptConfig.trigger} onValueChange={v => setScriptConfig({
                          ...scriptConfig,
                          trigger: v as any,
                          triggerValue: v === 'scroll' ? '60' : v === 'time' ? '5' : ''
                        })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="immediate">On page load</SelectItem>
                                  <SelectItem value="exit">On exit intent</SelectItem>
                                  <SelectItem value="scroll">After scrolling</SelectItem>
                                  <SelectItem value="time">After a set time</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {scriptConfig.trigger === 'scroll' && <Select value={scriptConfig.scrollPercentage} onValueChange={v => setScriptConfig({
                          ...scriptConfig,
                          scrollPercentage: v as '30' | '60' | '90',
                          triggerValue: v
                        })}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="30">30% of page</SelectItem>
                                    <SelectItem value="60">60% of page</SelectItem>
                                    <SelectItem value="90">90% of page</SelectItem>
                                  </SelectContent>
                                </Select>}
                              
                              {scriptConfig.trigger === 'time' && <div className="flex items-center gap-2">
                                  <Input type="number" min="1" max="60" value={scriptConfig.triggerValue} onChange={e => setScriptConfig({
                            ...scriptConfig,
                            triggerValue: e.target.value
                          })} placeholder="5" className="flex-1" />
                                  <span className="text-sm text-muted-foreground">seconds</span>
                                </div>}
                            </div>}
                          
                          {/* Show Launch Button */}
                          <div className="flex items-center justify-between">
                            <Label htmlFor="show-button-iframe" className="text-sm font-normal">
                              Show launch button
                              {scriptConfig.mode === 'inline' && <span className="block text-xs text-muted-foreground font-normal mt-1">
                                  Not applicable in inline mode
                                </span>}
                            </Label>
                            <Switch id="show-button-iframe" checked={scriptConfig.showLaunchButton} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          showLaunchButton: v
                        })} disabled={scriptConfig.mode === 'inline'} />
                          </div>
                          
                          {/* Prevent Re-open */}
                          {scriptConfig.customLaunchEnabled && <div className="flex items-center justify-between">
                              <Label htmlFor="prevent-reopen-iframe" className="text-sm font-normal">
                                Prevent re-open on close
                                <span className="block text-xs text-muted-foreground font-normal mt-1">
                                  Form won't reappear after user closes it
                                </span>
                              </Label>
                              <Switch id="prevent-reopen-iframe" checked={scriptConfig.preventReopen} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          preventReopen: v
                        })} />
                            </div>}
                          
                          {/* Close on Submit with Delay */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="close-submit" className="text-sm font-normal">
                                Close on submit
                                {scriptConfig.mode === 'inline' && <span className="block text-xs text-muted-foreground font-normal mt-1">
                                    Not applicable in inline mode
                                  </span>}
                              </Label>
                              <Switch id="close-submit" checked={scriptConfig.closeOnSubmit} onCheckedChange={v => setScriptConfig({
                            ...scriptConfig,
                            closeOnSubmit: v
                          })} disabled={scriptConfig.mode === 'inline'} />
                            </div>
                            
                            {scriptConfig.closeOnSubmit && <div className="flex items-center gap-2 pl-4">
                                <Label className="text-sm text-muted-foreground">Delay for</Label>
                                <Input type="number" min="0" max="30" value={scriptConfig.closeOnSubmitDelay} onChange={e => setScriptConfig({
                            ...scriptConfig,
                            closeOnSubmitDelay: parseInt(e.target.value) || 0
                          })} className="w-20" />
                                <span className="text-sm text-muted-foreground">seconds</span>
                              </div>}
                          </div>
                        </div>

                        {/* Display & Performance Section */}
                        <div className="space-y-4 pt-6 border-t">
                          <Label className="text-base font-semibold">Display & Performance</Label>
                          
                          {/* Progress Bar */}
                          <div className="space-y-3">
                            <Label className="text-sm">Progress Bar Position</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['top', 'bottom', 'none'] as const).map(pos => <Button key={pos} type="button" variant={scriptConfig.progress === pos ? 'default' : 'outline'} onClick={() => setScriptConfig({
                            ...scriptConfig,
                            progress: pos
                          })} className="capitalize">
                                  {pos}
                                </Button>)}
                            </div>
                          </div>

                          {/* Auto-resize for inline mode */}
                          {scriptConfig.mode === 'inline' && <div className="flex items-center justify-between">
                              <Label htmlFor="autoresize" className="text-sm font-normal">
                                Auto-resize to Content
                                <p className="text-xs text-muted-foreground font-normal mt-1">
                                  Automatically adjust height based on form content
                                </p>
                              </Label>
                              <Switch id="autoresize" checked={scriptConfig.autoresize} onCheckedChange={v => setScriptConfig({
                          ...scriptConfig,
                          autoresize: v
                        })} />
                            </div>}
                        </div>
                      </TabsContent>

                      {/* Embed SDK Tab */}
                      <TabsContent value="sdk" className="space-y-6">
                        {/* Important notice about script URL */}
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Important:</strong> The embed code below contains an environment-specific script URL. 
                            Always copy the full code from this page—do not modify the script URL or use generic examples from other sources.
                          </AlertDescription>
                        </Alert>
                        
                        {/* Code Type Badge */}
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Embed Code</Label>
                          <Badge variant={actualCodeType === 'script' ? 'default' : 'secondary'}>
                            {actualCodeType === 'script' ? 'Script-based' : 'Simple iframe'}
                          </Badge>
                        </div>
                        
                        {/* Code snippet */}
                        <div className="space-y-3">
                          <Textarea value={actualCodeType === 'script' ? generateScriptSnippet() : `<iframe 
  src="${window.location.origin}/f/${form.id}?embed=1${scriptConfig.theme !== 'light' ? `&theme=${scriptConfig.theme}` : ''}${scriptConfig.hideTitle ? '&hideTitle=true' : ''}${scriptConfig.hideDescription ? '&hideDescription=true' : ''}" 
  width="${scriptConfig.width}" 
  height="${scriptConfig.height}"
  frameborder="0"
  style="border: none; border-radius: 8px;">
</iframe>`} readOnly rows={actualCodeType === 'script' ? scriptConfig.mode === 'inline' ? 10 : 9 : 7} className="font-mono text-sm" />
                          <Button onClick={() => copyToClipboard(actualCodeType === 'script' ? generateScriptSnippet() : `<iframe 
  src="${window.location.origin}/f/${form.id}?embed=1${scriptConfig.theme !== 'light' ? `&theme=${scriptConfig.theme}` : ''}${scriptConfig.hideTitle ? '&hideTitle=true' : ''}${scriptConfig.hideDescription ? '&hideDescription=true' : ''}" 
  width="${scriptConfig.width}" 
  height="${scriptConfig.height}"
  frameborder="0"
  style="border: none; border-radius: 8px;">
</iframe>`)} className="w-full" disabled={form.status !== 'published'}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Embed Code
                          </Button>
                          {form.status !== 'published' && <p className="text-sm text-muted-foreground text-center">
                              Publish your form to generate embed code
                            </p>}
                        </div>
                        
                        {/* URL Parameters Configuration */}
                        {form?.url_params_config && form.url_params_config.length > 0 && actualCodeType === 'script' && <div className="space-y-3 pt-4 border-t">
                            <Label className="text-base font-semibold">URL Parameters</Label>
                            <p className="text-sm text-muted-foreground">
                              Configure static values or enable transitive capture from page URL
                            </p>
                            <div className="space-y-3">
                              {form.url_params_config.map((param: FormUrlParamConfig) => <div key={param.name} className="space-y-2 p-3 border rounded-lg bg-muted/20">
                                  <div className="flex items-center justify-between">
                                    <Label className="font-medium">
                                      {param.label || param.name}
                                      {param.description && <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                                          {param.description}
                                        </span>}
                                    </Label>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div>
                                      <Label className="text-xs">Static Value</Label>
                                      <Input value={urlParamValues[param.name]?.value || ''} onChange={e => setUrlParamValues(prev => ({
                                ...prev,
                                [param.name]: {
                                  ...prev[param.name],
                                  value: e.target.value
                                }
                              }))} placeholder={param.default_value || 'Enter value...'} disabled={urlParamValues[param.name]?.transitive} />
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Checkbox id={`transitive-${param.name}`} checked={urlParamValues[param.name]?.transitive || false} onCheckedChange={checked => setUrlParamValues(prev => ({
                                ...prev,
                                [param.name]: {
                                  ...prev[param.name],
                                  value: checked ? '' : prev[param.name]?.value || '',
                                  transitive: checked as boolean
                                }
                              }))} />
                                      <Label htmlFor={`transitive-${param.name}`} className="text-xs">
                                        Read from page URL
                                      </Label>
                                    </div>
                                  </div>
                                </div>)}
                            </div>
                          </div>}
                        
                        {/* Platform-Specific Instructions */}
                        <div className="space-y-4 pt-6 border-t">
                          <div className="space-y-2">
                            <Label className="text-base font-semibold">
                              Choose your platform
                            </Label>
                            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="wordpress">WordPress</SelectItem>
                                <SelectItem value="squarespace">Squarespace</SelectItem>
                                <SelectItem value="webflow">Webflow</SelectItem>
                                <SelectItem value="shopify">Shopify</SelectItem>
                                <SelectItem value="wix">Wix</SelectItem>
                                <SelectItem value="html">Generic HTML</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <PlatformInstructions platform={selectedPlatform} embedCode={actualCodeType === 'script' ? generateScriptSnippet() : `<iframe 
  src="${window.location.origin}/f/${form.id}?embed=1${scriptConfig.theme !== 'light' ? `&theme=${scriptConfig.theme}` : ''}${scriptConfig.hideTitle ? '&hideTitle=true' : ''}${scriptConfig.hideDescription ? '&hideDescription=true' : ''}" 
  width="${scriptConfig.width}" 
  height="${scriptConfig.height}"
  frameborder="0"
  style="border: none; border-radius: 8px;">
</iframe>`} onCopyCode={copyToClipboard} />
                        </div>
                        
                        {/* Live preview */}
                        <div className="pt-4 border-t space-y-3">
                          <Label className="text-base font-semibold">Live Preview</Label>
                          <iframe src={`/f/${id}?embed=1&mode=${scriptConfig.mode}&theme=${scriptConfig.theme}&progress=${scriptConfig.progress}`} className="w-full border rounded-lg" style={{
                        height: scriptConfig.mode === 'inline' ? '600px' : '400px'
                      }} />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>}
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant={previewDevice === 'desktop' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewDevice('desktop')}>
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button variant={previewDevice === 'tablet' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewDevice('tablet')}>
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button variant={previewDevice === 'mobile' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewDevice('mobile')}>
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="embed-preview-container">
                <EmbedPreview formId={form.id} config={embedConfig} device={previewDevice} disabled={form.status !== 'published'} />
              </CardContent>
            </Card>

            {/* Diagnostic Panel */}
            {diagnosticEnabled && <EmbedDiagnosticPanel targetSelector=".embed-preview-container" />}

            {/* Embed Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Embed Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Embed Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Conversions</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Analytics will appear after your form is embedded and receives traffic
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default FormEmbed;