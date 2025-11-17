-- Korus Collective Voice Database Schema
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

    -- Coordinates for map display
    latitude FLOAT NULL,
    longitude FLOAT NULL,
    
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
