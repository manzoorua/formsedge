import TemplateManager from '@/components/admin/TemplateManager';

export default function AdminTemplates() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Templates</h1>
        <p className="text-muted-foreground">Manage form templates for users</p>
      </div>

      <TemplateManager />
    </div>
  );
}
