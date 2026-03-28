CREATE TABLE bdrift_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bdrift_user_integrations (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES bdrift_users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- e.g., 'LinkedIn', 'Indeed', 'ZipRecruiter'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bdrift_contacts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES bdrift_users(id) ON DELETE CASCADE,
  contact_name VARCHAR(255) NOT NULL,
  source_platform VARCHAR(50) NOT NULL CHECK (source_platform IN ('LinkedIn', 'Indeed', 'ZipRecruiter', 'Website')),
  role_position VARCHAR(255),
  contact_email VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Responded', 'Booked')),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, contact_email)
);

CREATE TABLE bdrift_campaigns (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES bdrift_users(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bdrift_campaign_sequences (
  id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES bdrift_campaigns(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  email_subject VARCHAR(255),
  email_body TEXT NOT NULL,
  delay_hours INT NOT NULL, -- delay after previous step before sending
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, step_order)
);

CREATE TABLE bdrift_campaign_targets (
  id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES bdrift_campaigns(id) ON DELETE CASCADE,
  contact_id INT NOT NULL REFERENCES bdrift_contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

CREATE TABLE bdrift_outreach_logs (
  id SERIAL PRIMARY KEY,
  campaign_target_id INT NOT NULL REFERENCES bdrift_campaign_targets(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  reply_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bdrift_inbound_replies (
  id SERIAL PRIMARY KEY,
  contact_id INT NOT NULL REFERENCES bdrift_contacts(id) ON DELETE CASCADE,
  campaign_id INT NOT NULL REFERENCES bdrift_campaigns(id) ON DELETE CASCADE,
  reply_snippet TEXT NOT NULL,
  full_reply TEXT,
  qualification_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (qualification_status IN ('Qualified', 'Unqualified', 'Pending')),
  scheduled_call TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bdrift_calendar_bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES bdrift_users(id) ON DELETE CASCADE,
  contact_id INT NOT NULL REFERENCES bdrift_contacts(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);