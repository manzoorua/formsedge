import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { Settings, User, Shield, Building2, Trash2, Mail } from "lucide-react";

const AccountGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[250px,1fr] gap-12">
            <DocsSidebar />

            <div>
              <DocsBreadcrumb 
                items={[
                  { label: "Docs", href: "/docs" },
                  { label: "Account", href: "/docs/account" },
                  { label: "Account Settings", href: "/docs/account" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4 flex items-center">
                  <Settings className="w-10 h-10 mr-4 text-primary" />
                  Account Settings Guide
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Learn how to manage your FormsEdge account, profile, security settings, and organization membership.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Profile Management</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Updating Your Profile
                </h3>
                <p className="mb-4">
                  Access your profile settings to update personal information:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Click on your avatar/profile icon in the top-right corner</li>
                  <li>Select <strong>"Profile"</strong> or <strong>"Settings"</strong></li>
                  <li>Update your information and click <strong>"Save"</strong></li>
                </ol>

                <h4 className="font-bold mt-6 mb-3">Editable Profile Fields</h4>
                <ul className="space-y-2 mb-6">
                  <li><strong>First Name & Last Name:</strong> Your display name throughout FormsEdge</li>
                  <li><strong>Company Name:</strong> Optional, displayed in some contexts</li>
                  <li><strong>Avatar:</strong> Upload a profile picture (optional)</li>
                </ul>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <h4 className="font-bold mb-3">Email Address</h4>
                  <p className="text-sm text-muted-foreground">
                    Your email address is linked to your authentication account. 
                    To change your email, you'll need to create a new account with your preferred email 
                    and transfer your projects. Contact support if you need assistance.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Security Settings</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Password Management
                </h3>
                
                <h4 className="font-bold mt-6 mb-3">Changing Your Password</h4>
                <ol className="space-y-2 mb-6">
                  <li>Go to <strong>Profile Settings</strong></li>
                  <li>Find the <strong>Security</strong> section</li>
                  <li>Click <strong>"Change Password"</strong></li>
                  <li>Enter your current password</li>
                  <li>Enter and confirm your new password</li>
                  <li>Click <strong>"Update Password"</strong></li>
                </ol>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h4 className="font-bold text-blue-800 mb-2">Password Requirements</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Minimum 8 characters</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one lowercase letter</li>
                    <li>• At least one number</li>
                    <li>• Recommended: Include special characters</li>
                  </ul>
                </div>

                <h4 className="font-bold mt-6 mb-3">Forgot Password</h4>
                <ol className="space-y-2 mb-6">
                  <li>Go to the login page</li>
                  <li>Click <strong>"Forgot Password?"</strong></li>
                  <li>Enter your email address</li>
                  <li>Check your email for a reset link</li>
                  <li>Click the link and create a new password</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Session Management</h3>
                <p className="mb-4">
                  FormsEdge automatically manages your login sessions:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>• Sessions expire after extended periods of inactivity</li>
                  <li>• You can log out from all devices by changing your password</li>
                  <li>• Use the <strong>"Sign Out"</strong> button to end your current session</li>
                </ul>

                <h2 className="text-2xl font-bold mt-12 mb-4">Organization Membership</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Viewing Your Organizations
                </h3>
                <p className="mb-4">
                  If you're a member of one or more organizations:
                </p>
                <ul className="space-y-2 mb-6">
                  <li>• View all organizations you belong to in your profile</li>
                  <li>• See your role in each organization (Viewer, Editor, Admin)</li>
                  <li>• Access forms shared within each organization</li>
                </ul>

                <h3 className="text-xl font-bold mt-8 mb-4">Leaving an Organization</h3>
                <p className="mb-4">
                  To leave an organization:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Go to your organization settings</li>
                  <li>Find the organization you want to leave</li>
                  <li>Click <strong>"Leave Organization"</strong></li>
                  <li>Confirm your decision</li>
                </ol>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h4 className="font-bold text-yellow-800 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Organization owners cannot leave—they must transfer ownership first</li>
                    <li>• Leaving removes your access to all organization forms</li>
                    <li>• Your personal forms are not affected</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Notification Preferences</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Notifications
                </h3>
                <p className="mb-4">
                  Manage what emails you receive from FormsEdge:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Form Responses:</strong> Get notified when someone submits your form</li>
                  <li><strong>Team Invitations:</strong> Notifications about team collaboration</li>
                  <li><strong>Product Updates:</strong> News about new features and improvements</li>
                  <li><strong>Billing Alerts:</strong> Payment confirmations and subscription changes</li>
                </ul>

                <p className="mb-6">
                  Configure notifications per-form in the form settings, or manage global preferences in your account settings.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Account Deletion</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4 flex items-center">
                  <Trash2 className="w-5 h-5 mr-2 text-destructive" />
                  Deleting Your Account
                </h3>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-red-800 mb-2">Warning: This action is permanent</h4>
                  <p className="text-sm text-red-800">
                    Deleting your account will permanently remove:
                  </p>
                  <ul className="text-sm text-red-800 mt-2 space-y-1">
                    <li>• All your forms and form fields</li>
                    <li>• All collected responses and analytics data</li>
                    <li>• Your profile and account information</li>
                    <li>• All integrations and webhooks</li>
                    <li>• Organizations you own (members will lose access)</li>
                  </ul>
                </div>

                <h4 className="font-bold mt-6 mb-3">Before You Delete</h4>
                <ol className="space-y-2 mb-6">
                  <li><strong>Export your data:</strong> Download all responses you want to keep</li>
                  <li><strong>Transfer ownership:</strong> Transfer forms to other users if needed</li>
                  <li><strong>Cancel subscriptions:</strong> Ensure any paid subscriptions are cancelled</li>
                  <li><strong>Notify team members:</strong> Let collaborators know they'll lose access</li>
                </ol>

                <h4 className="font-bold mt-6 mb-3">How to Delete Your Account</h4>
                <ol className="space-y-2 mb-6">
                  <li>Go to <strong>Profile Settings</strong></li>
                  <li>Scroll to the <strong>Danger Zone</strong> section</li>
                  <li>Click <strong>"Delete Account"</strong></li>
                  <li>Type your email to confirm</li>
                  <li>Click <strong>"Permanently Delete Account"</strong></li>
                </ol>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <h4 className="font-bold mb-3">Need Help Instead?</h4>
                  <p className="text-sm text-muted-foreground">
                    If you're having issues with FormsEdge, our support team is here to help! 
                    Contact us at support@formsedge.com before deleting your account—we may be able to resolve your concerns.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Data & Privacy</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Your Data Rights</h3>
                <p className="mb-4">
                  FormsEdge respects your data privacy. You have the right to:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Access:</strong> View all data we have about you</li>
                  <li><strong>Export:</strong> Download your data in standard formats</li>
                  <li><strong>Correct:</strong> Update inaccurate information</li>
                  <li><strong>Delete:</strong> Request removal of your personal data</li>
                </ul>

                <p className="mb-6">
                  For data requests beyond what's available in the dashboard, contact privacy@formsedge.com.
                </p>

                <h2 className="text-2xl font-bold mt-12 mb-4">Troubleshooting</h2>
                
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-3">Can't Access Account</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Use the "Forgot Password" feature to reset</li>
                    <li>• Check if you're using the correct email address</li>
                    <li>• Clear browser cache and cookies</li>
                    <li>• Try a different browser or device</li>
                    <li>• Contact support if issues persist</li>
                  </ul>
                </div>

                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-3">Profile Changes Not Saving</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Check your internet connection</li>
                    <li>• Ensure all required fields are filled</li>
                    <li>• Look for validation error messages</li>
                    <li>• Refresh the page and try again</li>
                  </ul>
                </div>

                <div className="bg-card border rounded-lg p-6 mb-8">
                  <h3 className="font-bold mb-3">Unexpected Sign Out</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Sessions may expire for security after inactivity</li>
                    <li>• Check if you signed out from another device</li>
                    <li>• Browser privacy settings may clear session cookies</li>
                    <li>• Enable "Remember me" when signing in</li>
                  </ul>
                </div>
              </article>

              <DocsFeedback />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccountGuide;
