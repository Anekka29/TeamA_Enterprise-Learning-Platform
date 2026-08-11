ALTER TABLE lessons
    ADD COLUMN estimated_duration VARCHAR(100) NULL,
    ADD COLUMN lesson_type VARCHAR(50) NULL,
    ADD COLUMN video_url VARCHAR(500) NULL,
    ADD COLUMN preview_available BOOLEAN NOT NULL DEFAULT FALSE;
