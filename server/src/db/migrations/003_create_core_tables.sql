-- Migration: Create core tenant tables
-- Date: 2025-01-01
-- Purpose: Core tables for request management and workpaper platform

-- Clients table
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_status ON clients(status);

-- Requests table
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_requests_organization_id ON requests(organization_id);
CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_due_date ON requests(due_date);

-- Documents table
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_request_id ON documents(request_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Workpapers table
CREATE TABLE workpapers (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_id INTEGER REFERENCES requests(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  template_id INTEGER, -- For future: workpaper templates
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'archived')),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workpapers_organization_id ON workpapers(organization_id);
CREATE INDEX idx_workpapers_request_id ON workpapers(request_id);
CREATE INDEX idx_workpapers_category ON workpapers(category);
CREATE INDEX idx_workpapers_status ON workpapers(status);

-- Add comments
COMMENT ON TABLE clients IS 'Client records with organization_id for multi-tenant isolation.';
COMMENT ON TABLE requests IS 'Document requests with organization_id for multi-tenant isolation.';
COMMENT ON TABLE documents IS 'Documents with organization_id for multi-tenant isolation.';
COMMENT ON TABLE workpapers IS 'Workpapers with organization_id for multi-tenant isolation.';


