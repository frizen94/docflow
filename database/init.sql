-- DocFlow Database Schema
-- Sistema de Gestão de Documentos

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Areas table
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Types table
CREATE TABLE document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    area_id INTEGER NOT NULL REFERENCES areas(id),
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Usuário')),
    area_id INTEGER REFERENCES areas(id),
    employee_id INTEGER REFERENCES employees(id),
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    document_number VARCHAR(100) NOT NULL,
    document_type_id INTEGER NOT NULL REFERENCES document_types(id),
    origin_area_id INTEGER NOT NULL REFERENCES areas(id),
    current_area_id INTEGER NOT NULL REFERENCES areas(id),
    current_employee_id INTEGER REFERENCES employees(id),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    subject TEXT NOT NULL,
    folios INTEGER NOT NULL DEFAULT 1,
    file_path TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Com Contagem de Prazo', 'Urgente')),
    deadline_days INTEGER,
    deadline TIMESTAMP WITH TIME ZONE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Tracking table
CREATE TABLE document_tracking (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id),
    from_area_id INTEGER NOT NULL REFERENCES areas(id),
    to_area_id INTEGER NOT NULL REFERENCES areas(id),
    from_employee_id INTEGER REFERENCES employees(id),
    to_employee_id INTEGER REFERENCES employees(id),
    description TEXT,
    attachment_path TEXT,
    deadline_days INTEGER,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session store table for connect-pg-simple
CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");

-- Indexes for performance
CREATE INDEX idx_documents_tracking_number ON documents(tracking_number);
CREATE INDEX idx_documents_current_area ON documents(current_area_id);
CREATE INDEX idx_documents_current_employee ON documents(current_employee_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_priority ON documents(priority);
CREATE INDEX idx_documents_deadline ON documents(deadline);
CREATE INDEX idx_document_tracking_document_id ON document_tracking(document_id);
CREATE INDEX idx_document_tracking_created_at ON document_tracking(created_at);
CREATE INDEX idx_employees_area_id ON employees(area_id);
CREATE INDEX idx_users_area_id ON users(area_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO areas (name, status) VALUES 
    ('Financeiro', true),
    ('Recursos Humanos', true),
    ('Jurídico', true),
    ('Tecnologia da Informação', true),
    ('Direção Geral', true);

INSERT INTO document_types (name, status) VALUES 
    ('Ofício', true),
    ('Memorando', true),
    ('Processo Administrativo', true),
    ('Relatório', true),
    ('Solicitação', true);

-- Create default admin user (password: admin123)
INSERT INTO users (username, password, name, role, status) VALUES 
    ('admin', 'admin123', 'Administrador', 'Administrator', true);