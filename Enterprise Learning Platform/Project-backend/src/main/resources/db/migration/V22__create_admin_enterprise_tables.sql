CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    target_user VARCHAR(255),
    target_course VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'GENERAL',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    assigned_to VARCHAR(255),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT PRIMARY KEY,
    platform_name VARCHAR(255) NOT NULL DEFAULT 'Enterprise Learning Platform with Skill and Career Guidance System',
    support_email VARCHAR(255) NOT NULL DEFAULT 'support@skillsphere.com',
    logo_url VARCHAR(500),
    smtp_host VARCHAR(255) DEFAULT 'smtp.gmail.com',
    smtp_port INT DEFAULT 587,
    default_language VARCHAR(50) DEFAULT 'English',
    theme VARCHAR(50) DEFAULT 'System Dark',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO system_settings (id, platform_name, support_email, smtp_host, smtp_port, default_language, theme, maintenance_mode)
VALUES (1, 'SkillSphere Nexus', 'support@skillsphere.com', 'smtp.gmail.com', 587, 'English', 'System Dark', FALSE)
ON DUPLICATE KEY UPDATE id=id;
