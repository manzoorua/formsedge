-- Add 5 Recall-enabled form templates showcasing the Recall Information feature

-- Template 1: Personalized Customer Survey
INSERT INTO form_templates (
  title, 
  description, 
  category, 
  is_featured, 
  tags, 
  template_data
) VALUES (
  'Personalized Customer Survey',
  'Collect customer feedback with personalized questions that reference previous answers in real-time',
  'survey',
  true,
  ARRAY['recall', 'personalization', 'survey', 'feedback', 'customer-experience'],
  jsonb_build_object(
    'form', jsonb_build_object(
      'title', 'Customer Experience Survey',
      'description', 'Help us serve you better by sharing your experience',
      'primary_color', '#8b5cf6',
      'secondary_color', '#64748b',
      'thank_you_message', 'Thank you {{field:customer_name}}! We appreciate your feedback about {{field:product}}. Your insights will help us improve.'
    ),
    'fields', jsonb_build_array(
      jsonb_build_object(
        'type', 'html',
        'label', 'Welcome',
        'description', '<p class="text-lg">We''d love to hear from you! This survey will take about 3 minutes.</p>',
        'order_index', 0
      ),
      jsonb_build_object(
        'type', 'text',
        'label', 'What''s your name?',
        'ref', 'customer_name',
        'placeholder', 'Enter your name',
        'required', true,
        'order_index', 1
      ),
      jsonb_build_object(
        'type', 'text',
        'label', 'Thanks {{field:customer_name}}! What company do you work for?',
        'ref', 'company_name',
        'placeholder', 'Enter company name',
        'description', 'This helps us understand your business context',
        'required', false,
        'order_index', 2
      ),
      jsonb_build_object(
        'type', 'select',
        'label', 'Which of our products are you using?',
        'ref', 'product',
        'options', jsonb_build_array(
          'Pro Plan',
          'Business Plan',
          'Enterprise Plan',
          'Free Trial'
        ),
        'required', true,
        'order_index', 3
      ),
      jsonb_build_object(
        'type', 'radio',
        'label', 'How satisfied are you with {{field:product}}?',
        'ref', 'satisfaction',
        'options', jsonb_build_array(
          'Very Satisfied (5)',
          'Satisfied (4)',
          'Neutral (3)',
          'Dissatisfied (2)',
          'Very Dissatisfied (1)'
        ),
        'required', true,
        'order_index', 4
      ),
      jsonb_build_object(
        'type', 'textarea',
        'label', 'What can we do to improve {{field:product}} for {{field:company_name}}?',
        'placeholder', 'Share your thoughts...',
        'description', 'Your feedback helps us serve you better',
        'required', false,
        'order_index', 5
      )
    )
  )
);

-- Template 2: Multi-Step User Registration
INSERT INTO form_templates (
  title, 
  description, 
  category, 
  is_featured, 
  tags, 
  template_data
) VALUES (
  'Multi-Step User Registration',
  'Smart registration form with recall across pages and URL parameter tracking for referral attribution',
  'registration',
  true,
  ARRAY['recall', 'multi-step', 'registration', 'onboarding', 'personalization'],
  jsonb_build_object(
    'form', jsonb_build_object(
      'title', 'Create Your Account',
      'description', 'Join thousands of users - setup takes less than 2 minutes',
      'primary_color', '#3b82f6',
      'secondary_color', '#64748b',
      'thank_you_message', 'Welcome aboard, {{field:first_name}}! Your account {{field:username}} is ready. Check your email at {{field:email}} for next steps.',
      'redirect_url', 'https://app.example.com/onboarding?name={{field:first_name}}&email={{field:email}}&source={{param:source}}'
    ),
    'url_params_config', jsonb_build_array(
      jsonb_build_object('name', 'source', 'label', 'Traffic Source', 'type', 'text'),
      jsonb_build_object('name', 'referrer', 'label', 'Referrer Name', 'type', 'text')
    ),
    'fields', jsonb_build_array(
      jsonb_build_object(
        'type', 'html',
        'label', 'Welcome',
        'description', '<p class="text-lg">Welcome! Let''s get you set up.</p>',
        'order_index', 0
      ),
      jsonb_build_object(
        'type', 'text',
        'label', 'First Name',
        'ref', 'first_name',
        'required', true,
        'order_index', 1
      ),
      jsonb_build_object(
        'type', 'text',
        'label', 'Last Name',
        'ref', 'last_name',
        'required', true,
        'order_index', 2
      ),
      jsonb_build_object(
        'type', 'email',
        'label', 'Email Address',
        'ref', 'email',
        'required', true,
        'order_index', 3
      ),
      jsonb_build_object(
        'type', 'pagebreak',
        'label', 'Page Break',
        'order_index', 4
      ),
      jsonb_build_object(
        'type', 'html',
        'label', 'Account Details',
        'description', '<p class="text-lg">Great to meet you, {{field:first_name}}! Now let''s set up your account.</p>',
        'order_index', 5
      ),
      jsonb_build_object(
        'type', 'text',
        'label', 'Choose a Username',
        'ref', 'username',
        'placeholder', 'e.g., {{field:first_name}}_{{field:last_name}}',
        'required', true,
        'order_index', 6
      ),
      jsonb_build_object(
        'type', 'radio',
        'label', 'What brings you here, {{field:first_name}}?',
        'ref', 'account_type',
        'options', jsonb_build_array('Personal', 'Business', 'Education'),
        'required', true,
        'order_index', 7
      ),
      jsonb_build_object(
        'type', 'pagebreak',
        'label', 'Page Break',
        'order_index', 8
      ),
      jsonb_build_object(
        'type', 'html',
        'label', 'Preferences',
        'description', '<p class="text-lg">Almost done, {{field:first_name}}! Just a few preferences.</p>',
        'order_index', 9
      ),
      jsonb_build_object(
        'type', 'select',
        'label', 'What''s your role?',
        'ref', 'role',
        'options', jsonb_build_array('Developer', 'Designer', 'Product Manager', 'Marketing', 'Other'),
        'required', true,
        'order_index', 10
      ),
      jsonb_build_object(
        'type', 'checkbox',
        'label', 'Email Preferences',
        'options', jsonb_build_array(
          'Send updates to {{field:email}}',
          'Send weekly tips for developers'
        ),
        'order_index', 11
      )
    )
  )
);

-- Template 3: Lead Qualification Form
INSERT INTO form_templates (
  title, 
  description, 
  category, 
  is_featured, 
  tags, 
  template_data
) VALUES (
  'Lead Qualification Form',
  'Sales qualification form with dynamic scoring and campaign attribution using URL parameters',
  'business',
  true,
  ARRAY['recall', 'lead-qualification', 'sales', 'crm', 'personalization'],
  jsonb_build_object(
    'form', jsonb_build_object(
      'title', 'Let''s Talk About Your Needs',
      'description', 'Tell us about your company and we''ll match you with the right solution',
      'primary_color', '#10b981',
      'secondary_color', '#64748b',
      'thank_you_message', 'Thanks {{field:contact_name}}! We''ve received your inquiry for {{field:company}}. Our team will review your requirements and reach out to {{field:email}} within 24 hours.'
    ),
    'url_params_config', jsonb_build_array(
      jsonb_build_object('name', 'campaign', 'label', 'Campaign ID', 'type', 'text'),
      jsonb_build_object('name', 'ad_id', 'label', 'Ad ID', 'type', 'text')
    ),
    'fields', jsonb_build_array(
      jsonb_build_object(
        'type', 'text',
        'label', 'What''s your company name?',
        'ref', 'company',
        'required', true,
        'order_index', 0
      ),
      jsonb_build_object(
        'type', 'text',
        'label', 'And your name?',
        'ref', 'contact_name',
        'required', true,
        'order_index', 1
      ),
      jsonb_build_object(
        'type', 'email',
        'label', 'Best email to reach you, {{field:contact_name}}?',
        'ref', 'email',
        'required', true,
        'order_index', 2
      ),
      jsonb_build_object(
        'type', 'radio',
        'label', 'How many employees at {{field:company}}?',
        'ref', 'company_size',
        'options', jsonb_build_array(
          '1-10 employees',
          '11-50 employees',
          '51-200 employees',
          '200+ employees'
        ),
        'required', true,
        'order_index', 3
      ),
      jsonb_build_object(
        'type', 'select',
        'label', 'What''s {{field:company}}''s approximate monthly budget for this solution?',
        'ref', 'budget',
        'options', jsonb_build_array('< $1K', '$1K-$5K', '$5K-$10K', '$10K-$50K', '$50K+'),
        'required', true,
        'order_index', 4
      ),
      jsonb_build_object(
        'type', 'radio',
        'label', 'When is {{field:company}} looking to implement?',
        'ref', 'timeline',
        'options', jsonb_build_array(
          'Immediately',
          'Within 1 month',
          '1-3 months',
          '3-6 months',
          'Just researching'
        ),
        'required', true,
        'order_index', 5
      ),
      jsonb_build_object(
        'type', 'textarea',
        'label', 'What specific challenges is {{field:company}} trying to solve?',
        'placeholder', 'Tell us more about your needs...',
        'required', true,
        'order_index', 6
      )
    )
  )
);

-- Template 4: Event Check-In Form
INSERT INTO form_templates (
  title, 
  description, 
  category, 
  is_featured, 
  tags, 
  template_data
) VALUES (
  'Event Check-In Form',
  'QR code-ready event registration with pre-filled attendee data from URL parameters',
  'events',
  true,
  ARRAY['recall', 'event', 'check-in', 'qr-code', 'personalization'],
  jsonb_build_object(
    'form', jsonb_build_object(
      'title', 'Event Check-In',
      'description', 'Complete your check-in',
      'primary_color', '#f59e0b',
      'secondary_color', '#64748b',
      'thank_you_message', 'You''re all set, {{field:name}}! Your badge is ready at the registration desk. See you at the sessions you selected!'
    ),
    'url_params_config', jsonb_build_array(
      jsonb_build_object('name', 'ticket_id', 'label', 'Ticket ID', 'type', 'text'),
      jsonb_build_object('name', 'attendee_name', 'label', 'Attendee Name', 'type', 'text'),
      jsonb_build_object('name', 'event_name', 'label', 'Event Name', 'type', 'text')
    ),
    'fields', jsonb_build_array(
      jsonb_build_object(
        'type', 'html',
        'label', 'Welcome',
        'description', '<p class="text-lg">Welcome to the event!</p>',
        'order_index', 0
      ),
      jsonb_build_object(
        'type', 'text',
        'label', 'Please confirm your name',
        'ref', 'name',
        'placeholder', '{{param:attendee_name}}',
        'description', 'Pre-filled from your ticket: {{param:ticket_id}}',
        'required', true,
        'order_index', 1
      ),
      jsonb_build_object(
        'type', 'email',
        'label', 'Email Address',
        'ref', 'email',
        'required', true,
        'order_index', 2
      ),
      jsonb_build_object(
        'type', 'radio',
        'label', 'Is this your first time at this event?',
        'ref', 'first_time',
        'options', jsonb_build_array('Yes', 'No'),
        'required', true,
        'order_index', 3
      ),
      jsonb_build_object(
        'type', 'checkbox',
        'label', 'Which sessions are you interested in, {{field:name}}?',
        'options', jsonb_build_array(
          'Keynote',
          'Workshop A',
          'Workshop B',
          'Panel Discussion',
          'Networking'
        ),
        'required', false,
        'order_index', 4
      ),
      jsonb_build_object(
        'type', 'select',
        'label', 'Any dietary restrictions?',
        'options', jsonb_build_array(
          'None',
          'Vegetarian',
          'Vegan',
          'Gluten-Free',
          'Halal',
          'Kosher'
        ),
        'required', false,
        'order_index', 5
      )
    )
  )
);

-- Template 5: Product Feedback with NPS
INSERT INTO form_templates (
  title, 
  description, 
  category, 
  is_featured, 
  tags, 
  template_data
) VALUES (
  'Product Feedback with NPS',
  'Net Promoter Score survey with conditional follow-ups based on customer ratings',
  'feedback',
  true,
  ARRAY['recall', 'nps', 'feedback', 'product', 'customer-success'],
  jsonb_build_object(
    'form', jsonb_build_object(
      'title', 'Help Us Improve',
      'description', 'Your feedback shapes the future of our products',
      'primary_color', '#ec4899',
      'secondary_color', '#64748b',
      'thank_you_message', 'Thank you for your feedback on {{field:product}}! We''ve sent a confirmation to {{field:email}}. Your input is invaluable to our team.'
    ),
    'fields', jsonb_build_array(
      jsonb_build_object(
        'type', 'email',
        'label', 'Your Email',
        'ref', 'email',
        'required', true,
        'order_index', 0
      ),
      jsonb_build_object(
        'type', 'select',
        'label', 'Which product are you providing feedback on?',
        'ref', 'product',
        'options', jsonb_build_array('Product A', 'Product B', 'Product C'),
        'required', true,
        'order_index', 1
      ),
      jsonb_build_object(
        'type', 'radio',
        'label', 'On a scale of 0-10, how likely are you to recommend {{field:product}} to a colleague?',
        'ref', 'nps_score',
        'description', '0 = Not at all likely, 10 = Extremely likely',
        'options', jsonb_build_array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'),
        'required', true,
        'order_index', 2
      ),
      jsonb_build_object(
        'type', 'textarea',
        'label', 'What do you love most about {{field:product}}?',
        'placeholder', 'Tell us what makes {{field:product}} great...',
        'description', 'We''d love to hear your feedback!',
        'required', false,
        'order_index', 3
      ),
      jsonb_build_object(
        'type', 'textarea',
        'label', 'What can we do to improve {{field:product}}?',
        'placeholder', 'Your honest feedback helps us improve...',
        'required', false,
        'order_index', 4
      ),
      jsonb_build_object(
        'type', 'textarea',
        'label', 'What feature would make {{field:product}} even better?',
        'placeholder', 'Share your ideas...',
        'required', false,
        'order_index', 5
      )
    )
  )
);