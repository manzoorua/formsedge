-- Insert sample form templates for the gallery
INSERT INTO public.form_templates (title, description, category, template_data, is_featured, tags) VALUES
('Contact Form', 'Simple contact form for website inquiries', 'contact', '{
  "form": {
    "title": "Contact Us",
    "description": "Get in touch with our team",
    "primary_color": "#3b82f6"
  },
  "fields": [
    {"type": "text", "label": "Full Name", "required": true, "order_index": 0},
    {"type": "email", "label": "Email Address", "required": true, "order_index": 1},
    {"type": "text", "label": "Subject", "required": true, "order_index": 2},
    {"type": "textarea", "label": "Message", "required": true, "order_index": 3}
  ]
}', true, '["contact", "business", "website"]'),

('Customer Feedback', 'Collect valuable customer feedback and ratings', 'survey', '{
  "form": {
    "title": "Customer Feedback Survey",
    "description": "Help us improve our services",
    "primary_color": "#8b5cf6"
  },
  "fields": [
    {"type": "rating", "label": "Overall Satisfaction", "required": true, "order_index": 0},
    {"type": "radio", "label": "How likely are you to recommend us?", "options": ["Very Likely", "Likely", "Neutral", "Unlikely", "Very Unlikely"], "required": true, "order_index": 1},
    {"type": "textarea", "label": "What can we improve?", "order_index": 2},
    {"type": "checkbox", "label": "Which services did you use?", "options": ["Product A", "Product B", "Support", "Consulting"], "order_index": 3}
  ]
}', true, '["feedback", "survey", "rating"]'),

('Event Registration', 'Registration form for events and workshops', 'registration', '{
  "form": {
    "title": "Event Registration",
    "description": "Register for our upcoming workshop",
    "primary_color": "#059669"
  },
  "fields": [
    {"type": "text", "label": "First Name", "required": true, "order_index": 0},
    {"type": "text", "label": "Last Name", "required": true, "order_index": 1},
    {"type": "email", "label": "Email", "required": true, "order_index": 2},
    {"type": "phone", "label": "Phone Number", "order_index": 3},
    {"type": "select", "label": "Ticket Type", "options": ["Early Bird", "Regular", "VIP"], "required": true, "order_index": 4},
    {"type": "textarea", "label": "Dietary Requirements", "order_index": 5}
  ]
}', true, '["event", "registration", "workshop"]');