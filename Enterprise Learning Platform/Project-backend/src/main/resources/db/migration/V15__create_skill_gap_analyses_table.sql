CREATE TABLE skill_gap_analyses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_role TEXT NOT NULL,
    current_skills_json TEXT NOT NULL,
    required_skills_json TEXT NOT NULL,
    missing_skills_json TEXT NOT NULL,
    priority_skills_json TEXT NOT NULL,
    recommendations_json TEXT NOT NULL,
    suggested_courses_json TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
