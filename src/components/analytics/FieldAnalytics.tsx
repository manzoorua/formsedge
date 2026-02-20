import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FieldAnalyticsProps {
  formId: string;
}

export const FieldAnalytics = ({ formId }: FieldAnalyticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field-Level Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Field analytics will be available once sufficient data is collected
        </div>
      </CardContent>
    </Card>
  );
};