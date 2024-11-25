#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env.local file not found${NC}"
    exit 1
fi

execute_query() {
    local query="$1"
    local description="$2"
    
    echo -e "${YELLOW}Executing: $description${NC}"
    
    response=$(curl -s -X POST \
        "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql" \
        -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}")
    
    if [[ $response == *"error"* ]]; then
        echo -e "${RED}Error: $response${NC}"
    else
        echo -e "${GREEN}Success${NC}"
    fi
}

# Enable UUID extension
execute_query "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" "Enabling UUID extension"

# Create profiles table
execute_query "
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);" "Creating profiles table"

# Create activities table
execute_query "
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    location TEXT,
    details JSONB,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);" "Creating activities table"

# Create achievements table
execute_query "
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    unlocked_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);" "Creating achievements table"

# Create points table
execute_query "
CREATE TABLE IF NOT EXISTS points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);" "Creating points table"

# Enable RLS on all tables
execute_query "
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;" "Enabling RLS on tables"

# Create RLS policies
execute_query "
CREATE POLICY \"Public profiles are viewable by everyone\" ON profiles FOR SELECT USING (true);
CREATE POLICY \"Users can insert their own profile\" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY \"Users can update their own profile\" ON profiles FOR UPDATE USING (auth.uid() = id);" "Creating profiles policies"

execute_query "
CREATE POLICY \"Users can view their own activities\" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY \"Users can insert their own activities\" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY \"Users can update their own activities\" ON activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY \"Users can delete their own activities\" ON activities FOR DELETE USING (auth.uid() = user_id);" "Creating activities policies"

execute_query "
CREATE POLICY \"Users can view their own achievements\" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY \"System can insert achievements\" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);" "Creating achievements policies"

execute_query "
CREATE POLICY \"Users can view their own points\" ON points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY \"System can insert points\" ON points FOR INSERT WITH CHECK (auth.uid() = user_id);" "Creating points policies"

# Create updated_at trigger
execute_query "
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;" "Creating updated_at trigger function"

execute_query "
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();" "Creating profiles updated_at trigger"

echo -e "${GREEN}Database setup complete${NC}"