import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// RESEND_API_KEY fallback check
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.warn("RESEND_API_KEY not configured - email notifications will be disabled");
}
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface ContactFormRequest {
  inquiry_type: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
}

interface CompanySettings {
  general_email: string | null;
  sales_email: string | null;
  support_email: string | null;
}

interface AdminUser {
  user_id: string;
  role: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ContactFormRequest = await req.json();
    console.log("Received contact form submission:", { 
      inquiry_type: body.inquiry_type, 
      email: body.email,
      subject: body.subject 
    });

    // Validate required fields
    if (!body.inquiry_type || !body.full_name || !body.email || !body.subject || !body.message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate inquiry_type
    const validInquiryTypes = ['general', 'sales', 'support', 'partnership'];
    if (!validInquiryTypes.includes(body.inquiry_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid inquiry type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert contact submission
    const { data: submission, error: submissionError } = await supabase
      .from("contact_submissions")
      .insert({
        inquiry_type: body.inquiry_type,
        full_name: body.full_name.trim(),
        email: body.email.trim().toLowerCase(),
        company: body.company?.trim() || null,
        phone: body.phone?.trim() || null,
        subject: body.subject.trim(),
        message: body.message.trim(),
        status: 'new',
        priority: body.inquiry_type === 'support' ? 'high' : 'medium'
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error inserting submission:", submissionError);
      return new Response(
        JSON.stringify({ error: "Failed to submit form" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Submission created:", submission.id);

    // Role-based notification distribution
    // Determine target roles based on inquiry type
    const targetRoles = body.inquiry_type === 'support' 
      ? ['system_admin', 'support', 'admin']
      : ['system_admin', 'admin'];

    // Fetch admins with matching roles
    const { data: targetAdmins, error: adminsError } = await supabase
      .from("admin_users")
      .select("user_id, role")
      .in('role', targetRoles);

    if (adminsError) {
      console.error("Error fetching admin users:", adminsError);
    }

    // Create individual notifications for each matching admin
    const notificationPromises: Promise<any>[] = [];
    
    if (targetAdmins && targetAdmins.length > 0) {
      console.log(`Creating notifications for ${targetAdmins.length} admin(s) with roles:`, targetRoles);
      
      for (const admin of targetAdmins) {
        const notificationPromise = supabase
          .from("admin_notifications")
          .insert({
            admin_id: admin.user_id,
            type: 'contact_submission',
            title: `New ${body.inquiry_type} inquiry`,
            message: `${body.full_name} submitted a ${body.inquiry_type} inquiry: ${body.subject}`,
            metadata: {
              submission_id: submission.id,
              inquiry_type: body.inquiry_type,
              email: body.email,
              priority: body.inquiry_type === 'support' ? 'high' : 'medium'
            }
          });
        notificationPromises.push(notificationPromise);
      }
      
      // Wait for all notifications to be created
      const results = await Promise.allSettled(notificationPromises);
      const failedCount = results.filter(r => r.status === 'rejected').length;
      if (failedCount > 0) {
        console.warn(`Failed to create ${failedCount} notification(s)`);
      }
    } else {
      // Fallback: create one notification visible to all admins if no specific admins found
      console.log("No matching admin users found, creating global notification");
      const { error: notificationError } = await supabase
        .from("admin_notifications")
        .insert({
          admin_id: null,
          type: 'contact_submission',
          title: `New ${body.inquiry_type} inquiry`,
          message: `${body.full_name} submitted a ${body.inquiry_type} inquiry: ${body.subject}`,
          metadata: {
            submission_id: submission.id,
            inquiry_type: body.inquiry_type,
            email: body.email,
            priority: body.inquiry_type === 'support' ? 'high' : 'medium'
          }
        });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    }

    // Send email notification (only if Resend is configured)
    if (resend) {
      try {
        // Fetch company settings to get the appropriate admin email
        const { data: companySettings } = await supabase
          .from("company_settings")
          .select("general_email, sales_email, support_email")
          .limit(1)
          .single();

        // Determine recipient email based on inquiry type
        let recipientEmail = "info@FormsEdge.com"; // fallback
        if (companySettings) {
          switch (body.inquiry_type) {
            case 'sales':
              recipientEmail = companySettings.sales_email || recipientEmail;
              break;
            case 'support':
              recipientEmail = companySettings.support_email || recipientEmail;
              break;
            default:
              recipientEmail = companySettings.general_email || recipientEmail;
          }
        }

        const inquiryTypeLabel = body.inquiry_type.charAt(0).toUpperCase() + body.inquiry_type.slice(1);
        const priorityLabel = body.inquiry_type === 'support' ? 'High' : 'Medium';
        
        // Get APP_URL for admin panel link
        const appUrl = Deno.env.get("APP_URL") || "https://formsedge.com";
        const adminPanelLink = `${appUrl}/admin/contact-submissions?highlight=${submission.id}`;
        const replyLink = `mailto:${body.email}?subject=Re: ${encodeURIComponent(body.subject)}`;
        
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                  <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500;">${inquiryTypeLabel} Inquiry</span>
                  <span style="background: ${body.inquiry_type === 'support' ? '#fee2e2' : '#fef3c7'}; color: ${body.inquiry_type === 'support' ? '#dc2626' : '#d97706'}; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 500;">Priority: ${priorityLabel}</span>
                </div>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 100px;">From:</td>
                    <td style="padding: 8px 0; font-weight: 500;">${body.full_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${body.email}" style="color: #3b82f6; text-decoration: none;">${body.email}</a></td>
                  </tr>
                  ${body.company ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Company:</td>
                    <td style="padding: 8px 0;">${body.company}</td>
                  </tr>
                  ` : ''}
                  ${body.phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b;">Phone:</td>
                    <td style="padding: 8px 0;"><a href="tel:${body.phone}" style="color: #3b82f6; text-decoration: none;">${body.phone}</a></td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 16px;">Subject</h3>
                <p style="margin: 0 0 20px 0; font-weight: 500;">${body.subject}</p>
                
                <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 16px;">Message</h3>
                <div style="background: #f8fafc; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${body.message}</div>
              </div>
              
              <!-- Quick Action Buttons -->
              <div style="text-align: center; padding: 10px 0;">
                <a href="${adminPanelLink}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 5px; font-weight: 500;">
                  View in Admin Panel
                </a>
                <a href="${replyLink}" style="background: #64748b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 5px; font-weight: 500;">
                  Reply to ${body.full_name}
                </a>
              </div>
            </div>
            
            <div style="background: #1e293b; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                Submission ID: ${submission.id}
              </p>
            </div>
          </body>
          </html>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "FormsEdge Contact <onboarding@resend.dev>",
          to: [recipientEmail],
          subject: `[FormsEdge] New ${inquiryTypeLabel} Inquiry: ${body.subject}`,
          html: emailHtml,
          reply_to: body.email,
        });

        if (emailError) {
          console.error("Error sending email notification:", emailError);
          // Don't fail the request - email is secondary
        } else {
          console.log("Email notification sent successfully to:", recipientEmail);
        }
      } catch (emailError) {
        console.error("Exception sending email:", emailError);
        // Don't fail the request - email is secondary
      }
    } else {
      console.log("Email notifications disabled - RESEND_API_KEY not configured");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your message has been submitted successfully!",
        submission_id: submission.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in submit-contact-form:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
