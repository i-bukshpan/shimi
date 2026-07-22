-- הריצו את הפקודה הזו במסוף ה-SQL של סופאבייס שלכם (Supabase SQL Editor)
-- כדי לאפשר למערכת שלנו לשמור תגובות (Comments) לכל פוסט:

ALTER TABLE shimi_birthday.ai_creations 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES shimi_birthday.ai_creations(id) ON DELETE CASCADE;
