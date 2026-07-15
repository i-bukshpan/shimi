-- Create custom schema
CREATE SCHEMA IF NOT EXISTS shimi_birthday;

-- Grant usage on schema to anon and authenticated roles
GRANT USAGE ON SCHEMA shimi_birthday TO anon, authenticated;
GRANT ALL ON SCHEMA shimi_birthday TO postgres, service_role;

-- IMPORTANT: You must also expose this schema in the Supabase Dashboard:
-- Go to Settings -> API -> Schema, and add "shimi_birthday" to "Exposed schemas"

-- Create site_settings table
CREATE TABLE IF NOT EXISTS shimi_birthday.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Insert default value
INSERT INTO shimi_birthday.site_settings (key, value) VALUES ('is_locked', 'false')
ON CONFLICT (key) DO NOTHING;

-- Create sentences table
CREATE TABLE IF NOT EXISTS shimi_birthday.sentences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author TEXT NOT NULL,
    text_content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    family_greetings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant privileges to the anon role so that the public API can read/insert
GRANT SELECT, UPDATE ON shimi_birthday.site_settings TO anon, authenticated;
GRANT SELECT, INSERT ON shimi_birthday.sentences TO anon, authenticated;

-- Enable RLS (Optional but recommended)
ALTER TABLE shimi_birthday.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shimi_birthday.sentences ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for sentences (for the birthday app logic)
CREATE POLICY "Allow public read sentences" ON shimi_birthday.sentences FOR SELECT USING (true);
CREATE POLICY "Allow public insert sentences" ON shimi_birthday.sentences FOR INSERT WITH CHECK (true);
-- Allow public read and update for site_settings
CREATE POLICY "Allow public read site_settings" ON shimi_birthday.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update site_settings" ON shimi_birthday.site_settings FOR UPDATE USING (true);

-- Set up Storage Bucket (Storage is global, not schema-specific)
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads and reads to media bucket
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow public read media" ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- ==========================================
-- UPDATE EXISTING TABLE (Run this if you already created the table previously)
-- ==========================================
-- ALTER TABLE shimi_birthday.sentences ADD COLUMN IF NOT EXISTS family_greetings JSONB DEFAULT '[]'::jsonb;
