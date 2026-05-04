-- =====================================================
-- AI Tutor Tables for Colormxr Studio
-- =====================================================
-- This migration creates tables for storing AI tutor conversations,
-- tracking token usage, and managing lesson progress.
-- =====================================================

-- =====================================================
-- 1. CONVERSATIONS TABLE
-- =====================================================
-- Stores conversation metadata and message history
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  exercise_id TEXT,
  session_id TEXT NOT NULL, -- For grouping messages in a single session
  messages JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of message objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups by user and lesson
CREATE INDEX IF NOT EXISTS idx_conversations_user_lesson
  ON ai_conversations(user_id, lesson_id);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_conversations_session
  ON ai_conversations(session_id);

-- Index for recent conversations
CREATE INDEX IF NOT EXISTS idx_conversations_last_message
  ON ai_conversations(last_message_at DESC);

-- =====================================================
-- 2. TOKEN USAGE TABLE
-- =====================================================
-- Tracks API token consumption per user for cost control
CREATE TABLE IF NOT EXISTS ai_token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cache_creation_tokens INTEGER DEFAULT 0,
  cache_read_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 6) DEFAULT 0,
  model TEXT NOT NULL, -- e.g., 'claude-sonnet-4-5'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for user token tracking
CREATE INDEX IF NOT EXISTS idx_token_usage_user
  ON ai_token_usage(user_id, created_at DESC);

-- Index for cost analysis
CREATE INDEX IF NOT EXISTS idx_token_usage_lesson
  ON ai_token_usage(lesson_id, created_at DESC);

-- =====================================================
-- 3. LESSON PROGRESS TABLE
-- =====================================================
-- Tracks which lessons/exercises users have completed
CREATE TABLE IF NOT EXISTS ai_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  exercise_id TEXT,
  completion_status TEXT CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
  last_slide_viewed INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, exercise_id)
);

-- Index for progress tracking
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user
  ON ai_lesson_progress(user_id, lesson_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only access their own conversations
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON ai_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Token Usage: Users can view own usage, system can insert
CREATE POLICY "Users can view own token usage"
  ON ai_token_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert token usage"
  ON ai_token_usage FOR INSERT
  WITH CHECK (true); -- Service role bypass

-- Lesson Progress: Users can manage own progress
CREATE POLICY "Users can view own progress"
  ON ai_lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON ai_lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON ai_lesson_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ai_conversations
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ai_lesson_progress
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON ai_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's token usage summary
CREATE OR REPLACE FUNCTION get_user_token_summary(p_user_id UUID)
RETURNS TABLE (
  total_conversations BIGINT,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT,
  total_cost_usd NUMERIC,
  last_30_days_cost NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT conversation_id)::BIGINT,
    SUM(input_tokens)::BIGINT,
    SUM(output_tokens)::BIGINT,
    SUM(total_cost_usd)::NUMERIC,
    SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days'
        THEN total_cost_usd ELSE 0 END)::NUMERIC
  FROM ai_token_usage
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. COMMENTS
-- =====================================================

COMMENT ON TABLE ai_conversations IS 'Stores AI tutor conversation history with messages stored as JSONB';
COMMENT ON TABLE ai_token_usage IS 'Tracks API token consumption and costs per user for budget management';
COMMENT ON TABLE ai_lesson_progress IS 'Tracks user progress through lessons and exercises';

COMMENT ON COLUMN ai_conversations.messages IS 'JSONB array of message objects: [{role: "user"|"assistant", content: "...", timestamp: "..."}]';
COMMENT ON COLUMN ai_conversations.session_id IS 'Groups messages from a single learning session';
COMMENT ON COLUMN ai_token_usage.cache_creation_tokens IS 'Tokens used to create prompt cache (Claude API feature)';
COMMENT ON COLUMN ai_token_usage.cache_read_tokens IS 'Tokens read from cache (90% cheaper than regular tokens)';
