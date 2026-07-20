# Supabase Schema Updates

Hey Itesh, to support the new "Join Room" feature, we need to create the initial tables in our Supabase project.

Please execute the following SQL in the **SQL Editor** in your Supabase dashboard:

```sql
-- 1. Create rooms table
CREATE TABLE public.rooms (
  code TEXT PRIMARY KEY,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create players table
CREATE TABLE public.players (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS (Security Best Practice)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 4. Temporary Policies (Allowing Anonymous Access for Prototyping)
-- Since we haven't set up Auth yet, these policies allow anyone to create and join rooms.
CREATE POLICY "Allow public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update rooms" ON public.rooms FOR UPDATE USING (true);

CREATE POLICY "Allow public read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete players" ON public.players FOR DELETE USING (true);
```

**Realtime Note:** To enable Realtime, run these commands in the SQL Editor as well:

```sql
-- 5. Enable Realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
```


## alter tables

ALTER TABLE public.rooms ADD COLUMN submitted_player_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.rooms ADD COLUMN submission_deadline BIGINT NOT NULL DEFAULT 0;

-- 6. Create Storage Bucket for Photos
INSERT INTO storage.buckets (id, name, public) VALUES ('game_photos', 'game_photos', true) ON CONFLICT DO NOTHING;

-- 7. Allow public access to the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'game_photos');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'game_photos');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'game_photos');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'game_photos');

