-- CreateTable
CREATE TABLE "CareLogEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareLogAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalEntries" INTEGER NOT NULL,
    "typeBreakdown" JSONB NOT NULL,
    "avgDuration" DOUBLE PRECISION,
    "trends" JSONB,
    "insights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareLogAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareLogTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "template" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareLogTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareLogReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schedule" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "nextTrigger" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CareLogReminder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN "requirements" JSONB,
                         ADD COLUMN "progress" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Streak" ADD COLUMN "careLogStreak" INTEGER NOT NULL DEFAULT 0,
                     ADD COLUMN "lastCareLog" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserAnalytics" ADD COLUMN "totalCareLogEntries" INTEGER NOT NULL DEFAULT 0,
                           ADD COLUMN "lastCareLogEntry" TIMESTAMP(3),
                           ADD COLUMN "careLogStats" JSONB;

-- CreateIndex
CREATE INDEX "CareLogEntry_userId_timestamp_idx" ON "CareLogEntry"("userId", "timestamp");
CREATE INDEX "CareLogEntry_type_idx" ON "CareLogEntry"("type");

-- CreateIndex
CREATE UNIQUE INDEX "CareLogAnalytics_userId_period_startDate_key" ON "CareLogAnalytics"("userId", "period", "startDate");
CREATE INDEX "CareLogAnalytics_userId_period_idx" ON "CareLogAnalytics"("userId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "CareLogTemplate_userId_name_key" ON "CareLogTemplate"("userId", "name");

-- CreateIndex
CREATE INDEX "CareLogReminder_userId_isActive_idx" ON "CareLogReminder"("userId", "isActive");
CREATE INDEX "CareLogReminder_nextTrigger_idx" ON "CareLogReminder"("nextTrigger");

-- AddForeignKey
ALTER TABLE "CareLogEntry" ADD CONSTRAINT "CareLogEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLogAnalytics" ADD CONSTRAINT "CareLogAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLogTemplate" ADD CONSTRAINT "CareLogTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareLogReminder" ADD CONSTRAINT "CareLogReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create function to update care log streaks
CREATE OR REPLACE FUNCTION update_care_log_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's care log streak
    WITH streak_data AS (
        SELECT
            CASE
                WHEN (
                    EXISTS (
                        SELECT 1
                        FROM care_log_entry
                        WHERE user_id = NEW.user_id
                        AND timestamp >= CURRENT_DATE - INTERVAL '1 day'
                        AND timestamp < CURRENT_DATE
                    )
                ) THEN
                    COALESCE(
                        (
                            SELECT care_log_streak + 1
                            FROM streak
                            WHERE user_id = NEW.user_id
                            AND type = 'care_log'
                            AND last_care_log >= CURRENT_DATE - INTERVAL '1 day'
                        ),
                        1
                    )
                ELSE 1
            END as new_streak
    )
    INSERT INTO streak (user_id, type, care_log_streak, last_care_log)
    VALUES (NEW.user_id, 'care_log', (SELECT new_streak FROM streak_data), CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, type)
    DO UPDATE SET
        care_log_streak = (SELECT new_streak FROM streak_data),
        last_care_log = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for care log streak updates
CREATE TRIGGER care_log_entry_streak_trigger
    AFTER INSERT ON care_log_entry
    FOR EACH ROW
    EXECUTE FUNCTION update_care_log_streak();

-- Create function to update user analytics
CREATE OR REPLACE FUNCTION update_care_log_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user analytics
    INSERT INTO user_analytics (
        user_id,
        total_care_log_entries,
        last_care_log_entry,
        care_log_stats
    )
    VALUES (
        NEW.user_id,
        1,
        CURRENT_TIMESTAMP,
        jsonb_build_object(
            'types', jsonb_build_object(NEW.type, 1),
            'last_updated', CURRENT_TIMESTAMP
        )
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_care_log_entries = user_analytics.total_care_log_entries + 1,
        last_care_log_entry = CURRENT_TIMESTAMP,
        care_log_stats = COALESCE(user_analytics.care_log_stats, '{}'::jsonb) || 
            jsonb_build_object(
                'types',
                COALESCE(
                    (user_analytics.care_log_stats->'types')::jsonb || 
                    jsonb_build_object(
                        NEW.type,
                        COALESCE(((user_analytics.care_log_stats->'types'->NEW.type)::int + 1), 1)
                    ),
                    jsonb_build_object(NEW.type, 1)
                )
            );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics updates
CREATE TRIGGER care_log_entry_analytics_trigger
    AFTER INSERT ON care_log_entry
    FOR EACH ROW
    EXECUTE FUNCTION update_care_log_analytics();