import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsFeedback from "@/components/docs/DocsFeedback";
import { Users, Shield, Mail, CheckCircle, Crown, UserPlus } from "lucide-react";

const TeamCollaborationGuide = () => {
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
                  { label: "Organization", href: "/docs/team-collaboration" },
                  { label: "Team Collaboration", href: "/docs/team-collaboration" }
                ]} 
              />

              <article className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold mb-4 flex items-center">
                  <Users className="w-10 h-10 mr-4 text-primary" />
                  Team Collaboration Guide
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8">
                  Learn how to invite team members, manage roles, and collaborate on forms together.
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Team collaboration features require a Pro or Enterprise subscription. 
                    Free tier users cannot invite team members. <a href="/docs/billing" className="text-primary hover:underline">Learn more about plans</a>.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Inviting Team Members</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">How to Invite</h3>
                <ol className="space-y-2 mb-6">
                  <li>Open any form in the Form Builder</li>
                  <li>Click the <strong>"Invite"</strong> button in the toolbar</li>
                  <li>Enter the team member's email address</li>
                  <li>Select their role (Viewer, Editor, or Admin)</li>
                  <li>Click <strong>"Send Invitation"</strong></li>
                </ol>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <h4 className="font-bold mb-3">Invitation Email</h4>
                  <p className="text-sm text-muted-foreground">
                    The invited team member will receive an email with a secure link to accept the invitation. 
                    Links expire after 7 days. If expired, simply send a new invitation.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Team Roles & Permissions</h2>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Shield className="w-5 h-5 text-muted-foreground mr-2" />
                      <h3 className="font-bold">Viewer</h3>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ View form structure</li>
                      <li>✓ View responses</li>
                      <li>✓ Export response data</li>
                      <li>✗ Edit form fields</li>
                      <li>✗ Manage integrations</li>
                      <li>✗ Invite team members</li>
                    </ul>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <UserPlus className="w-5 h-5 text-primary mr-2" />
                      <h3 className="font-bold">Editor</h3>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ All Viewer permissions</li>
                      <li>✓ Edit form fields</li>
                      <li>✓ Change form settings</li>
                      <li>✓ Manage integrations</li>
                      <li>✓ Publish/unpublish form</li>
                      <li>✗ Invite team members</li>
                    </ul>
                  </div>
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                      <h3 className="font-bold">Admin</h3>
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ All Editor permissions</li>
                      <li>✓ Invite team members</li>
                      <li>✓ Remove team members</li>
                      <li>✓ Change member roles</li>
                      <li>✓ Transfer form ownership</li>
                      <li>✓ Delete form</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Subscription Requirements</h2>
                
                <div className="bg-card border rounded-lg overflow-hidden mb-8">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Plan</th>
                        <th className="px-4 py-3 text-left font-semibold">Team Members</th>
                        <th className="px-4 py-3 text-left font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-3 font-medium">Free</td>
                        <td className="px-4 py-3 text-muted-foreground">0 members</td>
                        <td className="px-4 py-3 text-muted-foreground">Cannot invite team members</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3 font-medium">Pro</td>
                        <td className="px-4 py-3 text-primary font-semibold">Up to 3 members</td>
                        <td className="px-4 py-3 text-muted-foreground">Per organization</td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3 font-medium">Enterprise</td>
                        <td className="px-4 py-3 text-primary font-semibold">Up to 10 members</td>
                        <td className="px-4 py-3 text-muted-foreground">Per organization</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Member limits include both active members AND pending invitations. 
                    If you've reached your limit, you'll need to revoke a pending invitation or remove an existing member before inviting someone new.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Accepting an Invitation</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">For Invited Users</h3>
                <ol className="space-y-2 mb-6">
                  <li><Mail className="w-4 h-4 inline mr-2" />Check your email for the invitation</li>
                  <li>Click the <strong>"Accept Invitation"</strong> link</li>
                  <li>If you don't have an account, you'll be prompted to create one</li>
                  <li>If you already have an account, log in with your credentials</li>
                  <li><CheckCircle className="w-4 h-4 inline mr-2 text-green-500" />You'll be redirected to the shared form</li>
                </ol>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                  <h4 className="font-bold text-yellow-800 mb-2">Email Address Must Match</h4>
                  <p className="text-sm text-yellow-800">
                    You must accept the invitation using the same email address it was sent to. 
                    If you want to use a different email, ask the inviter to send a new invitation to your preferred address.
                  </p>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Managing Team Access</h2>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Viewing Team Members</h3>
                <p className="mb-4">
                  Form owners and admins can view all team members:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Open the form in the Form Builder</li>
                  <li>Click the <strong>"Team"</strong> or <strong>"Share"</strong> button</li>
                  <li>View the list of current members and their roles</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Changing Roles</h3>
                <p className="mb-4">
                  Admins can change team member roles:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Open the team member list</li>
                  <li>Click on a member's current role</li>
                  <li>Select the new role from the dropdown</li>
                  <li>Changes take effect immediately</li>
                </ol>

                <h3 className="text-xl font-bold mt-8 mb-4">Removing Team Members</h3>
                <p className="mb-4">
                  Admins can remove team members:
                </p>
                <ol className="space-y-2 mb-6">
                  <li>Open the team member list</li>
                  <li>Click the remove/delete icon next to a member</li>
                  <li>Confirm the removal</li>
                  <li>The member immediately loses access to the form</li>
                </ol>

                <h2 className="text-2xl font-bold mt-12 mb-4">Real-time Collaboration</h2>
                <p className="mb-4">
                  When multiple team members are editing a form simultaneously:
                </p>
                <ul className="space-y-2 mb-6">
                  <li><strong>Presence indicators:</strong> See who else is viewing/editing the form</li>
                  <li><strong>Edit locking:</strong> Forms are temporarily locked when someone is editing to prevent conflicts</li>
                  <li><strong>Auto-sync:</strong> Changes sync automatically when the lock is released</li>
                </ul>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <h4 className="font-bold mb-3">Best Practices for Team Collaboration</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Communicate with your team about who's editing when</li>
                    <li>• Use the Viewer role for stakeholders who only need to see responses</li>
                    <li>• Assign Admin role sparingly—only to those who need to manage team access</li>
                    <li>• Regularly review and remove access for team members who no longer need it</li>
                  </ul>
                </div>

                <h2 className="text-2xl font-bold mt-12 mb-4">Troubleshooting</h2>
                
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-3">Invitation Not Received</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Check spam/junk folder</li>
                    <li>• Verify the email address was entered correctly</li>
                    <li>• Ask the inviter to resend the invitation</li>
                    <li>• Check if your email provider blocks automated emails</li>
                  </ul>
                </div>

                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="font-bold mb-3">Can't Accept Invitation</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Invitation may have expired (7-day limit)</li>
                    <li>• You must use the same email address the invitation was sent to</li>
                    <li>• Ask for a new invitation if the link doesn't work</li>
                  </ul>
                </div>

                <div className="bg-card border rounded-lg p-6 mb-8">
                  <h3 className="font-bold mb-3">Member Limit Reached</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Remove inactive members to free up slots</li>
                    <li>• Cancel pending invitations that haven't been accepted</li>
                    <li>• Upgrade to a higher plan for more team members</li>
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

export default TeamCollaborationGuide;
