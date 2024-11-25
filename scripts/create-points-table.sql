-- Create points table in public schema
CREATE TABLE IF NOT EXISTS public.points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own points"
    ON public.points
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
    ON public.points
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
