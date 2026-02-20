-- Create chatbot settings table for admin-controlled chatbot configuration
CREATE TABLE public.chatbot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for chatbot settings
CREATE POLICY "Admins can manage chatbot settings" 
ON public.chatbot_settings 
FOR ALL 
USING (check_is_admin(auth.uid()));

CREATE POLICY "Authenticated users can read active settings" 
ON public.chatbot_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chatbot_settings_updated_at
BEFORE UPDATE ON public.chatbot_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default chatbot configuration
INSERT INTO public.chatbot_settings (setting_key, setting_value, description) VALUES
('chatbot_enabled', '{"enabled": false}', 'Enable or disable the chatbot globally'),
('chatbot_config', '{
  "widgetId": "widget_21c9e3279b854b779f7d6ee1f3de33f2",
  "position": {"x": 20, "y": 20},
  "initialState": "closed",
  "theme": {
    "primaryColor": "hsl(262 83% 58%)",
    "borderRadius": "12px",
    "zIndex": 9999
  }
}', 'Chatbot widget configuration settings');