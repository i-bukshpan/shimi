-- React Flow Canvas Upgrade Schema

-- Add canvas position and decoration to ai_creations
ALTER TABLE shimi_birthday.ai_creations 
ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT (random() * 800),
ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT (random() * 800),
ADD COLUMN IF NOT EXISTS decoration TEXT DEFAULT 'none';

-- Create the connections table if it doesn't exist (using TEXT for flexibility)
CREATE TABLE IF NOT EXISTS shimi_birthday.card_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    edge_type TEXT NOT NULL DEFAULT 'join_blessing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- In case the user already ran the old schema with UUID constraints, we drop them and alter types
ALTER TABLE shimi_birthday.card_connections DROP CONSTRAINT IF EXISTS card_connections_source_id_fkey;
ALTER TABLE shimi_birthday.card_connections DROP CONSTRAINT IF EXISTS card_connections_target_id_fkey;
ALTER TABLE shimi_birthday.card_connections ALTER COLUMN source_id TYPE TEXT USING source_id::TEXT;
ALTER TABLE shimi_birthday.card_connections ALTER COLUMN target_id TYPE TEXT USING target_id::TEXT;

-- Set up Row Level Security for card_connections
ALTER TABLE shimi_birthday.card_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to card_connections" ON shimi_birthday.card_connections;
CREATE POLICY "Allow public read access to card_connections" ON shimi_birthday.card_connections
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public inserts to card_connections" ON shimi_birthday.card_connections;
CREATE POLICY "Allow public inserts to card_connections" ON shimi_birthday.card_connections
    FOR INSERT WITH CHECK (true);
    
DROP POLICY IF EXISTS "Allow public deletes to card_connections" ON shimi_birthday.card_connections;
CREATE POLICY "Allow public deletes to card_connections" ON shimi_birthday.card_connections
    FOR DELETE USING (true);

GRANT ALL ON shimi_birthday.card_connections TO anon, authenticated;

-- Backfill missing connections for existing ai_creations
INSERT INTO shimi_birthday.card_connections (source_id, target_id, edge_type)
SELECT 
    COALESCE(parent_id::text, 'shimi-main-node') AS source_id,
    id::text AS target_id,
    CASE WHEN parent_id IS NOT NULL THEN 'joke_continuation' ELSE 'join_blessing' END AS edge_type
FROM shimi_birthday.ai_creations
WHERE NOT EXISTS (
    SELECT 1 FROM shimi_birthday.card_connections WHERE target_id = ai_creations.id::text
);

-- Trigger to automatically create a connection when a new AI creation is added
CREATE OR REPLACE FUNCTION shimi_birthday.auto_connect_new_creation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        INSERT INTO shimi_birthday.card_connections (source_id, target_id, edge_type)
        VALUES (NEW.parent_id::text, NEW.id::text, 'joke_continuation');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_connect_new_creation ON shimi_birthday.ai_creations;
CREATE TRIGGER trg_auto_connect_new_creation
AFTER INSERT ON shimi_birthday.ai_creations
FOR EACH ROW
EXECUTE FUNCTION shimi_birthday.auto_connect_new_creation();
