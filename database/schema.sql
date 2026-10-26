-- =======================================================================
-- Digital Legacy Manager - Comprehensive Database Schema (MySQL / MariaDB)
-- =======================================================================

CREATE DATABASE IF NOT EXISTS digital_legacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digital_legacy_db;

-- 1. Document Categories (Lookup table)
CREATE TABLE IF NOT EXISTS document_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    phone VARCHAR(30),
    date_of_birth DATE,
    gender VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    profile_photo VARCHAR(255),
    emergency_contact VARCHAR(100),
    reset_token VARCHAR(100),
    reset_token_expiry TIMESTAMP NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 3. Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    mobile_number VARCHAR(30),
    email VARCHAR(150),
    address VARCHAR(255),
    occupation VARCHAR(100),
    emergency_contact VARCHAR(100),
    profile_photo VARCHAR(255),
    important_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_family_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_family_user (user_id)
) ENGINE=InnoDB;

-- 4. Documents Table (Government, Personal, Financial, Property, etc.)
CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_member_id BIGINT NULL,
    category VARCHAR(50) NOT NULL, -- 'GOVERNMENT', 'PERSONAL', 'ASSET', 'INSURANCE', etc.
    document_name VARCHAR(150) NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- Aadhaar, PAN, Passport, Voter ID, Degree, Resume, etc.
    document_number VARCHAR(100),
    owner_name VARCHAR(150) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(150),
    description TEXT,
    file_path VARCHAR(500),
    original_file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(50),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_doc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_family FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
    INDEX idx_doc_user (user_id),
    INDEX idx_doc_category (category),
    INDEX idx_doc_expiry (expiry_date)
) ENGINE=InnoDB;

-- 5. Assets & Property Table
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_member_id BIGINT NULL,
    asset_name VARCHAR(150) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- 'Property', 'House', 'Land', 'Vehicle', 'Gold/Jewellery', 'Investments', 'Other'
    owner_name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    estimated_value DECIMAL(15,2),
    document_reference VARCHAR(150),
    notes TEXT,
    attachment_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_asset_family FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
    INDEX idx_asset_user (user_id)
) ENGINE=InnoDB;

-- 6. Financial Information Table (Secured & Masked)
CREATE TABLE IF NOT EXISTS financial_information (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_member_id BIGINT NULL,
    bank_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'Savings', 'Current', 'Fixed Deposit', 'Demat', 'PPF', 'Other'
    account_holder VARCHAR(150) NOT NULL,
    last_four_digits VARCHAR(4) NOT NULL,
    branch VARCHAR(150),
    ifsc VARCHAR(50),
    important_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_financial_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_financial_family FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
    INDEX idx_financial_user (user_id)
) ENGINE=InnoDB;

-- 7. Insurance Table
CREATE TABLE IF NOT EXISTS insurance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_member_id BIGINT NULL,
    insurance_provider VARCHAR(150) NOT NULL,
    policy_type VARCHAR(100) NOT NULL, -- 'Life Insurance', 'Health Insurance', 'Vehicle Insurance', 'Term Insurance', 'Home Insurance'
    policy_number VARCHAR(100) NOT NULL,
    policy_holder VARCHAR(150) NOT NULL,
    nominee VARCHAR(150),
    start_date DATE,
    expiry_date DATE,
    premium_amount DECIMAL(12,2),
    premium_frequency VARCHAR(50), -- 'Monthly', 'Quarterly', 'Half-Yearly', 'Annually'
    policy_document_path VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_insurance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_insurance_family FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
    INDEX idx_insurance_user (user_id),
    INDEX idx_insurance_expiry (expiry_date)
) ENGINE=InnoDB;

-- 8. Medical & Emergency Information Table
CREATE TABLE IF NOT EXISTS medical_information (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_member_id BIGINT NULL,
    person_name VARCHAR(150) NOT NULL,
    blood_group VARCHAR(10),
    allergies TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    doctor_name VARCHAR(150),
    doctor_contact VARCHAR(50),
    important_medical_notes TEXT,
    emergency_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_med_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_med_family FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
    INDEX idx_med_user (user_id)
) ENGINE=InnoDB;

-- 9. Digital Accounts Table (No plaintext passwords; stored instructions & recovery)
CREATE TABLE IF NOT EXISTS digital_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    account_category VARCHAR(50) NOT NULL, -- 'Email', 'Cloud Storage', 'Social Media', 'Online Services', 'Subscriptions', 'Other'
    service_name VARCHAR(150) NOT NULL,
    username_or_email VARCHAR(150) NOT NULL,
    website_url VARCHAR(255),
    account_status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Inactive', 'Legacy Directive Set'
    recovery_info TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_digital_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_digital_user (user_id)
) ENGINE=InnoDB;

-- 10. Important Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    relationship VARCHAR(100),
    contact_type VARCHAR(50) NOT NULL, -- 'Family', 'Doctor', 'Lawyer', 'Insurance Agent', 'Financial Advisor', 'Emergency Contact', 'Other'
    contact_number VARCHAR(50) NOT NULL,
    email VARCHAR(150),
    address VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_contacts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_contacts_user (user_id)
) ENGINE=InnoDB;

-- 11. Legacy Instructions Table
CREATE TABLE IF NOT EXISTS legacy_instructions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Important Documents Location', 'Family Instructions', 'Digital Account Instructions', 'Property Instructions', 'Contact Instructions', 'Personal Messages', 'Other'
    instruction_text TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Normal', -- 'High', 'Normal', 'Low'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_legacy_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_legacy_user (user_id)
) ENGINE=InnoDB;

-- 12. Important Information Table (Section 9 requirement)
CREATE TABLE IF NOT EXISTS important_information (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Important Locations', 'Personal Notes', 'Family Instructions', 'Emergency Instructions', 'General'
    content TEXT NOT NULL,
    importance_level VARCHAR(30) DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_info_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_info_user (user_id)
) ENGINE=InnoDB;

-- 13. Family Access & Permissions Table
CREATE TABLE IF NOT EXISTS family_access (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    family_member_id BIGINT NULL,
    grantee_email VARCHAR(150) NOT NULL,
    grantee_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50),
    section_name VARCHAR(50) NOT NULL, -- 'GOVERNMENT_DOCS', 'PERSONAL_DOCS', 'FINANCIAL', 'INSURANCE', 'ASSETS', 'MEDICAL', 'DIGITAL_ACCOUNTS', 'LEGACY_INSTRUCTIONS', 'FAMILY_MEMBERS', 'ALL'
    permission_level VARCHAR(30) NOT NULL, -- 'VIEW', 'UPLOAD', 'EDIT', 'DOWNLOAD', 'NO_ACCESS'
    invitation_status VARCHAR(30) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REVOKED'
    invitation_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_access_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_family FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
    INDEX idx_access_owner (owner_id),
    INDEX idx_access_grantee (grantee_email)
) ENGINE=InnoDB;

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'EXPIRING_SOON', 'EXPIRED', 'FAMILY_INVITE', 'SECURITY', 'SYSTEM'
    status VARCHAR(20) DEFAULT 'UNREAD', -- 'UNREAD', 'READ'
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_status (status)
) ENGINE=InnoDB;

-- 15. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL, -- e.g. 'USER_REGISTER', 'USER_LOGIN', 'UPLOAD_DOCUMENT', 'DELETE_DOCUMENT', 'GRANT_ACCESS'
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- Initial Seed Data for Document Categories
INSERT INTO document_categories (name, code, description) VALUES
('Government Identification', 'GOVERNMENT', 'Government issued identification cards, passports, voter IDs, etc.'),
('Personal Documents', 'PERSONAL', 'Academic degrees, certificates, resumes, experience letters'),
('Property Documents', 'PROPERTY', 'Sale deed, title deeds, tax receipts, land registry records'),
('Financial & Tax Documents', 'FINANCIAL', 'Bank statements, ITR acknowledgements, investment certificates'),
('Insurance Policies', 'INSURANCE', 'Health, life, motor, and property insurance papers'),
('Medical Records', 'MEDICAL', 'Prescriptions, vaccination cards, hospital discharge summaries')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Initial Administrator and Demo Users (passwords hashed with BCrypt - "Password@123")
-- BCrypt for "Password@123" is "$2a$10$w8T.u8iY0B8U0Xl.F39B6OPf0u1v8l0wA8M5hH5D.F7Uq.W1jH9h6" or generated via Spring Security
