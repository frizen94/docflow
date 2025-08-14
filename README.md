# DocFlow - Sistema de Gestão de Documentos

![DocFlow Logo](https://img.shields.io/badge/DocFlow-Document%20Management-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)

## 🚀 Sobre o Projeto

DocFlow é um sistema completo de gestão de documentos desenvolvido especificamente para organizações brasileiras. Inspirado no PJE (Processo Judicial Eletrônico), oferece funcionalidades avançadas de tramitação, controle de prazos e auditoria completa.

## Visão Geral

O DocFlow é um sistema completo de gestão de documentos e fluxo de trabalho desenvolvido para organizações brasileiras. O sistema permite o registro, acompanhamento e gerenciamento de documentos através de áreas organizacionais com trilhas de auditoria detalhadas e monitoramento de prazos.

## Características Principais

### 🔐 Autenticação e Autorização
- Sistema de autenticação baseado em sessões
- Dois níveis de acesso:
  - **Administrator**: Acesso completo ao sistema
  - **Usuário**: Acesso limitado às funcionalidades básicas
- Criação automática de usuário administrador inicial se não existir nenhum

### 📄 Gestão de Documentos
- **Numeração Automática**: Geração automática de números de processo no formato `PROC-ANO-MÊS-DIA-XXXX`
- **Código de Rastreamento**: Sistema único de identificação `TRK-ANO-XXX`
- **Upload de Arquivos**: Suporte para PDF, DOC, DOCX, JPG, PNG (máximo 10MB)
- **Três Níveis de Prioridade**:
  - Normal: Processamento padrão
  - Com Contagem de Prazo: Inclui controle de deadline
  - Urgente: Processamento prioritário

### ⏰ Controle de Prazos
- **Definição Flexível**: Especificação de prazos em dias
- **Cálculo Automático**: Data limite calculada automaticamente
- **Monitoramento**: Acompanhamento visual de documentos próximos ao vencimento
- **Alertas**: Sistema de notificação para prazos próximos

### 🏢 Gestão Organizacional
- **Áreas**: Departamentos ou setores organizacionais
- **Funcionários**: Associação de pessoas às áreas específicas
- **Tipos de Documento**: Categorização padronizada (ex: Ofício, Memorando, etc.)

### 📊 Rastreamento e Auditoria
- **Histórico Completo**: Registro de todas as movimentações do documento
- **Trilha de Auditoria**: Quem, quando e para onde cada documento foi encaminhado
- **Status em Tempo Real**: Acompanhamento do status atual de cada documento

## Arquitetura Técnica

### Frontend
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite para desenvolvimento e build otimizado
- **Roteamento**: Wouter para navegação client-side
- **UI**: Radix UI + Tailwind CSS para interface responsiva
- **Estado**: TanStack Query para gerenciamento de estado do servidor
- **Formulários**: React Hook Form com validação Zod

### Backend
- **Runtime**: Node.js com Express.js
- **Linguagem**: TypeScript
- **ORM**: Drizzle ORM para operações type-safe
- **Autenticação**: Passport.js com estratégia local
- **Upload**: Multer para gerenciamento de arquivos
- **Segurança**: Criptografia scrypt para senhas

### Banco de Dados
- **SGBD**: PostgreSQL
- **Pool de Conexões**: @neondatabase/serverless
- **Schema**: Seis tabelas principais interconectadas

## Estrutura do Banco de Dados

### Tabelas Principais

#### 1. Users (Usuários)
```sql
- id: Identificador único
- username: Nome de usuário único
- password: Senha criptografada
- name: Nome completo
- role: Papel (Administrator/Usuário)
- createdAt: Data de criação
```

#### 2. Areas (Áreas/Departamentos)
```sql
- id: Identificador único
- name: Nome da área
- status: Ativo/Inativo
- createdAt: Data de criação
```

#### 3. Document_Types (Tipos de Documento)
```sql
- id: Identificador único
- name: Nome do tipo (ex: Ofício, Memorando)
- status: Ativo/Inativo
- createdAt: Data de criação
```

#### 4. Employees (Funcionários)
```sql
- id: Identificador único
- name: Nome completo
- areaId: Referência à área
- status: Ativo/Inativo
- createdAt: Data de criação
```

#### 5. Documents (Documentos)
```sql
- id: Identificador único
- trackingNumber: Código de rastreamento único
- documentNumber: Número do processo
- documentTypeId: Tipo do documento
- originAreaId: Área de origem
- currentAreaId: Área atual
- currentEmployeeId: Funcionário atual (opcional)
- subject: Assunto do documento
- status: Status atual
- priority: Prioridade (Normal/Com Contagem de Prazo/Urgente)
- deadline: Data limite (opcional)
- filePath: Caminho do arquivo anexo
- folios: Número de folhas
- createdBy: Usuário criador
- createdAt: Data de criação
```

#### 6. Document_Tracking (Rastreamento)
```sql
- id: Identificador único
- documentId: Referência ao documento
- fromAreaId: Área de origem do movimento
- toAreaId: Área de destino
- fromEmployeeId: Funcionário remetente (opcional)
- toEmployeeId: Funcionário destinatário (opcional)
- action: Tipo de ação realizada
- observations: Observações do movimento
- createdBy: Usuário que realizou a ação
- createdAt: Data/hora da movimentação
```

## Regras de Negócio

### 1. Criação de Documentos
- **Numeração Automática**: O sistema gera automaticamente o número do processo no formato `PROC-YYYY-MM-DD-XXXX`
- **Código de Rastreamento**: Gerado automaticamente no formato `TRK-YYYY-XXX`
- **Campos Obrigatórios**: Tipo de documento, área de origem, área atual e assunto
- **Prioridade Padrão**: Definida como "Normal" se não especificada
- **Status Inicial**: Todos os documentos iniciam com status "Pending"

### 2. Controle de Prazos
- **Cálculo Automático**: Quando especificado o número de dias, o sistema calcula a data limite
- **Prioridade "Com Contagem de Prazo"**: Apenas documentos com esta prioridade têm controle de deadline
- **Monitoramento**: Documentos próximos ao vencimento são destacados na interface

### 3. Movimentação de Documentos
- **Entre Áreas**: Documentos podem ser encaminhados de uma área para outra
- **Para Funcionários**: Dentro de uma área, documentos podem ser direcionados a funcionários específicos
- **Trilha Completa**: Cada movimentação gera um registro de auditoria
- **Histórico Imutável**: Registros de movimentação não podem ser editados ou excluídos

### 4. Controle de Acesso
- **Administradores**: Acesso completo a todas as funcionalidades
- **Usuários**: Acesso às funcionalidades básicas de consulta e criação
- **Autenticação Obrigatória**: Todas as operações requerem autenticação
- **Sessões Seguras**: Uso de cookies seguros para manutenção de sessão

### 5. Upload de Arquivos
- **Formatos Aceitos**: PDF, DOC, DOCX, JPG, PNG
- **Tamanho Máximo**: 10MB por arquivo
- **Armazenamento**: Arquivos salvos no sistema de arquivos do servidor
- **Referência**: Caminho do arquivo armazenado no registro do documento

### 6. Status de Documentos
- **Pending**: Documento criado, aguardando processamento
- **In Progress**: Documento em tramitação
- **Completed**: Documento finalizado
- **Archived**: Documento arquivado

### 7. Validações de Integridade
- **Áreas Existentes**: Validação de que áreas de origem e destino existem
- **Tipos Válidos**: Verificação de tipos de documento cadastrados
- **Funcionários Ativos**: Apenas funcionários ativos podem receber documentos
- **Unicidade**: Números de rastreamento e processo são únicos no sistema

## Funcionalidades por Módulo

### 📊 Dashboard
- **Estatísticas Gerais**: Total de documentos, documentos concluídos, pendentes
- **Documentos Próximos ao Vencimento**: Lista de documentos com deadline próximo
- **Gráficos**: Visualização estatística do fluxo de documentos
- **Acesso Rápido**: Links diretos para principais funcionalidades

### 📄 Gestão de Documentos
- **Listagem Completa**: Visualização de todos os documentos com filtros
- **Criação**: Formulário modal para criação de novos documentos
- **Edição**: Atualização de informações do documento
- **Visualização Detalhada**: Tela completa com histórico de movimentações
- **Download**: Acesso aos arquivos anexados

### 🏢 Gestão de Áreas
- **Cadastro**: Criação de novas áreas organizacionais
- **Listagem**: Visualização de todas as áreas com status
- **Edição**: Atualização de informações das áreas
- **Controle de Status**: Ativação/desativação de áreas

### 👥 Gestão de Funcionários
- **Cadastro**: Registro de novos funcionários
- **Associação**: Vinculação de funcionários às áreas
- **Listagem**: Visualização de todos os funcionários
- **Controle de Status**: Gerenciamento de funcionários ativos/inativos

### 📋 Tipos de Documento
- **Cadastro**: Criação de novos tipos de documento
- **Padronização**: Definição de categorias padrão
- **Listagem**: Visualização de todos os tipos
- **Gerenciamento**: Ativação/desativação de tipos

### 👤 Gestão de Usuários
- **Cadastro**: Criação de novos usuários do sistema
- **Controle de Acesso**: Definição de papéis e permissões
- **Listagem**: Visualização de todos os usuários
- **Segurança**: Gerenciamento de senhas e autenticação

## Fluxo de Trabalho Típico

### 1. Criação de Documento
1. Usuário acessa "Cadastrar Novo Documento"
2. Preenche informações obrigatórias
3. Seleciona arquivo (opcional)
4. Define prioridade e prazo (se aplicável)
5. Sistema gera número de processo e código de rastreamento
6. Documento criado com status "Pending"

### 2. Tramitação
1. Documento é encaminhado para área específica
2. Pode ser direcionado a funcionário da área
3. Sistema registra movimentação na trilha de auditoria
4. Status atualizado conforme necessário

### 3. Acompanhamento
1. Consulta por número de processo ou código de rastreamento
2. Visualização do histórico completo de movimentações
3. Verificação de prazos e status atual
4. Download de arquivos anexados

### 4. Finalização
1. Documento processado pela área responsável
2. Status atualizado para "Completed"
3. Registro final na trilha de auditoria
4. Arquivo para consulta histórica

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 12+
- NPM ou Yarn

### Configuração do Ambiente
1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente:
   - `DATABASE_URL`: String de conexão PostgreSQL
   - `SESSION_SECRET`: Chave secreta para sessões
4. Execute as migrações: `npm run db:push`
5. Inicie o servidor: `npm run dev`

### Variáveis de Ambiente Obrigatórias
```env
DATABASE_URL=postgresql://user:password@localhost:5432/docflow
SESSION_SECRET=your-secure-session-secret
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=docflow
```

## Comandos Disponíveis

### Desenvolvimento
- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run preview`: Preview do build de produção

### Banco de Dados
- `npm run db:push`: Aplica mudanças no schema
- `npm run db:studio`: Interface visual do banco
- `npm run db:generate`: Gera migrações

## Segurança

### Autenticação
- Senhas criptografadas com scrypt
- Sessões seguras com cookies httpOnly
- Validação de entrada em todas as rotas

### Autorização
- Middleware de verificação de autenticação
- Controle de acesso baseado em papéis
- Validação de permissões por endpoint

### Upload de Arquivos
- Validação de tipo de arquivo
- Limite de tamanho por upload
- Sanitização de nomes de arquivo

## Monitoramento e Logs

### Logs do Sistema
- Logs detalhados de operações
- Rastreamento de erros
- Auditoria de acessos

### Métricas
- Documentos criados por período
- Tempo médio de tramitação
- Documentos próximos ao vencimento

## Backup e Recuperação

### Dados
- Backup diário do banco PostgreSQL
- Retenção de 30 dias
- Scripts de restauração automatizados

### Arquivos
- Backup incremental dos uploads
- Sincronização com storage externo
- Verificação de integridade

## Suporte e Manutenção

### Atualizações
- Versionamento semântico
- Changelog detalhado
- Migração de dados automática

### Documentação
- API documentada com OpenAPI
- Guias de usuário
- Documentação técnica atualizada

## Roadmap

### Próximas Funcionalidades
- [ ] Notificações por email
- [ ] Dashboard executivo
- [ ] Relatórios avançados
- [ ] API REST pública
- [ ] Integração com sistemas externos

### Melhorias Planejadas
- [ ] Interface mobile responsiva
- [ ] Busca full-text
- [ ] Workflow automatizado
- [ ] Assinatura digital
- [ ] Integração com e-mail

---

## Contato e Suporte

Para questões técnicas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.

## Licença

Este projeto está licenciado sob os termos da licença MIT. Veja o arquivo LICENSE para mais detalhes.