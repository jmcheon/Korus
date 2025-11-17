-- Korus Collective VoiceDatabase Schema
-- This schema matches the SQLAlchemy models in back-fastapi/models.py

-- Create database if not exists (handled by docker-compose)
-- CREATE DATABASE IF NOT EXISTS korus_platform;
-- USE korus_platform;

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    
    -- Company profile information
    description TEXT,
    website VARCHAR(255),
    phone VARCHAR(50),
    
    -- Ratings and verification
    overall_rating FLOAT DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    social_media_score FLOAT DEFAULT 0.0,
    trust_score FLOAT DEFAULT 0.0,
    external_platform_score FLOAT DEFAULT 0.0,
    verified BOOLEAN DEFAULT FALSE,
    
    -- Rating breakdown
    rating_work_conditions FLOAT DEFAULT 0.0,
    rating_pay FLOAT DEFAULT 0.0,
    rating_treatment FLOAT DEFAULT 0.0,
    rating_safety FLOAT DEFAULT 0.0,
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_company_name (company_name),
    INDEX idx_industry (industry),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    
    -- Job details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    salary VARCHAR(100) NOT NULL,
    
    -- Job requirements
    requirements TEXT,
    benefits TEXT,
    
    -- Job status
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_is_active (is_active),
    INDEX idx_posted_at (posted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    job_id INT,
    
    -- Ratings (1-5 scale)
    rating_work_conditions FLOAT NOT NULL,
    rating_pay FLOAT NOT NULL,
    rating_treatment FLOAT NOT NULL,
    rating_safety FLOAT NOT NULL,
    
    -- Review content
    comment TEXT NOT NULL,
    
    -- Privacy and verification
    is_anonymous BOOLEAN DEFAULT TRUE,
    verified_employee BOOLEAN DEFAULT FALSE,
    employee_token VARCHAR(255),
    
    -- Engagement
    helpful_count INT DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_company_id (company_id),
    INDEX idx_job_id (job_id),
    INDEX idx_created_at (created_at),
    INDEX idx_verified_employee (verified_employee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Support Organizations Table
CREATE TABLE IF NOT EXISTS support_organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    
    -- Location
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    address VARCHAR(500) NOT NULL,
    
    -- Contact information
    contact VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    
    -- Services (stored as JSON)
    services JSON NOT NULL,
    open_hours VARCHAR(255) NOT NULL,
    
    -- Additional info
    description TEXT,
    languages JSON,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Tokens Table
CREATE TABLE IF NOT EXISTS employee_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    company_id INT NOT NULL,
    
    -- Token details
    employee_name VARCHAR(255),
    employee_email VARCHAR(255),
    job_title VARCHAR(255),
    
    -- Token status
    is_used BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_company_id (company_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (optional)
-- Sample Companies
INSERT INTO companies (email, hashed_password, company_name, industry, location, country, description, verified, overall_rating, trust_score) VALUES
('contact@globalconstruction.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEHaSuu', 'Global Construction Co.', 'Construction', 'Dubai, UAE', 'UAE', 'Leading construction company in the Middle East', TRUE, 2.3, 2.1),
('hr@pacificag.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEHaSuu', 'Pacific Agriculture Ltd.', 'Agriculture', 'California, USA', 'USA', 'Sustainable farming and agriculture', TRUE, 3.7, 3.6),
('info@medhospitality.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEHaSuu', 'Mediterranean Hospitality Group', 'Hospitality', 'Athens, Greece', 'Greece', 'Premium hospitality services', TRUE, 4.1, 4.2)
ON DUPLICATE KEY UPDATE email=email;

-- Sample Jobs
INSERT INTO jobs (company_id, title, description, location, salary, requirements, benefits) VALUES
(1, 'Construction Worker', 'General construction work including heavy lifting, scaffolding, and site preparation. Experience preferred but not required.', 'Dubai, UAE', '$800-1200/month', 'Physical fitness, willingness to work outdoors, basic safety training', 'Housing provided, health insurance, annual bonus'),
(2, 'Agricultural Worker', 'Seasonal farm work including harvesting, planting, and crop maintenance. Housing provided on-site.', 'California, USA', '$15-18/hour', 'No experience necessary, training provided', 'Housing, meals, transportation, overtime pay'),
(3, 'Hotel Staff', 'Various positions available in housekeeping, kitchen, and front desk. Full training provided.', 'Athens, Greece', '€1200-1500/month', 'Customer service skills, basic English', 'Meals, uniform, tips, career advancement')
ON DUPLICATE KEY UPDATE title=title;

-- Sample Reviews
INSERT INTO reviews (company_id, job_id, rating_work_conditions, rating_pay, rating_treatment, rating_safety, comment, is_anonymous, verified_employee) VALUES
(1, 1, 2.0, 3.0, 1.5, 2.0, 'Long hours with minimal breaks. Safety equipment not always provided. Pay was delayed multiple times. Management needs improvement.', TRUE, TRUE),
(2, 2, 4.0, 3.5, 4.0, 3.5, 'Fair treatment and decent pay. Housing conditions could be better but management is responsive to concerns. Overall positive experience.', FALSE, TRUE),
(3, 3, 4.5, 4.0, 4.5, 4.0, 'Excellent working environment. Management treats staff with respect. Good opportunities for advancement. Highly recommend!', FALSE, TRUE)
ON DUPLICATE KEY UPDATE comment=comment;

-- Sample Support Organizations
INSERT INTO support_organizations (name, type, latitude, longitude, address, contact, email, services, open_hours, description) VALUES
('Migrant Workers Rights Center', 'Legal Aid', 25.2048, 55.2708, '123 Sheikh Zayed Road, Dubai, UAE', '+971-4-123-4567', 'help@mwrc.ae', '["Legal consultation", "Contract review", "Dispute resolution", "Rights education"]', 'Mon-Fri: 9AM-6PM', 'Providing legal support and advocacy for migrant workers'),
('International Labor Organization', 'NGO', 37.7749, -122.4194, '456 Market Street, San Francisco, CA', '+1-415-555-0123', 'support@ilo-usa.org', '["Worker advocacy", "Fair labor standards", "Training programs", "Emergency assistance"]', 'Mon-Fri: 8AM-5PM', 'Global organization promoting workers rights'),
('Migrants Healthcare Clinic', 'Healthcare', 37.9838, 23.7275, '789 Piraeus Street, Athens, Greece', '+30-21-0987-6543', 'clinic@migrants-health.gr', '["Free medical checkups", "Mental health support", "Occupational health", "Emergency care"]', 'Mon-Sat: 7AM-9PM', 'Healthcare services for migrant workers')
ON DUPLICATE KEY UPDATE name=name;

-- Update company ratings based on reviews
UPDATE companies c
SET 
    rating_work_conditions = (SELECT AVG(rating_work_conditions) FROM reviews WHERE company_id = c.id),
    rating_pay = (SELECT AVG(rating_pay) FROM reviews WHERE company_id = c.id),
    rating_treatment = (SELECT AVG(rating_treatment) FROM reviews WHERE company_id = c.id),
    rating_safety = (SELECT AVG(rating_safety) FROM reviews WHERE company_id = c.id),
    overall_rating = (
        SELECT (AVG(rating_work_conditions) + AVG(rating_pay) + AVG(rating_treatment) + AVG(rating_safety)) / 4 
        FROM reviews WHERE company_id = c.id
    ),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE company_id = c.id)
WHERE EXISTS (SELECT 1 FROM reviews WHERE company_id = c.id);

-- Note: Password for all sample companies is 'SecurePass123'
-- The hashed password above is bcrypt hash of 'SecurePass123'
