-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    type text NOT NULL,
    title text,
    description text,
    date timestamptz DEFAULT now() NOT NULL,
    location text,
    details jsonb,
    points_earned integer DEFAULT 0,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activities"
    ON public.activities
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
    ON public.activities
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
    ON public.activities
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
    ON public.activities
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at_activities
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;