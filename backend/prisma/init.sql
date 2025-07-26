-- PostgreSQL initialization script for Team Vault
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable, but keeping for reference)

-- Set timezone
SET timezone = 'UTC';

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- You can add additional initialization commands here
-- For example, creating roles, setting up permissions, etc.
