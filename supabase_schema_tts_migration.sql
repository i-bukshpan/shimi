-- Migration to add TTS Media URL
ALTER TABLE shimi_birthday.ai_creations 
ADD COLUMN IF NOT EXISTS tts_media_url TEXT;
