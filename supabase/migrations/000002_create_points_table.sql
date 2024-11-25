-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text UNIQUE NOT NULL,
    description text,
    type text NOT NULL,
    points_reward integer NOT NULL,
    requirements jsonb NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    type text NOT NULL,
    name text NOT NULL,
    description text,
    points integer NOT NULL DEFAULT 0,
    unlocked_at timestamptz DEFAULT now() NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create points table
CREATE TABLE IF NOT EXISTS public.points (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    amount integer NOT NULL,
    type text NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    activity_type text NOT NULL,
    current_count integer DEFAULT 0,
    longest_count integer DEFAULT 0,
    last_activity_date timestamptz,
    started_at timestamptz DEFAULT now() NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS public.user_challenges (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    challenge_id uuid REFERENCES public.challenges ON DELETE CASCADE,
    progress integer DEFAULT 0,
    completed boolean DEFAULT false,
    completed_at timestamptz,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, challenge_id)
);

-- Enable RLS on all tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);

CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own points" ON public.points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON public.points FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own challenges" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.activities(date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_points_user_id ON public.points(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_challenges
    BEFORE UPDATE ON public.challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_achievements
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_points
    BEFORE UPDATE ON public.points
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_streaks
    BEFORE UPDATE ON public.streaks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_challenges
    BEFORE UPDATE ON public.user_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
