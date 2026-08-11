-- Create role-specific profile tables for enterprise-level profile management
-- These tables store detailed profile information for each user role

-- Student Profile Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    bio TEXT,
    college VARCHAR(255),
    degree VARCHAR(255),
    department VARCHAR(255),
    current_year VARCHAR(50),
    graduation_year INT,
    skills TEXT,
    interests TEXT,
    career_goal TEXT,
    preferred_learning_topics TEXT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mentor Profile Table
CREATE TABLE IF NOT EXISTS mentor_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    professional_bio TEXT,
    job_title VARCHAR(255),
    organization VARCHAR(255),
    years_of_experience INT,
    expertise TEXT,
    skills TEXT,
    specializations TEXT,
    mentoring_topics TEXT,
    mentoring_experience TEXT,
    preferred_mentoring_mode VARCHAR(100),
    availability_summary TEXT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    certifications TEXT,
    achievements TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin Profile Table
CREATE TABLE IF NOT EXISTS admin_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    bio TEXT,
    designation VARCHAR(255),
    department VARCHAR(255),
    organization VARCHAR(255),
    admin_identifier VARCHAR(100),
    linkedin_url VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
