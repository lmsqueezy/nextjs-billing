-- Minimal DDL mirroring the tables the webhook writes to (with this change applied).
CREATE TABLE subscription(lemon_squeezy_id text PRIMARY KEY,status text NOT NULL,event_updated_at timestamptz);
