CREATE TABLE IF NOT EXISTS public.mockup_generations (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  url        text        NOT NULL,
  generated  boolean     NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
