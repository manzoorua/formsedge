import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Zap,
  Code2,
  Database,
  Users,
  Palette,
  ArrowRight,
  Sparkles,
  Target,
  Shield,
} from "lucide-react";

const Comparison = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            Platform Comparison
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            FormsEdge vs Typeform
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-4xl mx-auto">
            Conversational forms, but built for builders, agencies, and SaaS teams
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Both FormsEdge and Typeform help you create beautiful, high-converting forms and surveys.
            The difference? <strong>Typeform is optimized for "create-and-forget" marketers. FormsEdge is optimized for builders</strong>—product teams, agencies, and SaaS founders who care about <strong>embeds, logic, data, and scale</strong> as much as good UX.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="lg" asChild className="hover:scale-105 transition-transform">
              <Link to="/auth">
                Start Building for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free forever plan • 5-min setup
          </p>
        </div>
      </section>

      {/* TL;DR Section */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why teams switch from Typeform to FormsEdge
            </h2>
          </div>
          
          <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Typeform-like conversational UX <span className="text-primary">plus</span> classic multi-step layouts</h3>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Deeper embedding & JS SDK – control the form from your app, not the other way around</h3>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">URL params + Recall + logic – personalization and routing that actually plugs into your stack</h3>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Built on modern stack (React + Supabase) – fast, extensible, developer friendly</h3>
                </div>
              </div>
              
              <div className="flex items-start gap-4 md:col-span-2">
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Pricing and limits that make sense at scale – especially for agencies and SaaS products</h3>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Side-by-side comparison
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-background rounded-lg overflow-hidden shadow-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="p-4 text-left font-semibold">Category</th>
                  <th className="p-4 text-left font-semibold bg-primary/10 text-primary">FormsEdge</th>
                  <th className="p-4 text-left font-semibold text-muted-foreground">Typeform</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4 font-medium">Form experience</td>
                  <td className="p-4 bg-primary/5">Conversational one-question flow <strong>and</strong> classic multi-step / grid layouts</td>
                  <td className="p-4 text-muted-foreground">Conversational, one question at a time</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-4 font-medium">Personalization</td>
                  <td className="p-4 bg-primary/5">Answers, URL params, and variables recallable throughout the form and redirects</td>
                  <td className="p-4 text-muted-foreground">Recall info & hidden fields; strong personalization</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Logic & variables</td>
                  <td className="p-4 bg-primary/5">Visual logic, calculated fields, URL-param aware routing; built to drive app flows</td>
                  <td className="p-4 text-muted-foreground">Branching & scoring; great for quizzes & surveys</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-4 font-medium">Embedding</td>
                  <td className="p-4 bg-primary/5">Script-based embed SDK, inline/popup/slide-in, postMessage, URL param forwarding, JS API</td>
                  <td className="p-4 text-muted-foreground">iFrame-based embeds with basic customization</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Developer experience</td>
                  <td className="p-4 bg-primary/5">React-friendly, JS SDK, webhook-first, API-style thinking</td>
                  <td className="p-4 text-muted-foreground">Primarily UI-driven, limited dev hooks</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-4 font-medium">Data model</td>
                  <td className="p-4 bg-primary/5">Full response DB (Supabase) + responses API + webhooks; easy to plug into CRMs, warehouses, or your backend</td>
                  <td className="p-4 text-muted-foreground">Responses API + webhooks; good for CRMs and automations</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Team & collaboration</td>
                  <td className="p-4 bg-primary/5">Built-in team roles, locks, collaboration, multi-form analytics</td>
                  <td className="p-4 text-muted-foreground">Workspaces & collaboration features</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-4 font-medium">Branding & theming</td>
                  <td className="p-4 bg-primary/5">Strong base themes + more control over layout, theming, and white-labeling</td>
                  <td className="p-4 text-muted-foreground">Beautiful default look; less flexible structurally</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Ideal user</td>
                  <td className="p-4 bg-primary/5 font-semibold">SaaS teams, agencies, and power users who embed forms into products & workflows</td>
                  <td className="p-4 text-muted-foreground">Marketers and teams who want quick, pretty stand-alone forms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Feature Section 1: Form Experience */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Form experience: more than just "pretty"</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                <strong>Typeform</strong> made the one-question, full-screen flow popular. It's beautiful and friendly.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                <strong>FormsEdge</strong> matches that experience—and adds more:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span><strong>Conversational mode</strong> for lead capture, quizzes, and onboarding</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span><strong>Classic multi-step layout</strong> when you need more "form-like" behavior (intake, applications, complex flows)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span><strong>Grid layouts & field widths</strong> for serious data capture, without losing the modern UX</span>
                </li>
              </ul>
              <Card className="mt-6 p-4 bg-accent/10 border-accent">
                <p className="text-sm">
                  <strong>In short:</strong> if you want only a pretty, one-question-at-a-time survey, Typeform is great.
                  If you want that <em>and</em> serious form layouts in one tool, that's FormsEdge.
                </p>
              </Card>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-primary/20 rounded"></div>
                <div className="h-4 w-full bg-primary/20 rounded"></div>
                <div className="h-4 w-5/6 bg-primary/20 rounded"></div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="h-24 bg-primary/30 rounded"></div>
                  <div className="h-24 bg-primary/30 rounded"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Personalization */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 order-2 md:order-1">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div className="h-3 w-32 bg-primary/20 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-accent/20 rounded"></div>
                  <div className="h-3 w-5/6 bg-accent/20 rounded"></div>
                  <div className="h-3 w-4/5 bg-accent/20 rounded"></div>
                </div>
              </div>
            </Card>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Personalization & Recall: remember everything, anywhere</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Both platforms support personalization—but FormsEdge leans into it as a <em>core primitive</em>.
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">FormsEdge takes it further:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Answer recall:</strong> Reference earlier answers anywhere in the flow (titles, descriptions, end screens, redirects)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>URL parameters & hidden data:</strong> First-class URL param config per form, automatically captured and stored
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Variables & calculations:</strong> Use calculated fields as variables for scores, totals, pricing
                      </div>
                    </li>
                  </ul>
                </div>
                <Card className="p-4 bg-accent/10 border-accent">
                  <p className="text-sm">
                    You don't just "see" personalization; you can <strong>wire it into how your product behaves</strong>.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Embedding */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Embedding & developer experience</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                Where Typeform stops, FormsEdge keeps going
              </p>
              <p className="text-muted-foreground mb-6">
                This is the biggest practical difference if you're building a SaaS product or complex site.
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Built from day one as an <span className="text-primary">embed-first</span> tool:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Script-based embed SDK</strong> – inline, popup, and slide-in modes with postMessage communication
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>JS API & events</strong> – Hook into onStart, onQuestionChange, onComplete
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>React-native feel</strong> – Treat FormsEdge as a component of your product, not a bolt-on
                      </div>
                    </li>
                  </ul>
                </div>
                <Card className="p-4 bg-primary/10 border-primary">
                  <p className="text-sm">
                    If you're embedding forms as part of your core UX (signup, onboarding, product surveys), FormsEdge is built to feel like <strong>part of your app</strong>—not an external widget.
                  </p>
                </Card>
              </div>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="space-y-4">
                <div className="bg-background/80 p-4 rounded border border-border font-mono text-sm">
                  <div className="text-primary">&lt;script</div>
                  <div className="pl-4">src="embed.js"</div>
                  <div className="pl-4">data-mode="inline"</div>
                  <div className="text-primary">&gt;&lt;/script&gt;</div>
                </div>
                <div className="h-32 bg-primary/20 rounded flex items-center justify-center">
                  <Code2 className="w-12 h-12 text-primary/50" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Section 4: Logic & Data */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 order-2 md:order-1">
              <div className="space-y-4">
                <Database className="w-12 h-12 text-primary" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-primary/20 rounded"></div>
                  <div className="h-3 w-4/5 bg-primary/20 rounded"></div>
                  <div className="h-3 w-5/6 bg-accent/20 rounded"></div>
                  <div className="h-3 w-3/4 bg-accent/20 rounded"></div>
                </div>
              </div>
            </Card>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Logic, flows, and data</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                From nice survey to real product flows
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">FormsEdge is designed for <strong>complex workflows</strong>:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Advanced branching & logic</strong> – Route users based on answers, URL params, or calculated scores
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Enterprise-ready response system</strong> – Normalized response tables, partial saves, per-field analytics
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Response API + Webhooks</strong> – Every response available through stable API and webhook events
                      </div>
                    </li>
                  </ul>
                </div>
                <Card className="p-4 bg-accent/10 border-accent">
                  <p className="text-sm">
                    <strong>Result:</strong> Use FormsEdge to power intake flows, qualification funnels, product onboarding, and internal tools—not just one-off surveys.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 5: Collaboration */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Collaboration, teams & scale</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Both tools support teams—but the focus is slightly different.
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">FormsEdge advantages:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Roles & form-level permissions</strong> (viewer/editor/admin)
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Edit locks and collaboration indicators</strong> to avoid overwrites
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Admin panel</strong> for managing users, billing, referrals, and global settings
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Built-in referral system</strong> and subscription tiers (for agencies / resellers)
                      </div>
                    </li>
                  </ul>
                </div>
                <Card className="p-4 bg-primary/10 border-primary">
                  <p className="text-sm">
                    If you're running multiple clients, brands, or products off the same platform, FormsEdge is structured to support that <strong>multi-tenant reality</strong>.
                  </p>
                </Card>
              </div>
            </div>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 bg-primary/30 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background/80 rounded">
                    <Shield className="w-5 h-5 text-success" />
                    <div className="h-2 w-20 bg-success/30 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/80 rounded">
                    <Shield className="w-5 h-5 text-primary" />
                    <div className="h-2 w-16 bg-primary/30 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-background/80 rounded">
                    <Shield className="w-5 h-5 text-accent" />
                    <div className="h-2 w-24 bg-accent/30 rounded"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Section 6: Branding */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 order-2 md:order-1">
              <div className="space-y-4">
                <Palette className="w-12 h-12 text-primary" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-primary/40 rounded"></div>
                  <div className="h-16 bg-accent/40 rounded"></div>
                  <div className="h-16 bg-success/40 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-primary/20 rounded"></div>
                  <div className="h-3 w-4/5 bg-accent/20 rounded"></div>
                </div>
              </div>
            </Card>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">Branding, theming & white-labeling</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Typeform-level polish—but with <strong>more control</strong> over how it fits into your brand.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">FormsEdge gives you:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Modern SaaS look by default</strong> – Custom colors, logos, fonts, dark/light themes
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>Layout controls</strong> – Card vs full-width vs multi-column
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                      <div>
                        <strong>White-label potential</strong> – Custom domains for hosted forms, embed with your branding
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Pick What Section */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Who should pick what?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-muted/50 border-muted">
              <h3 className="text-2xl font-bold mb-4 text-muted-foreground">Choose Typeform if…</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">You want a beautiful, opinionated, one-question-at-a-time survey tool</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Most forms live on standalone URLs, not deeply embedded in your product</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span className="text-muted-foreground">Your priority is "launch a pretty survey in minutes" and that's it</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/50 shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">Choose FormsEdge if…</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>You're a <strong>SaaS team, agency, or builder</strong> who embeds forms into products</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>You care about <strong>logic, recall, URL params, and deep integrations</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>You want both <strong>conversational UX and classic multi-step forms</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>You want your forms to behave like <strong>part of your application</strong>, not a third-party popup</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary">
            <Sparkles className="w-3 h-3 mr-1" />
            Start Building Today
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Build forms your users actually enjoy—and your engineers don't hate
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Try FormsEdge free, migrate a Typeform, or embed your first conversational flow into your app in minutes.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="p-6 bg-background/80 backdrop-blur-sm">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
              <p className="font-medium">Import existing forms & start from templates</p>
            </Card>
            <Card className="p-6 bg-background/80 backdrop-blur-sm">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
              <p className="font-medium">Add logic, recall, and URL params</p>
            </Card>
            <Card className="p-6 bg-background/80 backdrop-blur-sm">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
              <p className="font-medium">Drop a single embed script into your site and go</p>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button variant="hero" size="lg" asChild className="hover:scale-105 transition-transform">
              <Link to="/auth">
                Get Started with FormsEdge
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="bg-background hover:bg-background/80">
              <Link to="/contact">Talk to Us About Migrating</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required • Free forever plan • Migrate from Typeform in minutes
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Comparison;
