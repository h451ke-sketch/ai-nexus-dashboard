-- 1. Add 'type' column to sessions
ALTER TABLE sessions ADD COLUMN type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image'));

-- 2. Fix RLS policies for sessions (Allow DELETE and UPDATE)
CREATE POLICY "Users can update their own sessions." ON sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions." ON sessions
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Fix RLS policies for messages (Add DELETE)
CREATE POLICY "Users can delete messages in their sessions." ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM sessions
            WHERE sessions.id = messages.session_id
            AND sessions.user_id = auth.uid()
        )
    );

-- 4. Update the trigger to include session type if needed (optional for now)
