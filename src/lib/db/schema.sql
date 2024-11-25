-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";




-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create points table
CREATE TABLE IF NOT EXISTS public.points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on points
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    location TEXT,
    details JSONB,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Points policies
CREATE POLICY "Users can view their own points"
    ON public.points FOR SELECT
    USING ( auth.uid() = user_id );

CREATE POLICY "System can insert points"
    ON public.points FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

-- Achievements policies
CREATE POLICY "Users can view their own achievements"
    ON public.achievements FOR SELECT
    USING ( auth.uid() = user_id );

CREATE POLICY "System can insert achievements"
    ON public.achievements FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

-- Activities policies
CREATE POLICY "Users can view their own activities"
    ON public.activities FOR SELECT
    USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own activities"
    ON public.activities FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own activities"
    ON public.activities FOR UPDATE
    USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own activities"
    ON public.activities FOR DELETE
    USING ( auth.uid() = user_id );

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
