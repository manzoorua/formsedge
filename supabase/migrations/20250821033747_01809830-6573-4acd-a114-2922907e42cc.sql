-- Insert sample form templates
INSERT INTO form_templates (title, description, category, is_featured, tags, template_data) VALUES
(
  'Contact Form',
  'A simple contact form to collect inquiries from your website visitors.',
  'Business',
  true,
  ARRAY['contact', 'business', 'support'],
  '{
    "fields": [
      {
        "type": "text",
        "label": "Full Name",
        "placeholder": "Enter your full name",
        "required": true,
        "order_index": 0
      },
      {
        "type": "email",
        "label": "Email Address",
        "placeholder": "Enter your email",
        "required": true,
        "order_index": 1
      },
      {
        "type": "text",
        "label": "Subject",
        "placeholder": "What is this regarding?",
        "required": true,
        "order_index": 2
      },
      {
        "type": "textarea",
        "label": "Message",
        "placeholder": "Enter your message here...",
        "required": true,
        "order_index": 3
      }
    ]
  }'
),
(
  'Customer Feedback Survey',
  'Gather valuable feedback from your customers about their experience.',
  'Survey',
  true,
  ARRAY['feedback', 'survey', 'customer'],
  '{
    "fields": [
      {
        "type": "radio",
        "label": "How satisfied are you with our service?",
        "required": true,
        "order_index": 0,
        "options": [
          {"label": "Very Satisfied", "value": "very_satisfied"},
          {"label": "Satisfied", "value": "satisfied"},
          {"label": "Neutral", "value": "neutral"},
          {"label": "Dissatisfied", "value": "dissatisfied"},
          {"label": "Very Dissatisfied", "value": "very_dissatisfied"}
        ]
      },
      {
        "type": "select",
        "label": "Which department did you interact with?",
        "required": true,
        "order_index": 1,
        "options": [
          {"label": "Sales", "value": "sales"},
          {"label": "Support", "value": "support"},
          {"label": "Billing", "value": "billing"},
          {"label": "Technical", "value": "technical"}
        ]
      },
      {
        "type": "textarea",
        "label": "Additional Comments",
        "placeholder": "Tell us more about your experience...",
        "required": false,
        "order_index": 2
      }
    ]
  }'
),
(
  'Event Registration',
  'Collect attendee information for events, workshops, or conferences.',
  'Registration',
  true,
  ARRAY['event', 'registration', 'attendee'],
  '{
    "fields": [
      {
        "type": "text",
        "label": "First Name",
        "placeholder": "Enter your first name",
        "required": true,
        "order_index": 0
      },
      {
        "type": "text",
        "label": "Last Name",
        "placeholder": "Enter your last name",
        "required": true,
        "order_index": 1
      },
      {
        "type": "email",
        "label": "Email Address",
        "placeholder": "Enter your email",
        "required": true,
        "order_index": 2
      },
      {
        "type": "text",
        "label": "Company/Organization",
        "placeholder": "Enter your company name",
        "required": false,
        "order_index": 3
      },
      {
        "type": "select",
        "label": "Ticket Type",
        "required": true,
        "order_index": 4,
        "options": [
          {"label": "General Admission", "value": "general"},
          {"label": "VIP", "value": "vip"},
          {"label": "Student", "value": "student"},
          {"label": "Speaker", "value": "speaker"}
        ]
      },
      {
        "type": "checkbox",
        "label": "Dietary Preferences",
        "required": false,
        "order_index": 5,
        "options": [
          {"label": "Vegetarian", "value": "vegetarian"},
          {"label": "Vegan", "value": "vegan"},
          {"label": "Gluten-Free", "value": "gluten_free"},
          {"label": "No Restrictions", "value": "none"}
        ]
      }
    ]
  }'
),
(
  'Job Application Form',
  'Streamline your hiring process with this comprehensive job application form.',
  'HR',
  false,
  ARRAY['job', 'application', 'hiring', 'hr'],
  '{
    "fields": [
      {
        "type": "text",
        "label": "Full Name",
        "placeholder": "Enter your full name",
        "required": true,
        "order_index": 0
      },
      {
        "type": "email",
        "label": "Email Address",
        "placeholder": "Enter your email",
        "required": true,
        "order_index": 1
      },
      {
        "type": "tel",
        "label": "Phone Number",
        "placeholder": "Enter your phone number",
        "required": true,
        "order_index": 2
      },
      {
        "type": "select",
        "label": "Position Applied For",
        "required": true,
        "order_index": 3,
        "options": [
          {"label": "Software Engineer", "value": "software_engineer"},
          {"label": "Product Manager", "value": "product_manager"},
          {"label": "Designer", "value": "designer"},
          {"label": "Marketing Specialist", "value": "marketing"},
          {"label": "Sales Representative", "value": "sales"}
        ]
      },
      {
        "type": "file",
        "label": "Resume/CV",
        "required": true,
        "order_index": 4
      },
      {
        "type": "textarea",
        "label": "Cover Letter",
        "placeholder": "Tell us why you are interested in this position...",
        "required": true,
        "order_index": 5
      }
    ]
  }'
),
(
  'Product Order Form',
  'Simple order form for products with quantity and customer information.',
  'E-commerce',
  false,
  ARRAY['order', 'product', 'ecommerce', 'sales'],
  '{
    "fields": [
      {
        "type": "text",
        "label": "Customer Name",
        "placeholder": "Enter your full name",
        "required": true,
        "order_index": 0
      },
      {
        "type": "email",
        "label": "Email Address",
        "placeholder": "Enter your email",
        "required": true,
        "order_index": 1
      },
      {
        "type": "select",
        "label": "Product",
        "required": true,
        "order_index": 2,
        "options": [
          {"label": "Basic Plan - $29/month", "value": "basic"},
          {"label": "Pro Plan - $59/month", "value": "pro"},
          {"label": "Enterprise Plan - $99/month", "value": "enterprise"}
        ]
      },
      {
        "type": "number",
        "label": "Quantity",
        "placeholder": "Enter quantity",
        "required": true,
        "order_index": 3,
        "validation_rules": {
          "min": 1,
          "max": 100
        }
      },
      {
        "type": "textarea",
        "label": "Special Instructions",
        "placeholder": "Any special requirements or notes...",
        "required": false,
        "order_index": 4
      }
    ]
  }'
),
(
  'Newsletter Signup',
  'Collect email subscribers for your newsletter or marketing campaigns.',
  'Marketing',
  true,
  ARRAY['newsletter', 'email', 'marketing', 'subscription'],
  '{
    "fields": [
      {
        "type": "text",
        "label": "First Name",
        "placeholder": "Enter your first name",
        "required": true,
        "order_index": 0
      },
      {
        "type": "email",
        "label": "Email Address",
        "placeholder": "Enter your email address",
        "required": true,
        "order_index": 1
      },
      {
        "type": "checkbox",
        "label": "Interests",
        "required": false,
        "order_index": 2,
        "options": [
          {"label": "Product Updates", "value": "product"},
          {"label": "Industry News", "value": "news"},
          {"label": "Special Offers", "value": "offers"},
          {"label": "Company Updates", "value": "company"}
        ]
      },
      {
        "type": "checkbox",
        "label": "Communication Preferences",
        "required": true,
        "order_index": 3,
        "options": [
          {"label": "I agree to receive marketing emails", "value": "marketing_consent"}
        ]
      }
    ]
  }'
);