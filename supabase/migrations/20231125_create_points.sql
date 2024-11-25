-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
GRANT ALL ON public.points TO authenticated;
GRANT ALL ON public.points TO anon;
GRANT ALL ON public.points TO service_role;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER points_handle_updated_at
    BEFORE UPDATE ON public.points
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to add points
CREATE OR REPLACE FUNCTION public.add_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS public.points AS $$
DECLARE
    new_points public.points;
BEGIN
    INSERT INTO public.points (user_id, amount, type, description, metadata)
    VALUES (p_user_id, p_amount, p_type, p_description, p_metadata)
    RETURNING * INTO new_points;
    
    RETURN new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.add_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_points TO service_role;

-- Create function to get total points
CREATE OR REPLACE FUNCTION public.get_total_points(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount)
        FROM public.points
        WHERE user_id = p_user_id),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_total_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_points TO service_role;