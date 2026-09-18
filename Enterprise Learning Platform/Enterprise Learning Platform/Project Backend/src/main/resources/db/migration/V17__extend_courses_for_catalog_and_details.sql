ALTER TABLE courses
    ADD COLUMN language VARCHAR(100) NULL,
    ADD COLUMN estimated_duration VARCHAR(120) NULL,
    ADD COLUMN estimated_learning_hours INT NULL,
    ADD COLUMN prerequisites TEXT NULL,
    ADD COLUMN learning_outcomes TEXT NULL,
    ADD COLUMN skills TEXT NULL,
    ADD COLUMN published_at TIMESTAMP NULL;
