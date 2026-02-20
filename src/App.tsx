import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AuthErrorBoundary from "@/components/AuthErrorBoundary";
import { ThemeProvider } from "next-themes";
import { useChatbotSettings } from "@/hooks/useChatbotSettings";
import { ChatbotIframeEmbed } from "@/components/chat/ChatbotIframeEmbed";

// Lazy load all page components for better performance
const Index = lazy(() => import("./pages/Index"));
const Features = lazy(() => import("./pages/Features"));
const Comparison = lazy(() => import("./pages/Comparison"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FormBuilder = lazy(() => import("./pages/FormBuilder"));
const FormView = lazy(() => import("./pages/FormView"));

const FormResponses = lazy(() => import("./pages/FormResponses"));
const FormAnalytics = lazy(() => import("./pages/FormAnalytics"));
const FormEmbed = lazy(() => import("./pages/FormEmbed"));
const FormIntegrations = lazy(() => import("./pages/FormIntegrations"));
const DashboardIntegrations = lazy(() => import("./pages/DashboardIntegrations"));
const Templates = lazy(() => import("./pages/Templates"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Billing = lazy(() => import("./pages/Billing"));
const BillingSuccess = lazy(() => import("./pages/BillingSuccess"));
const BillingCancel = lazy(() => import("./pages/BillingCancel"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(module => ({ default: module.AdminLayout })));
const AdminOverview = lazy(() => import("./pages/AdminOverview"));
const AdminReferrals = lazy(() => import("./pages/AdminReferrals"));
const AdminTemplates = lazy(() => import("./pages/AdminTemplates"));
const AdminChatbot = lazy(() => import("./pages/AdminChatbot"));
const AdminSystemConfig = lazy(() => import("./pages/AdminSystemConfig"));
const AdminBilling = lazy(() => import("./pages/AdminBilling"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminContactSubmissions = lazy(() => import("./pages/AdminContactSubmissions"));
const AdminCompanySettings = lazy(() => import("./pages/AdminCompanySettings"));

// Documentation pages
const Docs = lazy(() => import("./pages/Docs"));
const GettingStarted = lazy(() => import("./pages/docs/GettingStarted"));
const BuildingFirstForm = lazy(() => import("./pages/docs/BuildingFirstForm"));
const FormBuilderGuide = lazy(() => import("./pages/docs/FormBuilderGuide"));
const UrlParametersGuide = lazy(() => import("./pages/docs/UrlParametersGuide"));
const ResponsesGuide = lazy(() => import("./pages/docs/ResponsesGuide"));
const EmbeddingGuide = lazy(() => import("./pages/docs/EmbeddingGuide"));
const IntegrationsGuide = lazy(() => import("./pages/docs/IntegrationsGuide"));
const Troubleshooting = lazy(() => import("./pages/docs/Troubleshooting"));
const ApiDocumentation = lazy(() => import("./pages/docs/ApiDocumentation"));
const TeamCollaborationGuide = lazy(() => import("./pages/docs/TeamCollaborationGuide"));
const BillingGuide = lazy(() => import("./pages/docs/BillingGuide"));
const AccountGuide = lazy(() => import("./pages/docs/AccountGuide"));

// Organization & Team pages
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

// Component to conditionally render chatbot based on route
const ChatbotVisibilityWrapper = ({ 
  config, 
  loading, 
  children 
}: { 
  config: any; 
  loading: boolean; 
  children: React.ReactNode;
}) => {
  const location = useLocation();
  
  // Define routes where chatbot should be hidden
  const hideChatbotOnRoutes = [
    /^\/forms\/[^/]+\/embed$/,  // Embed preview: /forms/{id}/embed
    /^\/f\/[^/]+/,              // Public forms: /f/{id} (includes ?embed=1)
  ];
  
  // Check if current route matches any exclusion pattern
  const shouldHideChatbot = hideChatbotOnRoutes.some(pattern => 
    pattern.test(location.pathname)
  );
  
  return (
    <>
      {children}
      
      {/* Conditionally render chatbot */}
      {!loading && !shouldHideChatbot && config?.enabled && config?.widgetId && (
        <ChatbotIframeEmbed
          widgetId={config.widgetId}
          initialState={config.initialState}
          mode={config.mode || 'iframe'}
        />
      )}
    </>
  );
};

const App = () => {
  const { config, loading } = useChatbotSettings();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AuthErrorBoundary>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
            <BrowserRouter>
              <ChatbotVisibilityWrapper config={config} loading={loading}>
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/comparison" element={<Comparison />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/f/:id" element={<FormView />} />
              
              <Route
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/integrations" 
                element={
                  <ProtectedRoute>
                    <DashboardIntegrations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/forms/new" 
                element={
                  <ProtectedRoute>
                    <FormBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/forms/:id" 
                element={
                  <ProtectedRoute>
                    <FormBuilder />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/forms/:id/responses" 
                element={
                  <ProtectedRoute>
                    <FormResponses />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/forms/:id/analytics" 
                element={
                  <ProtectedRoute>
                    <FormAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/forms/:id/embed" 
                element={
                  <ProtectedRoute>
                    <FormEmbed />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/forms/:id/integrations" 
                element={
                  <ProtectedRoute>
                    <FormIntegrations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/billing" 
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                } 
              />
              <Route path="/billing/success" element={<BillingSuccess />} />
              <Route path="/billing/cancel" element={<BillingCancel />} />
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="contact-submissions" element={<AdminContactSubmissions />} />
                <Route path="company-settings" element={<AdminCompanySettings />} />
                <Route path="referrals" element={<AdminReferrals />} />
                <Route path="templates" element={<AdminTemplates />} />
                <Route path="chatbot" element={<AdminChatbot />} />
                <Route path="billing" element={<AdminBilling />} />
                <Route path="user-management" element={<AdminUsers />} />
                <Route path="system-config" element={<AdminSystemConfig />} />
              </Route>
              
              {/* Documentation Routes */}
              <Route path="/docs" element={<Docs />} />
              <Route path="/docs/getting-started" element={<GettingStarted />} />
              <Route path="/docs/building-first-form" element={<BuildingFirstForm />} />
              <Route path="/docs/form-builder" element={<FormBuilderGuide />} />
              <Route path="/docs/url-parameters" element={<UrlParametersGuide />} />
              <Route path="/docs/responses" element={<ResponsesGuide />} />
              <Route path="/docs/embedding" element={<EmbeddingGuide />} />
              <Route path="/docs/integrations" element={<IntegrationsGuide />} />
              <Route path="/docs/troubleshooting" element={<Troubleshooting />} />
              <Route path="/docs/api" element={<ApiDocumentation />} />
              <Route path="/docs/team-collaboration" element={<TeamCollaborationGuide />} />
              <Route path="/docs/billing" element={<BillingGuide />} />
              <Route path="/docs/account" element={<AccountGuide />} />
              
              {/* Team Invitation Routes */}
              <Route path="/accept-invite/:token" element={<AcceptInvitation />} />
              
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ChatbotVisibilityWrapper>
            </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
      </AuthErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
