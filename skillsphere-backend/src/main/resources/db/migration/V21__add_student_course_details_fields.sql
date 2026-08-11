ALTER TABLE courses
    ADD COLUMN banner_url VARCHAR(500) NULL AFTER thumbnail_url,
    ADD COLUMN average_rating DOUBLE NOT NULL DEFAULT 0.0 AFTER skills,
    ADD COLUMN certificate_available BIT(1) NOT NULL DEFAULT b'1' AFTER average_rating,
    ADD COLUMN tags TEXT NULL AFTER certificate_available;

UPDATE courses
SET banner_url = COALESCE(NULLIF(thumbnail_url, ''), banner_url)
WHERE banner_url IS NULL;

UPDATE courses
SET tags = COALESCE(NULLIF(skills, ''), tags)
WHERE tags IS NULL;
