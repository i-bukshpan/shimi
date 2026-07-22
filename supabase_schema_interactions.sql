-- Interactions Schema (Likes & Comments inside cards)

-- 1. Card Likes
CREATE TABLE IF NOT EXISTS shimi_birthday.card_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES shimi_birthday.ai_creations(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(card_id, device_id)
);

ALTER TABLE shimi_birthday.card_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to card_likes" ON shimi_birthday.card_likes;
CREATE POLICY "Allow public read access to card_likes" ON shimi_birthday.card_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public inserts to card_likes" ON shimi_birthday.card_likes;
CREATE POLICY "Allow public inserts to card_likes" ON shimi_birthday.card_likes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public deletes to card_likes" ON shimi_birthday.card_likes;
CREATE POLICY "Allow public deletes to card_likes" ON shimi_birthday.card_likes FOR DELETE USING (true);

GRANT ALL ON shimi_birthday.card_likes TO anon, authenticated;


-- 2. Card Comments
CREATE TABLE IF NOT EXISTS shimi_birthday.card_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES shimi_birthday.ai_creations(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE shimi_birthday.card_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to card_comments" ON shimi_birthday.card_comments;
CREATE POLICY "Allow public read access to card_comments" ON shimi_birthday.card_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public inserts to card_comments" ON shimi_birthday.card_comments;
CREATE POLICY "Allow public inserts to card_comments" ON shimi_birthday.card_comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public deletes to card_comments" ON shimi_birthday.card_comments;
CREATE POLICY "Allow public deletes to card_comments" ON shimi_birthday.card_comments FOR DELETE USING (true);

GRANT ALL ON shimi_birthday.card_comments TO anon, authenticated;
