import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Users, 
  Headphones, 
  Handshake, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  FileText,
  Activity,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const contactFormSchema = z.object({
  inquiryType: z.enum(['general', 'sales', 'support', 'partnership'], {
    required_error: "Please select an inquiry type",
  }),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(20, "Message must be at least 20 characters").max(1000),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface CompanySettings {
  address_line1: string;
  address_line2: string;
  city_state_zip: string;
  country: string;
  sales_phone: string;
  support_phone: string;
  emergency_phone: string;
  general_email: string;
  sales_email: string;
  support_email: string;
  business_hours: string;
}

const defaultSettings: CompanySettings = {
  address_line1: 'Westridge Offices Ste: 197',
  address_line2: '1300 Walnut Hill Ln.',
  city_state_zip: 'Irving, TX 75038',
  country: 'US',
  sales_phone: '+1(214) 997-3572',
  support_phone: '+1(214) 997-3572',
  emergency_phone: '+1(214) 997-3572',
  general_email: 'info@FormsEdge.com',
  sales_email: 'sales@FormsEdge.com',
  support_email: 'support@FormsEdge.com',
  business_hours: 'Monday - Friday: 9:00 AM - 6:00 PM CST',
};

const Contact = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<string>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultSettings);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiryType: 'general',
    },
  });

  // Fetch company settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching company settings:', error);
          return;
        }
        
        if (data) {
          setCompanySettings(data as CompanySettings);
        }
      } catch (err) {
        console.error('Failed to fetch company settings:', err);
      }
    };
    
    fetchSettings();
  }, []);

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageSquare },
    { value: 'sales', label: 'Sales & Pricing', icon: Users },
    { value: 'support', label: 'Technical Support', icon: Headphones },
    { value: 'partnership', label: 'Partnership', icon: Handshake },
  ];

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('submit-contact-form', {
        body: {
          inquiry_type: data.inquiryType,
          full_name: data.fullName,
          email: data.email,
          company: data.company || null,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
        }
      });

      if (error) throw error;
      
      toast.success(response?.message || "Message sent successfully! We'll get back to you within 24 hours.");
      reset();
      setSelectedInquiry('general');
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about FormsEdge? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Contact Form */}
            <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Type of Inquiry */}
                <div className="space-y-3">
                  <Label>Type of Inquiry *</Label>
                  <RadioGroup
                    value={selectedInquiry}
                    onValueChange={(value) => {
                      setSelectedInquiry(value);
                      setValue('inquiryType', value as any);
                    }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {inquiryTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedInquiry === type.value;
                      return (
                        <div key={type.value} className="relative">
                          <RadioGroupItem
                            value={type.value}
                            id={type.value}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={type.value}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className={`p-2 rounded-full ${
                              isSelected ? 'bg-primary/20' : 'bg-muted'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                isSelected ? 'text-primary' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <span className="text-sm font-medium text-center">
                              {type.label}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  {errors.inquiryType && (
                    <p className="text-sm text-destructive">{errors.inquiryType.message}</p>
                  )}
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register('fullName')}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your Company"
                    {...register('company')}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    {...register('phone')}
                  />
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    {...register('subject')}
                    className={errors.subject ? 'border-destructive' : ''}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    {...register('message')}
                    className={errors.message ? 'border-destructive' : ''}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </Card>

            {/* Right Column - Contact Information */}
            <div className="space-y-6">
              {/* Headquarters */}
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Headquarters</h3>
                    <p className="text-muted-foreground">
                      FormsEdge HQ<br />
                      {companySettings.address_line1}<br />
                      {companySettings.address_line2}<br />
                      {companySettings.city_state_zip}<br />
                      {companySettings.country}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Phone */}
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Phone</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p>Sales: <span className="text-foreground">{companySettings.sales_phone}</span></p>
                      <p>Support: <span className="text-foreground">{companySettings.support_phone}</span></p>
                      <p>24/7 Emergency: <span className="text-foreground">{companySettings.emergency_phone}</span></p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Email */}
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p><a href={`mailto:${companySettings.general_email}`} className="text-foreground hover:text-primary transition-colors">{companySettings.general_email}</a></p>
                      <p><a href={`mailto:${companySettings.sales_email}`} className="text-foreground hover:text-primary transition-colors">{companySettings.sales_email}</a></p>
                      <p><a href={`mailto:${companySettings.support_email}`} className="text-foreground hover:text-primary transition-colors">{companySettings.support_email}</a></p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Business Hours */}
              <Card className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="text-foreground">{companySettings.business_hours}</p>
                      <p className="text-foreground">Weekend Support Available</p>
                      <p className="text-foreground">Emergency Support: 24/7</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/docs">
                      <FileText className="h-4 w-4 mr-2" />
                      View Documentation
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      <Activity className="h-4 w-4 mr-2" />
                      Check System Status
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
