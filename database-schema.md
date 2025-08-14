# DocFlow - Database Schema Documentation

## Overview
This document describes the complete database schema for the DocFlow document management system, implemented in PostgreSQL with business rules centralized in the backend service layer.

## Database Configuration
- **Database**: PostgreSQL 15
- **Connection**: Configured via Docker Compose
- **Port**: 5432 (mapped from container)
- **Database Name**: docflow
- **User**: docflow_user

## Tables

### users
Primary table for system users with authentication and role management.

```sql
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
```

**Business Rules:**
- Username must be unique across the system
- Password stored with scrypt hashing
- Role determines system permissions (Administrator vs. Usuário)
- area_id links user to organizational area (optional)
- employee_id links user to employee record (optional)

### areas
Organizational departments/areas within the institution.

```sql
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Business Rules:**
- Area names must be unique
- Only active areas (status=true) can receive documents
- Areas cannot be deleted if they have associated documents

### document_types
Categories of documents that can be processed.

```sql
CREATE TABLE document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Business Rules:**
- Document type names must be unique
- Only active types can be used for new documents
- Types cannot be deleted if they have associated documents

### employees
Personnel records linked to organizational areas.

```sql
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
```

**Business Rules:**
- DNI (identification number) must be unique
- Each employee must belong to one area
- Only active employees can be assigned documents
- Employees cannot be deleted if they have assigned documents

### documents
Core document entities with tracking and deadline management.

```sql
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
```

**Business Rules:**
- tracking_number auto-generated in format TRK-YYYY-XXX
- document_number auto-generated in format PROC-YYYY-MM-DD-XXXX
- origin_area_id never changes (audit trail)
- current_area_id tracks current location
- current_employee_id tracks individual assignment (optional)
- Priority determines automatic deadline calculation:
  - Normal: No deadline
  - Com Contagem de Prazo: 5 days default
  - Urgente: 1 day default
- Deadlines calculated excluding weekends

### document_tracking
Audit trail for all document movements and status changes.

```sql
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
```

**Business Rules:**
- Every document operation creates a tracking entry
- Initial creation creates first tracking entry
- Movements between areas/employees tracked
- Complete audit trail maintained
- Attachments can be added during movements

### session
Session storage for user authentication (managed by connect-pg-simple).

```sql
CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);
```

## Business Rules Implementation

### Document Access Control
1. **Area-Based Access**: Users can only view documents from their assigned area
2. **Individual Assignment**: Documents can be assigned to specific employees
3. **Movement Permissions**: Only assigned users can move their documents
4. **Administrative Override**: Administrators can access all documents

### Document Lifecycle
1. **Creation**: Auto-generates tracking and process numbers
2. **Movement**: Updates current location and creates tracking entry
3. **Assignment**: Links document to specific employee
4. **Status Updates**: Tracked in document_tracking table
5. **Deletion**: Only allowed for administrators on documents without history

### Deadline Management
1. **Auto-Calculation**: Based on priority level
2. **Custom Deadlines**: Can override default calculations
3. **Weekend Exclusion**: Business days only
4. **Tracking**: Deadline changes recorded in tracking

### Validation Rules
1. **User Permissions**: Validated before any document operation
2. **Area Validity**: Target areas must be active
3. **Employee Validity**: Target employees must be active and in correct area
4. **Document Integrity**: Prevents unauthorized modifications

## Indexes

### Performance Indexes
```sql
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
```

## Triggers

### Automatic Timestamp Updates
```sql
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Default Data

### Initial Areas
- Financeiro
- Recursos Humanos
- Jurídico
- Tecnologia da Informação
- Direção Geral

### Initial Document Types
- Ofício
- Memorando
- Processo Administrativo
- Relatório
- Solicitação

### Default Administrator
- Username: admin
- Password: admin123
- Role: Administrator

## Migration Notes

### From .md to PostgreSQL
1. All business logic moved from database to DocumentService class
2. Validation now handled in backend middleware
3. Auto-generation logic centralized in service layer
4. Permission checks implemented in business service
5. Complete audit trail maintained through document_tracking

### Docker Configuration
- Database runs in isolated container
- Automatic initialization with schema and default data
- Volume persistence for data
- Health checks configured
- Network isolation with application container