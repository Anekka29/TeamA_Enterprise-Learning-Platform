ALTER TABLE courses
    ADD COLUMN reviewed_by BIGINT NULL,
    ADD COLUMN reviewed_at TIMESTAMP NULL;

ALTER TABLE courses
    ADD CONSTRAINT fk_courses_reviewed_by
        FOREIGN KEY (reviewed_by) REFERENCES users(id);
