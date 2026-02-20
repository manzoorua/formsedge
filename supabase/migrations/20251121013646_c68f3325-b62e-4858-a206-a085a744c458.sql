-- Webhook delivery logging for audit and retry management
CREATE TABLE IF NOT EXISTS public.webhook_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.form_integrations(id) ON DELETE CASCADE,
  response_id uuid NULL REFERENCES public.form_responses(id) ON DELETE SET NULL,
  event_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'form_response',
  status text NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  attempt int NOT NULL DEFAULT 1,
  url text NOT NULL,
  http_status int NULL,
  error_message text NULL,
  request_body jsonb NULL,
  response_body text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_webhook_logs_form_id ON public.webhook_delivery_logs(form_id);
CREATE INDEX idx_webhook_logs_integration_id ON public.webhook_delivery_logs(integration_id);
CREATE INDEX idx_webhook_logs_response_id ON public.webhook_delivery_logs(response_id);
CREATE INDEX idx_webhook_logs_status ON public.webhook_delivery_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_delivery_logs(created_at);

-- Enable RLS
ALTER TABLE public.webhook_delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Form owners can view logs for their forms
CREATE POLICY "Form owners can view webhook logs"
ON public.webhook_delivery_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.forms
    WHERE forms.id = webhook_delivery_logs.form_id
    AND (
      forms.owner_id = auth.uid()
      OR public.get_user_role_for_form(forms.id, auth.uid()) IS NOT NULL
    )
  )
);

-- Service role can manage all logs
CREATE POLICY "Service role can manage webhook logs"
ON public.webhook_delivery_logs
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Add comment
COMMENT ON TABLE public.webhook_delivery_logs IS 'Tracks webhook delivery attempts, status, and errors for auditing and retry logic';