# Schema do Banco de Dados - Sistema de Gestão de Documentos

Este documento contém o schema completo do banco de dados PostgreSQL para o sistema de gestão de documentos e fluxo de trabalho.

## Visão Geral

O sistema possui 6 tabelas principais que gerenciam usuários, áreas organizacionais, funcionários, tipos de documentos, documentos e o rastreamento de movimentação dos documentos.

## Tabelas

### 1. Tabela `users` - Usuários do Sistema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Administrator', 'Usuário')),
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Descrição**: Armazena os usuários do sistema com suas credenciais e permissões.

**Campos**:
- `id`: Identificador único do usuário
- `username`: Nome de usuário único para login
- `password`: Senha criptografada (hash)
- `name`: Nome completo do usuário
- `role`: Função do usuário (Administrator ou Usuário)
- `status`: Status ativo/inativo do usuário
- `created_at`: Data de criação do registro

### 2. Tabela `areas` - Áreas Organizacionais

```sql
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Descrição**: Define as áreas ou departamentos da organização.

**Campos**:
- `id`: Identificador único da área
- `name`: Nome da área (ex: RH, Financeiro, TI)
- `status`: Status ativo/inativo da área
- `created_at`: Data de criação do registro

### 3. Tabela `document_types` - Tipos de Documentos

```sql
CREATE TABLE document_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Descrição**: Categoriza os diferentes tipos de documentos que circulam no sistema.

**Campos**:
- `id`: Identificador único do tipo de documento
- `name`: Nome do tipo de documento (ex: Ofício, Memorando, Processo)
- `status`: Status ativo/inativo do tipo
- `created_at`: Data de criação do registro

### 4. Tabela `employees` - Funcionários

```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    dni TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    area_id INTEGER NOT NULL REFERENCES areas(id),
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Descrição**: Cadastro de funcionários da organização vinculados às áreas.

**Campos**:
- `id`: Identificador único do funcionário
- `dni`: Documento de identidade único (CPF/RG)
- `first_name`: Primeiro nome do funcionário
- `last_name`: Sobrenome do funcionário
- `email`: Email do funcionário (opcional)
- `phone`: Telefone do funcionário (opcional)
- `area_id`: Referência à área onde o funcionário trabalha
- `status`: Status ativo/inativo do funcionário
- `created_at`: Data de criação do registro

### 5. Tabela `documents` - Documentos

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    tracking_number TEXT NOT NULL UNIQUE,
    document_number TEXT NOT NULL,
    document_type_id INTEGER NOT NULL REFERENCES document_types(id),
    origin_area_id INTEGER NOT NULL REFERENCES areas(id),
    current_area_id INTEGER NOT NULL REFERENCES areas(id),
    current_employee_id INTEGER REFERENCES employees(id),
    status TEXT NOT NULL DEFAULT 'Pending',
    subject TEXT NOT NULL,
    folios INTEGER NOT NULL DEFAULT 1,
    file_path TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Com Contagem de Prazo', 'Urgente')),
    deadline_days INTEGER,
    deadline TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Descrição**: Registro principal dos documentos do sistema com todas as informações relevantes.

**Campos**:
- `id`: Identificador único do documento
- `tracking_number`: Número de rastreamento único (formato: TRK-YYYY-XXX)
- `document_number`: Número do processo (formato: PROC-YYYY-MM-DD-XXXX)
- `document_type_id`: Tipo do documento
- `origin_area_id`: Área de origem do documento
- `current_area_id`: Área atual onde o documento se encontra
- `current_employee_id`: Funcionário específico responsável (opcional)
- `status`: Status atual do documento (Pending, In Progress, Completed, etc.)
- `subject`: Assunto/descrição do documento
- `folios`: Número de páginas do documento
- `file_path`: Caminho do arquivo anexado (opcional)
- `priority`: Prioridade do documento (Normal, Com Contagem de Prazo, Urgente)
- `deadline_days`: Prazo em dias (quando priority = 'Com Contagem de Prazo')
- `deadline`: Data limite calculada automaticamente
- `created_by`: Usuário que criou o documento
- `created_at`: Data de criação do documento

### 6. Tabela `document_tracking` - Rastreamento de Documentos

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
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Descrição**: Histórico de movimentação e encaminhamento dos documentos entre áreas e funcionários.

**Campos**:
- `id`: Identificador único do registro de rastreamento
- `document_id`: Documento sendo movimentado
- `from_area_id`: Área de origem da movimentação
- `to_area_id`: Área de destino da movimentação
- `from_employee_id`: Funcionário que encaminhou (opcional)
- `to_employee_id`: Funcionário destinatário específico (opcional)
- `description`: Observações sobre o encaminhamento
- `attachment_path`: Arquivo anexado à movimentação (opcional)
- `deadline_days`: Prazo específico para esta movimentação
- `created_by`: Usuário que fez o encaminhamento
- `created_at`: Data da movimentação

## Relacionamentos

### Chaves Estrangeiras

```sql
-- Funcionários pertencem a uma área
ALTER TABLE employees ADD CONSTRAINT fk_employees_area 
    FOREIGN KEY (area_id) REFERENCES areas(id);

-- Documentos têm tipo, área de origem e atual
ALTER TABLE documents ADD CONSTRAINT fk_documents_type 
    FOREIGN KEY (document_type_id) REFERENCES document_types(id);
ALTER TABLE documents ADD CONSTRAINT fk_documents_origin_area 
    FOREIGN KEY (origin_area_id) REFERENCES areas(id);
ALTER TABLE documents ADD CONSTRAINT fk_documents_current_area 
    FOREIGN KEY (current_area_id) REFERENCES areas(id);
ALTER TABLE documents ADD CONSTRAINT fk_documents_current_employee 
    FOREIGN KEY (current_employee_id) REFERENCES employees(id);
ALTER TABLE documents ADD CONSTRAINT fk_documents_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);

-- Rastreamento conecta documentos, áreas e funcionários
ALTER TABLE document_tracking ADD CONSTRAINT fk_tracking_document 
    FOREIGN KEY (document_id) REFERENCES documents(id);
ALTER TABLE document_tracking ADD CONSTRAINT fk_tracking_from_area 
    FOREIGN KEY (from_area_id) REFERENCES areas(id);
ALTER TABLE document_tracking ADD CONSTRAINT fk_tracking_to_area 
    FOREIGN KEY (to_area_id) REFERENCES areas(id);
ALTER TABLE document_tracking ADD CONSTRAINT fk_tracking_from_employee 
    FOREIGN KEY (from_employee_id) REFERENCES employees(id);
ALTER TABLE document_tracking ADD CONSTRAINT fk_tracking_to_employee 
    FOREIGN KEY (to_employee_id) REFERENCES employees(id);
ALTER TABLE document_tracking ADD CONSTRAINT fk_tracking_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id);
```

## Índices Recomendados

```sql
-- Índices para melhorar performance de consultas
CREATE INDEX idx_documents_tracking_number ON documents(tracking_number);
CREATE INDEX idx_documents_current_area ON documents(current_area_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_priority ON documents(priority);
CREATE INDEX idx_documents_deadline ON documents(deadline);
CREATE INDEX idx_document_tracking_document_id ON document_tracking(document_id);
CREATE INDEX idx_document_tracking_created_at ON document_tracking(created_at);
CREATE INDEX idx_employees_area ON employees(area_id);
CREATE INDEX idx_employees_dni ON employees(dni);
```

## Script de Criação Completo

```sql
-- Criação das tabelas em ordem de dependência

-- 1. Usuários (sem dependências)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Administrator', 'Usuário')),
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Áreas (sem dependências)
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Tipos de Documentos (sem dependências)
CREATE TABLE document_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. Funcionários (depende de areas)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    dni TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    area_id INTEGER NOT NULL REFERENCES areas(id),
    status BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Documentos (depende de document_types, areas, employees, users)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    tracking_number TEXT NOT NULL UNIQUE,
    document_number TEXT NOT NULL,
    document_type_id INTEGER NOT NULL REFERENCES document_types(id),
    origin_area_id INTEGER NOT NULL REFERENCES areas(id),
    current_area_id INTEGER NOT NULL REFERENCES areas(id),
    current_employee_id INTEGER REFERENCES employees(id),
    status TEXT NOT NULL DEFAULT 'Pending',
    subject TEXT NOT NULL,
    folios INTEGER NOT NULL DEFAULT 1,
    file_path TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Com Contagem de Prazo', 'Urgente')),
    deadline_days INTEGER,
    deadline TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Rastreamento de Documentos (depende de documents, areas, employees, users)
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
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Criação dos índices
CREATE INDEX idx_documents_tracking_number ON documents(tracking_number);
CREATE INDEX idx_documents_current_area ON documents(current_area_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_priority ON documents(priority);
CREATE INDEX idx_documents_deadline ON documents(deadline);
CREATE INDEX idx_document_tracking_document_id ON document_tracking(document_id);
CREATE INDEX idx_document_tracking_created_at ON document_tracking(created_at);
CREATE INDEX idx_employees_area ON employees(area_id);
CREATE INDEX idx_employees_dni ON employees(dni);
```

## Dados de Exemplo

```sql
-- Inserir usuário administrador padrão
INSERT INTO users (username, password, name, role) VALUES 
('admin', 'hash_da_senha', 'Administrador', 'Administrator');

-- Inserir áreas de exemplo
INSERT INTO areas (name) VALUES 
('Recursos Humanos'),
('Tecnologia da Informação'),
('Financeiro'),
('Jurídico'),
('Direção Geral');

-- Inserir tipos de documento de exemplo
INSERT INTO document_types (name) VALUES 
('Ofício'),
('Memorando'),
('Processo Administrativo'),
('Relatório'),
('Solicitação');
```

## Notas Importantes

1. **Segurança**: As senhas são armazenadas com hash usando scrypt
2. **Rastreabilidade**: Todas as movimentações são registradas na tabela document_tracking
3. **Flexibilidade**: Documentos podem ser encaminhados para áreas ou funcionários específicos
4. **Prazos**: Sistema suporta controle de prazos automático baseado em dias
5. **Prioridades**: Três níveis de prioridade com tratamento especial para documentos com prazo
6. **Arquivos**: Suporte a anexos de arquivos nos documentos e movimentações