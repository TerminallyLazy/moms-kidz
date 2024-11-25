-- Seed initial challenges
INSERT INTO challenges (title, description, type, points_reward, requirements, metadata)
VALUES 
    (
        'Daily Logger',
        'Log at least 3 activities today',
        'daily',
        50,
        '{"type": "activity_count", "target": 3, "activity_types": ["all"]}',
        '{"icon": "clipboard", "category": "engagement"}'
    ),
    (
        'Photo Collector',
        'Add 5 photos to your activities this week',
        'weekly',
        100,
        '{"type": "photo_count", "target": 5, "timeframe": "week"}',
        '{"icon": "camera", "category": "content"}'
    ),
    (
        'Milestone Master',
        'Record 3 developmental milestones',
        'special',
        200,
        '{"type": "milestone_count", "target": 3, "milestone_types": ["development"]}',
        '{"icon": "star", "category": "development"}'
    )
ON CONFLICT (title) DO NOTHING;

-- Create achievement types
INSERT INTO achievements (id, user_id, type, name, description, points, metadata)
VALUES 
    (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000000',  -- System user ID
        'engagement',
        'First Steps',
        'Log your first activity',
        50,
        '{"icon": "👶", "requirement": {"type": "activity_count", "count": 1}}'
    ),
    (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000000',  -- System user ID
        'streak',
        'Consistency Champion',
        'Maintain a 7-day activity streak',
        100,
        '{"icon": "🔥", "requirement": {"type": "streak_days", "count": 7}}'
    ),
    (
        uuid_generate_v4(),
        '00000000-0000-0000-0000-000000000000',  -- System user ID
        'contribution',
        'Data Pioneer',
        'Contribute to your first research study',
        150,
        '{"icon": "🔬", "requirement": {"type": "research_contribution", "count": 1}}'
    )
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_points_user_id ON points(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);

-- Insert test points (will only work if we have a test user)
INSERT INTO public.points (user_id, amount, type, description, metadata)
VALUES 
    -- We'll need to replace this UUID with an actual user ID when testing
    ('00000000-0000-0000-0000-000000000000', 100, 'activity', 'First activity logged', '{"activity_type": "login"}'),
    ('00000000-0000-0000-0000-000000000000', 50, 'achievement', 'First achievement unlocked', '{"achievement_id": "first_login"}'),
    ('00000000-0000-0000-0000-000000000000', 25, 'bonus', 'Welcome bonus', '{"bonus_type": "welcome"}');

-- Create a function to add points
CREATE OR REPLACE FUNCTION add_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS public.points AS $$
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
GRANT EXECUTE ON FUNCTION add_points TO authenticated;
GRANT EXECUTE ON FUNCTION add_points TO service_role;

-- Create a function to get total points for a user
CREATE OR REPLACE FUNCTION get_total_points(p_user_id UUID)
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
GRANT EXECUTE ON FUNCTION get_total_points TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_points TO service_role;
