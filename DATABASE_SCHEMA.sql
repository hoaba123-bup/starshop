-- Schema cho bảng users

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('user', 'admin', 'staff') DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Insert sample admin user (password: Admin123)
-- Password hash: $2a$10$...
INSERT INTO users (fullName, email, password, role, status)
VALUES ('Admin User', 'admin@example.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'admin', 'active');

-- Insert sample user (password: Password123)
INSERT INTO users (fullName, email, password, role, status)
VALUES ('John Doe', 'john@example.com', '$2a$10$YOUR_HASHED_PASSWORD_HERE', 'user', 'active');
