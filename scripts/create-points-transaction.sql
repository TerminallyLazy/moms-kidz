BEGIN;

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.points;

-- Create points table
CREATE TABLE public.points (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own points"
    ON public.points
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
    ON public.points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.points TO postgres;
GRANT ALL ON public.points TO authenticated;
GRANT ALL ON public.points TO service_role;

-- Verify table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'points'
    ) THEN
        RAISE EXCEPTION 'Table points was not created successfully';
    END IF;
END
$$;

COMMIT;