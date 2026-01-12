-- Add unique constraint on key column for upsert to work
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_key_unique UNIQUE (key);