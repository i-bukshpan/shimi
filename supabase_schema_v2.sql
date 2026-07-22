-- Shimi Birthday App Stage 1 Schema

-- Table to store the generated AI creations
CREATE TABLE IF NOT EXISTS shimi_birthday.ai_creations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    author TEXT NOT NULL,
    raw_blessing TEXT NOT NULL,
    generated_media_url TEXT,
    tts_media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'audio', 'video', 'text')) NOT NULL,
    reactions JSONB DEFAULT '{}'::jsonb,
    parent_id UUID REFERENCES shimi_birthday.ai_creations(id) ON DELETE CASCADE
);

-- Table to store global admin settings
CREATE TABLE IF NOT EXISTS shimi_birthday.admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    is_locked BOOLEAN DEFAULT false
);

-- Insert a default row for admin_settings if empty
INSERT INTO shimi_birthday.admin_settings (is_locked)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM shimi_birthday.admin_settings);

-- Set up Row Level Security (RLS)
ALTER TABLE shimi_birthday.ai_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shimi_birthday.admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to ai_creations
CREATE POLICY "Allow public read access to ai_creations" ON shimi_birthday.ai_creations
    FOR SELECT USING (true);

-- Allow public inserts to ai_creations
CREATE POLICY "Allow public inserts to ai_creations" ON shimi_birthday.ai_creations
    FOR INSERT WITH CHECK (true);

-- Allow public read access to admin_settings
CREATE POLICY "Allow public read access to admin_settings" ON shimi_birthday.admin_settings
    FOR SELECT USING (true);

-- Note: We are allowing public updates/deletes in this stage for simplicity, 
-- but in production we should protect these with an admin auth policy.
CREATE POLICY "Allow all updates on ai_creations" ON shimi_birthday.ai_creations
    FOR UPDATE USING (true);
    
CREATE POLICY "Allow all deletes on ai_creations" ON shimi_birthday.ai_creations
    FOR DELETE USING (true);
    
CREATE POLICY "Allow all updates on admin_settings" ON shimi_birthday.admin_settings
    FOR UPDATE USING (true);

-- Grant permissions for the custom schema to the default Supabase roles
GRANT USAGE ON SCHEMA shimi_birthday TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA shimi_birthday TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA shimi_birthday TO anon, authenticated;
