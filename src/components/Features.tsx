import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Zap, 
  Palette, 
  BarChart3, 
  Link2, 
  Shield, 
  Smartphone,
  Brain,
  Users,
  Globe,
  Crown,
  HelpCircle
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Builder",
      description: "Drag-and-drop form builder with real-time preview. Create professional forms in minutes, not hours.",
      color: "text-primary",
      isPremium: false
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Smart Logic Jumps",
      description: "Build intelligent forms with conditional logic, score calculations, and multiple endings.",
      color: "text-accent",
      isPremium: false
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Beautiful Templates",
      description: "500+ professional templates for surveys, lead capture, quizzes, and order forms.",
      color: "text-purple-500",
      isPremium: false
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Track views, conversions, drop-off rates, and completion times with beautiful charts.",
      color: "text-success",
      isPremium: true
    },
    {
      icon: <Link2 className="w-8 h-8" />,
      title: "6,000+ Integrations",
      description: "Connect with Zapier, Google Sheets, Slack, Calendly, and thousands of other tools.",
      color: "text-blue-500",
      isPremium: false
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "Forms that look perfect on every device. Responsive design with touch-friendly controls.",
      color: "text-orange-500",
      isPremium: false
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Work together on forms with team members. Share, edit, and manage forms collectively.",
      color: "text-pink-500",
      isPremium: true
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "GDPR Compliant",
      description: "Secure data storage on EU AWS servers with end-to-end encryption and privacy protection.",
      color: "text-red-500",
      isPremium: false
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Custom Domains",
      description: "Host forms on your own domain. White-label solutions with custom branding options.",
      color: "text-indigo-500",
      isPremium: true
    }
  ];

  const faqs = [
    {
      question: "How does the drag-and-drop builder work?",
      answer: "Our intuitive builder lets you add fields by simply dragging them onto your form canvas. You can rearrange, customize, and preview changes in real-time without any coding knowledge. It's as easy as building with blocks!"
    },
    {
      question: "Can I use conditional logic to show/hide fields?",
      answer: "Yes! Create smart forms with conditional logic that shows or hides fields based on user responses. Build branching paths, calculate scores, and direct users to different endings based on their answers."
    },
    {
      question: "What types of forms can I create?",
      answer: "You can create any type of form including surveys, lead capture forms, contact forms, registration forms, quizzes, order forms, feedback forms, application forms, and more. Our 500+ templates cover most use cases."
    },
    {
      question: "How do integrations work?",
      answer: "Connect your forms to 6,000+ apps through Zapier, or use native integrations with popular tools like Google Sheets, Slack, and Calendly. Data flows automatically when someone submits a form - no manual export needed."
    },
    {
      question: "Can I customize the look and feel of my forms?",
      answer: "Absolutely! Customize colors, fonts, backgrounds, button styles, and layouts to match your brand. Add your logo, use custom domains, and remove our branding on Pro plans for a completely white-label experience."
    },
    {
      question: "Are forms mobile-responsive automatically?",
      answer: "Yes! Every form is automatically optimized for mobile, tablet, and desktop. Our responsive design ensures your forms look perfect and work smoothly on any device with touch-friendly controls."
    },
    {
      question: "What analytics can I track?",
      answer: "Track views, submissions, conversion rates, completion times, drop-off points, and field-level analytics. See where users abandon forms and optimize for better results with our advanced analytics dashboard (Pro plan)."
    },
    {
      question: "Can multiple team members work on the same form?",
      answer: "Yes! With our Team Collaboration feature (Pro plan), multiple team members can work together on forms, share templates, manage responses, and assign roles with different permission levels."
    },
    {
      question: "Is my data secure and GDPR compliant?",
      answer: "Yes! We store all data on secure EU AWS servers with end-to-end encryption. We're fully GDPR compliant with data processing agreements, right to deletion, data export, and privacy controls built-in."
    },
    {
      question: "Can I embed forms on my website?",
      answer: "Yes! Embed forms using three flexible modes: inline (directly in your page), popup (modal overlay), or slider (side tab trigger). Choose your website platform (WordPress, Squarespace, Webflow, Shopify, Wix, or HTML) and get step-by-step embedding instructions tailored to your platform. Works everywhere!"
    }
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything you need to create
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              Amazing Forms
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From simple contact forms to complex surveys with integrations.
            All the features you need, none of the complexity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative p-6 hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border border-border/50">
              {feature.isPremium && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg">
                  <Crown className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-foreground mb-3">
              Common Questions About
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                Our Features
              </span>
            </h3>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about what FormsEdge can do for you.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border-b bg-white/80 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4 px-6">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="font-semibold text-base text-foreground">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <p className="text-muted-foreground text-sm leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Features;