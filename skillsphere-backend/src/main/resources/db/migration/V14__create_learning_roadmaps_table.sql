CREATE TABLE learning_roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal TEXT NOT NULL,
    estimated_duration VARCHAR(255) NOT NULL,
    stages_json TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
