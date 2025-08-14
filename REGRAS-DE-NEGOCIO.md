
# DocFlow - Regras de Negócio Completas

## 1. INTRODUÇÃO E VISÃO GERAL DO SISTEMA

### 1.1. Definição do Sistema
O DocFlow é um sistema de gestão de documentos e fluxo de trabalho (workflow) desenvolvido especificamente para organizações brasileiras. O sistema foi projetado para gerenciar o ciclo de vida completo de documentos organizacionais, desde a criação até o arquivamento, incluindo todas as etapas de tramitação, controle de prazos e auditoria.

### 1.2. Objetivos do Sistema
- **Digitalização de Processos**: Substituir processos manuais de gestão documental por fluxos digitais controlados
- **Rastreabilidade Total**: Garantir que todo movimento de documento seja registrado e auditável
- **Controle de Prazos**: Implementar sistema robusto de monitoramento de deadlines com alertas automáticos
- **Segurança e Compliance**: Assegurar que apenas pessoas autorizadas tenham acesso aos documentos apropriados
- **Eficiência Operacional**: Reduzir tempo de tramitação e eliminar perdas de documentos
- **Transparência**: Permitir consulta em tempo real do status de qualquer documento no sistema

### 1.3. Arquitetura do Sistema
- **Frontend**: Interface web responsiva desenvolvida em React 18 com TypeScript
- **Backend**: API REST em Node.js com Express.js e TypeScript
- **Banco de Dados**: PostgreSQL com estrutura relacional normalizada
- **Autenticação**: Sistema baseado em sessões com middleware de segurança
- **Armazenamento**: Sistema de arquivos local para documentos anexados
- **Auditoria**: Logs completos de todas as operações realizadas no sistema

---

## 2. ESTRUTURA ORGANIZACIONAL

### 2.1. Conceitos Fundamentais

#### 2.1.1. Área Organizacional
Uma área representa um departamento, setor ou unidade organizacional dentro da instituição.

**Regras Aplicáveis:**
- Toda área deve ter um nome único no sistema
- Áreas podem estar ativas ou inativas (status boolean)
- Apenas áreas ativas podem receber novos documentos
- Áreas não podem ser excluídas fisicamente se possuem documentos associados
- A desativação de uma área não afeta documentos existentes, mas impede novos encaminhamentos

**Exemplos de Áreas:**
- Financeiro
- Recursos Humanos
- Jurídico
- Tecnologia da Informação
- Direção Geral
- Compras e Licitações
- Contabilidade
- Protocolo Geral

#### 2.1.2. Funcionário
Funcionários são pessoas físicas associadas a áreas específicas que podem receber documentos individuais.

**Regras Aplicáveis:**
- Todo funcionário deve possuir um DNI (documento de identificação) único
- Funcionários devem estar obrigatoriamente vinculados a uma área
- Apenas funcionários ativos podem receber novos documentos
- Um funcionário só pode estar vinculado a uma área por vez
- A mudança de área de um funcionário não afeta documentos já atribuídos a ele
- Funcionários inativos mantêm os documentos já atribuídos para fins de auditoria

**Campos Obrigatórios:**
- DNI (Documento Nacional de Identidade)
- Nome completo (primeiro nome e sobrenome separados)
- Área de vinculação
- Status (ativo/inativo)

**Campos Opcionais:**
- Email corporativo
- Telefone de contato

### 2.2. Tipos de Documento

#### 2.2.1. Definição
Tipos de documento são categorias padronizadas que classificam a natureza dos documentos processados pelo sistema.

**Regras de Criação:**
- Nomes de tipos devem ser únicos no sistema
- Apenas administradores podem criar novos tipos
- Tipos podem ser ativados ou desativados
- Tipos inativos não podem ser usados em novos documentos
- A desativação de um tipo não afeta documentos existentes

**Tipos Padrão do Sistema:**
- Ofício: Comunicação formal entre órgãos
- Memorando: Comunicação interna entre setores
- Processo Administrativo: Procedimento administrativo formal
- Relatório: Documento informativo ou técnico
- Solicitação: Pedidos formais de serviços ou produtos
- Parecer: Análise técnica ou jurídica
- Portaria: Ato administrativo normativo
- Circular: Comunicado geral
- Informação: Comunicação informativa
- Despacho: Decisão ou encaminhamento administrativo

---

## 3. GESTÃO DE USUÁRIOS E SEGURANÇA

### 3.1. Sistema de Autenticação

#### 3.1.1. Tipos de Usuário
O sistema possui dois níveis hierárquicos de usuários:

**Administrator (Administrador):**
- Acesso completo a todas as funcionalidades do sistema
- Pode criar, editar e excluir qualquer registro
- Visualiza todos os documentos independente da área
- Gerencia usuários, áreas, tipos de documento e funcionários
- Pode mover qualquer documento entre quaisquer áreas
- Único perfil autorizado a excluir documentos (com restrições)

**Usuário:**
- Acesso limitado às funcionalidades básicas
- Visualiza apenas documentos de sua área de vinculação
- Pode criar novos documentos
- Pode mover apenas documentos de sua área atual
- Não pode gerenciar outros usuários ou configurações do sistema
- Pode consultar informações de áreas, funcionários e tipos de documento

#### 3.1.2. Regras de Autenticação
- **Nome de usuário único**: Não pode haver duplicação de usernames no sistema
- **Senha criptografada**: Todas as senhas são armazenadas com hash scrypt
- **Sessão segura**: Sistema baseado em cookies httpOnly com expiração automática
- **Validação de entrada**: Todos os dados de login são sanitizados antes do processamento
- **Bloqueio de acesso**: Usuários inativos não podem fazer login
- **Primeira configuração**: Se não existir administrador no sistema, permite criação do primeiro admin

#### 3.1.3. Controle de Sessão
- Sessões expiram automaticamente após período de inatividade
- Logout limpa completamente a sessão do usuário
- Sistema verifica autenticação em cada requisição
- Redirecionamento automático para login quando sessão expira

### 3.2. Controle de Acesso Baseado em Área

#### 3.2.1. Princípio da Segregação
- Usuários comuns só visualizam documentos de sua área
- Documentos são filtrados automaticamente baseado na área do usuário
- Encaminhamentos são validados considerando a área atual do documento
- Administradores têm visão global superando a segregação por área

#### 3.2.2. Vinculação de Usuário a Área
- Usuários podem estar vinculados a uma área específica (campo opcional)
- Usuários sem área definida não visualizam documentos (exceto admins)
- A mudança de área do usuário altera imediatamente sua visibilidade
- Histórico de ações do usuário é mantido independente da área atual

---

## 4. GESTÃO DE DOCUMENTOS

### 4.1. Criação de Documentos

#### 4.1.1. Numeração Automática
O sistema implementa um esquema duplo de numeração para cada documento:

**Número de Processo (documentNumber):**
- Formato: PROC-YYYY-MM-DD-XXXX
- YYYY: Ano atual de criação
- MM: Mês atual com zero à esquerda
- DD: Dia atual com zero à esquerda  
- XXXX: Sequencial diário com 4 dígitos (0001, 0002, etc.)
- Exemplo: PROC-2024-03-15-0001

**Código de Rastreamento (trackingNumber):**
- Formato: TRK-YYYY-XXX
- YYYY: Ano atual de criação
- XXX: Sequencial anual com 3 dígitos (001, 002, etc.)
- Exemplo: TRK-2024-001

**Regras de Numeração:**
- Números são únicos em todo o sistema
- Geração é automática e não pode ser alterada pelo usuário
- Sistema verifica unicidade antes de confirmar criação
- Numeração é sequencial sem lacunas dentro do mesmo período

#### 4.1.2. Campos Obrigatórios
- **Tipo de Documento**: Deve ser selecionado de tipos ativos cadastrados
- **Área de Origem**: Área que está criando o documento
- **Assunto**: Descrição clara e objetiva do conteúdo (texto livre)
- **Número de Folhas**: Quantidade de páginas físicas (padrão: 1)

#### 4.1.3. Campos Opcionais
- **Área Atual**: Se diferente da origem (padrão: mesmo da origem)
- **Funcionário Atual**: Para atribuição específica dentro da área
- **Arquivo Anexo**: Upload de documento digital
- **Prioridade**: Normal, Com Contagem de Prazo ou Urgente (padrão: Normal)
- **Prazo Customizado**: Número de dias para conclusão

#### 4.1.4. Status Inicial
Todo documento criado recebe automaticamente:
- Status: "Pending" (Pendente)
- Data/hora de criação
- Usuário criador registrado
- Primeira entrada no histórico de rastreamento

### 4.2. Sistema de Prioridades

#### 4.2.1. Tipos de Prioridade

**Normal:**
- Processamento padrão sem urgência
- Não possui controle automático de prazo
- Prazo pode ser definido manualmente se necessário

**Com Contagem de Prazo:**
- Processamento com controle de deadline
- Prazo padrão: 5 dias úteis (configurable)
- Alertas automáticos quando próximo ao vencimento
- Monitoramento ativo do status

**Urgente:**
- Processamento prioritário
- Prazo padrão: 1 dia útil
- Alertas imediatos e destacados na interface
- Requer atenção imediata dos responsáveis

#### 4.2.2. Cálculo de Prazos
- Prazos são calculados em dias corridos a partir da data de criação
- Sistema suporta definição de prazos customizados
- Data limite é armazenada como timestamp para facilitar consultas
- Cálculo considera apenas dias úteis (segunda a sexta-feira)

### 4.3. Sistema de Anexos e Gestão de Arquivos

#### 4.3.1. Estrutura de Armazenamento por Processo
O sistema implementa uma estrutura de pastas organizadas por número de processo:

**Estrutura de Diretórios:**
```
uploads/
├── PROC-2025-08-14-0001/
│   ├── documento_principal.pdf
│   ├── anexo_01_contrato.pdf
│   ├── anexo_02_planilha.xlsx
│   └── resposta_area_juridica.pdf
├── PROC-2025-08-14-0002/
│   ├── documento_inicial.pdf
│   └── complementacao_informacoes.docx
```

#### 4.3.2. Tabela de Anexos do Documento
Uma nova tabela `document_attachments` gerencia múltiplos arquivos por documento:

**Campos da Tabela:**
- `id`: Identificador único do anexo
- `documentId`: Referência ao documento principal
- `fileName`: Nome do arquivo no sistema de arquivos
- `originalName`: Nome original do arquivo enviado pelo usuário
- `filePath`: Caminho completo do arquivo
- `fileSize`: Tamanho do arquivo em bytes
- `mimeType`: Tipo MIME do arquivo
- `category`: Categoria do anexo (Principal, Anexo, Resposta, Complementação)
- `description`: Descrição opcional do anexo
- `uploadedBy`: Usuário que fez o upload
- `uploadedAt`: Data e hora do upload
- `version`: Versão do arquivo (para controle de versionamento)

#### 4.3.3. Categorias de Anexos
- **Principal**: Documento principal do processo
- **Anexo**: Documentos complementares obrigatórios
- **Resposta**: Documentos enviados como resposta a solicitações
- **Complementação**: Informações adicionais solicitadas
- **Parecer**: Análises técnicas ou jurídicas
- **Despacho**: Decisões ou encaminhamentos
- **Comprovante**: Documentos probatórios

#### 4.3.4. Tipos de Arquivo Aceitos
- **PDF**: Documentos finalizados e oficiais
- **DOC/DOCX**: Documentos Microsoft Word editáveis
- **XLS/XLSX**: Planilhas e dados tabulares
- **JPG/JPEG/PNG**: Imagens e documentos escaneados
- **TXT**: Documentos de texto simples

#### 4.3.5. Limitações por Processo
- **Tamanho máximo por arquivo**: 25MB
- **Tamanho máximo por processo**: 500MB
- **Número máximo de arquivos por processo**: 50
- **Tipos permitidos**: Conforme lista acima
- **Nome de arquivo**: Máximo 255 caracteres, sanitizado automaticamente

#### 4.3.6. Regras de Upload
- **Pasta automática**: Sistema cria pasta automaticamente ao adicionar primeiro arquivo
- **Numeração sequencial**: Anexos são numerados automaticamente (anexo_01, anexo_02, etc.)
- **Verificação de vírus**: Recomendado scan antivírus antes do armazenamento
- **Backup automático**: Arquivos são incluídos no backup diário do sistema

#### 4.3.7. Controle de Versões
- **Substituição de arquivo**: Permite atualizar arquivo mantendo histórico da versão anterior
- **Histórico de versões**: Registra data, hora e usuário de cada alteração
- **Restauração**: Possibilidade de restaurar versão anterior
- **Numeração de versão**: v1.0, v1.1, v2.0, etc.

### 4.3.9. Rotas de API para Anexos
**Gestão de Arquivos por Processo:**
- `POST /api/documents/:id/attachments` - Upload de novo anexo
- `GET /api/documents/:id/attachments` - Listar todos os anexos do processo
- `GET /api/documents/:id/attachments/:attachmentId` - Obter informações de anexo específico
- `GET /api/documents/:id/attachments/:attachmentId/download` - Download de arquivo específico
- `PUT /api/documents/:id/attachments/:attachmentId` - Atualizar informações do anexo
- `DELETE /api/documents/:id/attachments/:attachmentId` - Remover anexo
- `GET /api/documents/:id/attachments/download-all` - Download de todos os anexos em ZIP

**Controle de Versões:**
- `POST /api/documents/:id/attachments/:attachmentId/versions` - Upload de nova versão
- `GET /api/documents/:id/attachments/:attachmentId/versions` - Listar versões do arquivo
- `GET /api/documents/:id/attachments/:attachmentId/versions/:versionId` - Download de versão específica

#### 4.3.10. Permissões de Anexos
**Regras de Acesso:**
- **Visualização**: Usuários da área atual podem ver todos os anexos
- **Upload**: Usuários da área atual podem adicionar anexos
- **Modificação**: Apenas quem fez upload ou administrador pode modificar
- **Exclusão**: Apenas administrador pode excluir anexos
- **Download**: Usuários com acesso ao documento podem baixar anexos

**Auditoria de Anexos:**
- Todo upload é registrado com usuário, data e IP
- Modificações são logadas com detalhes das alterações
- Downloads são registrados para fins de auditoria
- Exclusões requerem justificativa obrigatória

### 4.4. Controle de Status

#### 4.4.1. Status Disponíveis
- **Pending**: Documento aguardando processamento inicial
- **In Progress**: Documento em tramitação ativa
- **Completed**: Documento finalizado/resolvido
- **Archived**: Documento arquivado para consulta histórica

#### 4.4.2. Transições de Status
- Mudanças de status são registradas no histórico
- Apenas usuários com permissão podem alterar status
- Status "Completed" indica conclusão do processo
- Status "Archived" é usado para documentos históricos

---

## 5. FLUXO DE TRAMITAÇÃO

### 5.1. Conceitos de Movimentação

#### 5.1.1. Tipos de Encaminhamento

**Encaminhamento para Área:**
- Move documento de uma área para outra
- Área destino fica responsável pelo documento
- Não especifica funcionário individual
- Qualquer funcionário da área destino pode processar

**Encaminhamento para Funcionário:**
- Move documento para funcionário específico de uma área
- Funcionário deve pertencer à área de destino
- Atribuição individual clara de responsabilidade
- Apenas o funcionário designado pode mover o documento (exceto admins)

#### 5.1.2. Validações de Encaminhamento
- **Área de destino deve estar ativa**
- **Funcionário de destino deve estar ativo**
- **Funcionário deve pertencer à área de destino**
- **Usuário deve ter permissão para mover o documento atual**
- **Documento não pode estar arquivado**

### 5.2. Permissões de Movimentação

#### 5.2.1. Regras para Usuários Comuns
- Pode mover apenas documentos de sua área atual
- Se documento está atribuído a funcionário específico, apenas esse funcionário pode mover
- Não pode mover documentos de outras áreas
- Precisa ter área definida em seu perfil

#### 5.2.2. Regras para Administradores
- Pode mover qualquer documento independente da área
- Supera restrições de atribuição individual
- Pode mover documentos entre quaisquer áreas ativas
- Acesso total para fins administrativos

### 5.3. Histórico de Rastreamento

#### 5.3.1. Registro Automático
Todo movimento de documento gera automaticamente:
- Entrada na tabela document_tracking
- Data/hora exata da movimentação
- Área de origem e destino
- Funcionário de origem e destino (se aplicável)
- Usuário que realizou a ação
- Descrição da movimentação
- Prazo definido na movimentação (se aplicável)

#### 5.3.2. Immutabilidade
- Registros de rastreamento não podem ser editados
- Exclusão só é permitida junto com exclusão do documento
- Garante integridade da auditoria
- Histórico completo sempre disponível

#### 5.3.3. Tipos de Registro
- **Criação**: Primeiro registro ao criar documento
- **Encaminhamento**: Movimentação entre áreas
- **Atribuição**: Direcionamento para funcionário específico
- **Mudança de Status**: Alteração do status do documento
- **Alteração de Prazo**: Modificação de deadline

---

## 6. REGRAS DE NEGÓCIO ESPECÍFICAS

### 6.1. Criação de Documento

#### 6.1.1. Pré-condições
- Usuário deve estar autenticado
- Usuário deve ter área definida (para usuários comuns)
- Tipo de documento deve estar ativo
- Área de origem deve estar ativa

#### 6.1.2. Processo de Criação
1. Validação de dados obrigatórios
2. Geração automática de número de processo
3. Geração automática de código de rastreamento
4. Cálculo de prazo baseado na prioridade
5. Criação do registro principal
6. Criação do primeiro registro de rastreamento
7. Upload de arquivo (se fornecido)

#### 6.1.3. Pós-condições
- Documento criado com status "Pending"
- Registro inicial de rastreamento criado
- Numeração única garantida
- Usuário criador registrado
- Arquivo anexado (se aplicável)

### 6.2. Movimentação de Documento

#### 6.2.1. Validação de Permissão
```
SE usuário é Administrator:
    PERMITIR movimentação
SENÃO SE área atual do documento = área do usuário:
    SE documento não tem funcionário específico:
        PERMITIR movimentação
    SENÃO SE funcionário específico = funcionário do usuário:
        PERMITIR movimentação
    SENÃO:
        NEGAR movimentação
SENÃO:
    NEGAR movimentação
```

#### 6.2.2. Processo de Movimentação
1. Validação de permissões
2. Validação da área/funcionário de destino
3. Criação de registro de rastreamento
4. Atualização da localização atual do documento
5. Registro da ação no log do sistema

### 6.3. Exclusão de Documento

#### 6.3.1. Restrições
- Apenas administradores podem excluir documentos
- Documentos com histórico de movimentação (mais de 1 registro de tracking) não podem ser excluídos
- Exclusão remove permanentemente o documento e todos os seus registros

#### 6.3.2. Processo de Exclusão
1. Validação de permissão administrativa
2. Verificação do histórico de movimentação
3. Exclusão de registros de rastreamento
4. Remoção do arquivo anexado (se existir)
5. Exclusão do registro principal

### 6.4. Controle de Prazos

#### 6.4.1. Cálculo Automático
- Prazo é calculado a partir da data de criação ou última movimentação
- Dias úteis são considerados (segunda a sexta-feira)
- Data limite é armazenada como timestamp UTC
- Sistema suporta prazos personalizados por documento

#### 6.4.2. Alertas de Vencimento
- Documentos próximos ao vencimento são destacados na interface
- Consulta de documentos com prazo em X dias
- Filtragem por proximidade de deadline
- Dashboard com resumo de prazos críticos

---

## 7. CONSULTAS E RELATÓRIOS

### 7.1. Consultas por Usuário Comum

#### 7.1.1. Documentos por Área
- Lista todos os documentos atualmente na área do usuário
- Ordena por data de criação (mais recentes primeiro)
- Inclui informações básicas: número, tipo, assunto, prazo
- Permite filtros por status, prioridade e tipo

#### 7.1.2. Documentos Atribuídos
- Lista documentos especificamente atribuídos ao funcionário
- Apenas se usuário tem funcionário vinculado
- Prioriza documentos com prazo próximo ao vencimento
- Permite ações de encaminhamento e mudança de status

#### 7.1.3. Consulta por Número
- Busca por código de rastreamento (TRK-YYYY-XXX)
- Busca por número de processo (PROC-YYYY-MM-DD-XXXX)
- Retorna informações completas se usuário tem permissão
- Inclui histórico completo de movimentação

### 7.2. Consultas Administrativas

#### 7.2.1. Visão Global
- Todos os documentos independente da área
- Filtros avançados por área, funcionário, período
- Exportação de relatórios em diversos formatos
- Estatísticas de performance por área

#### 7.2.2. Relatórios de Auditoria
- Histórico completo de movimentações por período
- Ações por usuário específico
- Documentos com prazos vencidos
- Documentos sem movimentação há X dias

### 7.3. Dashboard Executivo

#### 7.3.1. Indicadores Principais
- Total de documentos no sistema
- Documentos pendentes por área
- Documentos com prazo vencido
- Documentos criados no mês atual
- Tempo médio de tramitação por tipo

#### 7.3.2. Gráficos e Visualizações
- Distribuição de documentos por área
- Evolução temporal de criação
- Status dos documentos (pendente, em andamento, concluído)
- Performance de atendimento de prazos

---

## 8. INTEGRIDADE E AUDITORIA

### 8.1. Princípios de Integridade

#### 8.1.1. Integridade Referencial
- Todas as chaves estrangeiras são validadas
- Exclusão em cascata onde apropriado
- Prevenção de orphan records
- Validação de relacionamentos obrigatórios

#### 8.1.2. Integridade de Dados
- Validação de tipos de dados
- Constraints de unicidade
- Validação de formatos (email, telefone, DNI)
- Sanitização de entradas de texto

#### 8.1.3. Integridade Transacional
- Operações críticas são atômicas
- Rollback automático em caso de erro
- Locks para operações concorrentes
- Verificação de consistência pós-operação

### 8.2. Sistema de Auditoria

#### 8.2.1. Log de Ações
Todas as operações são registradas incluindo:
- Timestamp da ação
- Usuário que executou
- Tipo de operação (CREATE, UPDATE, DELETE)
- Dados antes e depois (quando aplicável)
- IP de origem da requisição

#### 8.2.2. Rastreabilidade Completa
- Histórico imutável de movimentações
- Cadeia de custódia dos documentos
- Registro de todas as alterações
- Backup automático de logs críticos

#### 8.2.3. Compliance e Conformidade
- Atendimento a normas de gestão documental
- Retenção de logs por período configurável
- Exportação de dados para auditoria externa
- Relatórios de compliance automáticos

---

## 9. SEGURANÇA E PROTEÇÃO DE DADOS

### 9.1. Segurança da Informação

#### 9.1.1. Criptografia
- Senhas com hash scrypt e salt único
- Comunicação HTTPS obrigatória em produção
- Cookies de sessão com flags secure e httpOnly
- Dados sensíveis nunca em logs

#### 9.1.2. Controle de Acesso
- Autenticação obrigatória para todas as operações
- Autorização baseada em roles e contexto
- Segregação por área organizacional
- Timeout automático de sessão

#### 9.1.3. Proteção contra Ataques
- Validação e sanitização de todas as entradas
- Proteção contra SQL Injection via ORM
- Rate limiting para prevenir ataques de força bruta
- CORS configurado apropriadamente

### 9.2. Proteção de Dados Pessoais

#### 9.2.1. LGPD - Lei Geral de Proteção de Dados
- Minimização de dados pessoais coletados
- Consentimento explícito quando necessário
- Direito de acesso e correção dos dados
- Possibilidade de exclusão de dados pessoais

#### 9.2.2. Anonimização e Pseudonimização
- Logs não contêm informações pessoais desnecessárias
- Dados históricos podem ser anonimizados
- Relatórios estatísticos sem identificação individual
- Backup de dados com criptografia

---

## 10. REGRAS DE CONFIGURAÇÃO E ADMINISTRAÇÃO

### 10.1. Configuração Inicial do Sistema

#### 10.1.1. Primeiro Acesso
- Sistema verifica se existe algum administrador
- Se não existe, permite criação do primeiro admin
- Configuração de áreas básicas obrigatórias
- Criação de tipos de documento padrão

#### 10.1.2. Dados Padrão
**Áreas Obrigatórias:**
- Protocolo Geral (para recebimento inicial)
- Direção Geral (para decisões finais)

**Tipos de Documento Básicos:**
- Ofício
- Memorando
- Processo Administrativo
- Solicitação

**Usuário Administrador Inicial:**
- Username: admin
- Senha temporária que deve ser alterada no primeiro login
- Role: Administrator
- Status: Ativo

### 10.2. Manutenção do Sistema

#### 10.2.1. Backup de Dados
- Backup diário automático do banco de dados
- Backup incremental de arquivos anexados
- Retenção de backups por período configurável
- Teste de integridade dos backups

#### 10.2.2. Limpeza de Dados
- Limpeza automática de sessões expiradas
- Arquivamento de documentos antigos
- Compactação de logs históricos
- Otimização periódica do banco de dados

#### 10.2.3. Monitoramento
- Log de performance das operações
- Monitoramento de espaço em disco
- Alertas para falhas críticas
- Relatórios de uso do sistema

---

## 11. CASOS DE USO DETALHADOS

### 11.1. Caso de Uso: Criação de Documento

**Ator Principal:** Usuário autenticado
**Pré-condições:** 
- Usuário logado no sistema
- Usuário tem área definida (se não for admin)
- Existem tipos de documento ativos
- Existem áreas ativas

**Fluxo Principal:**
1. Usuário acessa tela de criação de documento
2. Sistema apresenta formulário com campos obrigatórios
3. Usuário preenche tipo de documento, assunto e número de folhas
4. Usuário seleciona área de origem (padrão: sua área)
5. Opcionalmente, usuário define área atual diferente da origem
6. Opcionalmente, usuário seleciona funcionário específico
7. Opcionalmente, usuário faz upload de arquivo
8. Usuário define prioridade (padrão: Normal)
9. Se prioridade "Com Contagem de Prazo" ou "Urgente", sistema sugere prazo padrão
10. Usuário pode customizar prazo em dias
11. Usuário confirma criação
12. Sistema valida dados obrigatórios
13. Sistema gera número de processo único
14. Sistema gera código de rastreamento único
15. Sistema calcula data limite baseada na prioridade e prazo
16. Sistema cria registro do documento
17. Sistema cria primeiro registro de rastreamento
18. Sistema confirma criação com números gerados
19. Usuário é redirecionado para lista de documentos

**Fluxos Alternativos:**
- **A1 - Dados Inválidos:** Sistema apresenta erros de validação, usuário corrige
- **A2 - Upload Falha:** Sistema informa erro, permite nova tentativa
- **A3 - Tipo Inativo:** Sistema não apresenta tipos inativos na lista
- **A4 - Área Inativa:** Sistema não permite seleção de áreas inativas

**Pós-condições:**
- Documento criado com status "Pending"
- Números únicos atribuídos
- Histórico inicial registrado
- Arquivo anexado (se fornecido)

### 11.2. Caso de Uso: Encaminhamento de Documento

**Ator Principal:** Usuário com permissão para mover documento
**Pré-condições:**
- Documento existe e não está arquivado
- Usuário tem permissão para mover o documento atual
- Existem áreas ativas para encaminhamento

**Fluxo Principal:**
1. Usuário visualiza lista de documentos de sua área
2. Usuário seleciona documento para encaminhar
3. Sistema verifica permissões do usuário
4. Sistema apresenta opções de encaminhamento
5. Usuário escolhe entre "Encaminhar para Área" ou "Encaminhar para Funcionário"
6. Sistema apresenta lista de áreas ativas disponíveis
7. Usuário seleciona área de destino
8. Se escolheu funcionário, sistema apresenta funcionários ativos da área destino
9. Usuário seleciona funcionário específico (opcional)
10. Usuário adiciona descrição da movimentação
11. Usuário define novo prazo (opcional)
12. Sistema valida área e funcionário de destino
13. Sistema cria registro de rastreamento
14. Sistema atualiza localização atual do documento
15. Sistema confirma encaminhamento
16. Documento sai da lista da área origem
17. Documento aparece na lista da área destino

**Fluxos Alternativos:**
- **A1 - Sem Permissão:** Sistema nega operação e informa motivo
- **A2 - Área Inválida:** Sistema não permite seleção de áreas inativas
- **A3 - Funcionário Inválido:** Sistema valida que funcionário pertence à área
- **A4 - Documento Atribuído:** Apenas funcionário específico pode mover (exceto admin)

### 11.3. Caso de Uso: Consulta de Documento

**Ator Principal:** Usuário autenticado
**Pré-condições:** 
- Usuário logado no sistema
- Documento existe no sistema

**Fluxo Principal:**
1. Usuário acessa tela de consulta
2. Sistema apresenta campo de busca
3. Usuário informa código de rastreamento ou número de processo
4. Sistema localiza documento
5. Sistema verifica se usuário tem permissão para visualizar
6. Sistema apresenta informações do documento:
   - Dados básicos (números, tipo, assunto, status)
   - Informações de prazo e prioridade
   - Localização atual (área e funcionário)
   - Histórico completo de movimentação
   - Link para download de arquivo (se existe)
7. Usuário visualiza informações completas
8. Opcionalmente, usuário pode imprimir ou exportar informações

**Fluxos Alternativos:**
- **A1 - Documento Não Encontrado:** Sistema informa que documento não existe
- **A2 - Sem Permissão:** Sistema nega acesso e informa restrição
- **A3 - Número Inválido:** Sistema valida formato dos números informados

---

## 12. REGRAS DE VALIDAÇÃO DETALHADAS

### 12.1. Validação de Dados de Entrada

#### 12.1.1. Campos de Texto
- **Assunto do Documento:**
  - Mínimo: 5 caracteres
  - Máximo: 500 caracteres
  - Não aceita apenas espaços em branco
  - Remove espaços no início e fim
  - Caracteres especiais permitidos: . , ; : ! ? ( ) - _ /

- **Nome de Área:**
  - Mínimo: 3 caracteres
  - Máximo: 100 caracteres
  - Não aceita caracteres especiais exceto espaço e hífen
  - Deve ser único no sistema (case insensitive)

- **Nome de Funcionário:**
  - Primeiro nome: mínimo 2 caracteres
  - Sobrenome: mínimo 2 caracteres
  - Máximo 50 caracteres cada campo
  - Apenas letras, espaços e acentos permitidos

#### 12.1.2. Campos Numéricos
- **Número de Folhas:**
  - Valor mínimo: 1
  - Valor máximo: 9999
  - Apenas números inteiros positivos

- **Prazo em Dias:**
  - Valor mínimo: 1
  - Valor máximo: 365
  - Apenas números inteiros positivos

#### 12.1.3. Campos de Identificação
- **DNI (Documento Nacional de Identidade):**
  - Formato livre para contemplar diferentes tipos de documento
  - Mínimo: 5 caracteres
  - Máximo: 20 caracteres
  - Permite números, letras e hífen
  - Deve ser único no sistema

- **Username:**
  - Mínimo: 3 caracteres
  - Máximo: 50 caracteres
  - Apenas letras minúsculas, números e underscore
  - Deve começar com letra
  - Deve ser único no sistema

#### 12.1.4. Campos de Email e Telefone
- **Email:**
  - Formato padrão de email válido
  - Máximo: 100 caracteres
  - Domínio deve ter pelo menos um ponto

- **Telefone:**
  - Formato flexível para diferentes padrões brasileiros
  - Mínimo: 8 dígitos
  - Máximo: 15 dígitos
  - Permite parênteses, hífen e espaços

### 12.2. Validação de Regras de Negócio

#### 12.2.1. Validações de Relacionamento
- **Funcionário x Área:**
  - Funcionário deve pertencer a área ativa
  - Área deve existir no sistema
  - Não pode mudar área se funcionário tem documentos atribuídos

- **Documento x Tipo:**
  - Tipo de documento deve estar ativo
  - Tipo deve existir no sistema
  - Não pode alterar tipo após criação

- **Usuário x Área:**
  - Área deve estar ativa
  - Usuário comum deve ter área definida
  - Administrador pode não ter área

#### 12.2.2. Validações de Status
- **Mudança de Status de Documento:**
  - Transições válidas:
    - Pending → In Progress
    - In Progress → Completed
    - In Progress → Pending
    - Completed → Archived
    - Qualquer → Archived (apenas admin)

- **Desativação de Registros:**
  - Área com documentos ativos não pode ser desativada
  - Funcionário com documentos atribuídos não pode ser desativado
  - Tipo com documentos existentes não pode ser desativado

#### 12.2.3. Validações de Prazo
- **Definição de Prazo:**
  - Prazo só pode ser definido para prioridades "Com Contagem de Prazo" e "Urgente"
  - Data limite não pode ser anterior à data atual
  - Prazo personalizado sobrepõe padrão da prioridade

### 12.3. Validação de Arquivos

#### 12.3.1. Tipos de Arquivo
- **Extensões Permitidas:**
  - .pdf (application/pdf)
  - .doc (application/msword)
  - .docx (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
  - .jpg/.jpeg (image/jpeg)
  - .png (image/png)

#### 12.3.2. Restrições de Upload
- **Tamanho:** Máximo 10MB por arquivo
- **Nome:** Máximo 255 caracteres
- **Caracteres especiais:** Removidos ou substituídos
- **Vírus:** Recomenda-se scan antivírus (não implementado)

---

## 13. MENSAGENS DE ERRO E FEEDBACK

### 13.1. Mensagens de Validação

#### 13.1.1. Erros de Dados Obrigatórios
- "O campo assunto é obrigatório"
- "Selecione um tipo de documento"
- "Área de origem deve ser informada"
- "Número de folhas deve ser informado"
- "Nome de usuário é obrigatório"
- "Senha deve ser informada"

#### 13.1.2. Erros de Formato
- "Email inválido"
- "Telefone deve conter apenas números"
- "DNI deve ter entre 5 e 20 caracteres"
- "Nome de usuário pode conter apenas letras minúsculas, números e underscore"
- "Assunto deve ter entre 5 e 500 caracteres"

#### 13.1.3. Erros de Regra de Negócio
- "Nome de usuário já existe no sistema"
- "DNI já está cadastrado para outro funcionário"
- "Área deve estar ativa para receber documentos"
- "Funcionário deve pertencer à área de destino"
- "Você não tem permissão para mover este documento"
- "Documento não pode ser excluído após movimentação"

### 13.2. Mensagens de Sucesso

#### 13.2.1. Criação de Registros
- "Documento criado com sucesso. Número de processo: [NUMERO]"
- "Usuário criado com sucesso"
- "Área cadastrada com sucesso"
- "Funcionário cadastrado com sucesso"
- "Tipo de documento criado com sucesso"

#### 13.2.2. Atualizações
- "Documento atualizado com sucesso"
- "Documento encaminhado com sucesso para [AREA/FUNCIONARIO]"
- "Status alterado para [STATUS]"
- "Informações atualizadas com sucesso"

#### 13.2.3. Exclusões
- "Documento excluído com sucesso"
- "Registro removido com sucesso"
- "Operação realizada com sucesso"

### 13.3. Mensagens Informativas

#### 13.3.1. Alertas de Sistema
- "Sessão expirará em 5 minutos"
- "Este documento está próximo ao prazo limite ([X] dias)"
- "Arquivo anexado com sucesso"
- "Nenhum documento encontrado com os filtros aplicados"

#### 13.3.2. Instruções para o Usuário
- "Selecione um documento para visualizar detalhes"
- "Use o código de rastreamento (TRK) ou número do processo (PROC) para buscar"
- "Apenas arquivos PDF, DOC, DOCX, JPG e PNG são aceitos"
- "Documentos com histórico de movimentação não podem ser excluídos"

---

## 14. PERFORMANCE E OTIMIZAÇÃO

### 14.1. Otimizações de Banco de Dados

#### 14.1.1. Índices Obrigatórios
- **documents.tracking_number** - Busca por código de rastreamento
- **documents.document_number** - Busca por número de processo
- **documents.current_area_id** - Filtro por área atual
- **documents.current_employee_id** - Filtro por funcionário
- **documents.status** - Filtro por status
- **documents.deadline** - Ordenação por prazo
- **document_tracking.document_id** - Histórico do documento
- **document_tracking.created_at** - Ordenação cronológica
- **users.username** - Login de usuário
- **employees.dni** - Busca por DNI

#### 14.1.2. Consultas Otimizadas
- Uso de LIMIT em consultas de listagem
- JOIN eficiente entre tabelas relacionadas
- Filtros aplicados antes de JOINs
- Paginação para grandes volumes de dados

#### 14.1.3. Cache de Dados
- Cache de sessão de usuário
- Cache de áreas e tipos de documento (raramente mudam)
- Cache de funcionários por área
- Invalidação automática quando dados mudam

### 14.2. Otimizações de Interface

#### 14.2.1. Carregamento Lazy
- Listagens grandes carregam sob demanda
- Detalhes de documento carregam apenas quando solicitados
- Histórico de rastreamento carrega progressivamente

#### 14.2.2. Compressão e Minificação
- Assets JavaScript e CSS minificados
- Imagens otimizadas
- Compressão GZIP habilitada

#### 14.2.3. Feedback Visual
- Loading spinners durante operações
- Feedback imediato em formulários
- Indicadores de progresso para uploads

---

## 15. CENÁRIOS DE TESTE

### 15.1. Testes Funcionais

#### 15.1.1. Teste de Criação de Documento
**Cenário:** Usuário comum cria documento básico
**Passos:**
1. Fazer login como usuário comum
2. Acessar "Cadastrar Novo Documento"
3. Preencher campos obrigatórios
4. Submeter formulário
5. Verificar numeração automática
6. Confirmar documento na lista da área

**Resultado Esperado:**
- Documento criado com números únicos
- Status inicial "Pending"
- Registro inicial no histórico
- Documento visível apenas na área do usuário

#### 15.1.2. Teste de Encaminhamento
**Cenário:** Encaminhar documento entre áreas
**Passos:**
1. Criar documento em área A
2. Login como usuário da área A
3. Encaminhar documento para área B
4. Login como usuário da área B
5. Verificar documento na área B
6. Verificar histórico de movimentação

**Resultado Esperado:**
- Documento sai da lista da área A
- Documento aparece na lista da área B
- Histórico registra movimentação corretamente

#### 15.1.3. Teste de Permissões
**Cenário:** Validar controle de acesso
**Passos:**
1. Criar documento na área A
2. Tentar acessar como usuário da área B
3. Verificar negação de acesso
4. Login como admin
5. Verificar acesso liberado

**Resultado Esperado:**
- Usuário da área B não vê documento da área A
- Admin vê todos os documentos

### 15.2. Testes de Segurança

#### 15.2.1. Teste de Autenticação
**Cenário:** Tentativa de acesso sem login
**Passos:**
1. Acessar URL direta de página interna
2. Verificar redirecionamento para login
3. Tentar acessar API diretamente
4. Verificar retorno de erro de autenticação

#### 15.2.2. Teste de Autorização
**Cenário:** Usuário comum tenta operação de admin
**Passos:**
1. Login como usuário comum
2. Tentar acessar área de administração
3. Tentar criar usuário via API
4. Verificar negação de acesso

### 15.3. Testes de Performance

#### 15.3.1. Teste de Carga
**Cenário:** Sistema com grande volume de dados
**Simulação:**
- 1000 documentos por área
- 50 usuários simultâneos
- 10 áreas organizacionais
- Medição de tempo de resposta

#### 15.3.2. Teste de Upload
**Cenário:** Upload de arquivos grandes
**Passos:**
1. Tentar upload de arquivo de 10MB
2. Verificar progresso do upload
3. Confirmar integridade do arquivo
4. Testar download posterior

---

## 16. TROUBLESHOOTING E RESOLUÇÃO DE PROBLEMAS

### 16.1. Problemas Comuns de Usuário

#### 16.1.1. Não Consigo Ver Documentos
**Possíveis Causas:**
- Usuário não tem área definida
- Documentos estão em outra área
- Problemas de permissão

**Soluções:**
1. Verificar se usuário tem área definida no perfil
2. Admin deve ajustar área do usuário
3. Verificar se documentos existem na área correta

#### 16.1.2. Não Consigo Encaminhar Documento
**Possíveis Causas:**
- Documento atribuído a outro funcionário
- Usuário de área diferente da atual do documento
- Documento está arquivado

**Soluções:**
1. Verificar se usuário é o funcionário designado
2. Admin pode mover documento de qualquer área
3. Verificar status do documento

#### 16.1.3. Upload de Arquivo Falha
**Possíveis Causas:**
- Arquivo muito grande (>10MB)
- Tipo de arquivo não permitido
- Problemas de conexão

**Soluções:**
1. Reduzir tamanho do arquivo
2. Converter para formato aceito
3. Tentar novamente com conexão estável

### 16.2. Problemas Técnicos

#### 16.2.1. Erro de Numeração Duplicada
**Causa:** Problema de concorrência na geração de números
**Solução:** 
1. Verificar se transações estão sendo usadas
2. Implementar retry automático
3. Verificar integridade dos índices únicos

#### 16.2.2. Sessão Expira Rapidamente
**Causa:** Configuração inadequada do timeout
**Solução:**
1. Ajustar configuração de sessão
2. Verificar limpeza automática de sessões
3. Implementar renovação automática

#### 16.2.3. Performance Lenta
**Causas Possíveis:**
- Falta de índices no banco
- Volume muito grande de dados
- Consultas não otimizadas

**Soluções:**
1. Verificar e criar índices necessários
2. Implementar paginação
3. Otimizar queries complexas
4. Considerar arquivamento de dados antigos

---

## 17. MANUTENÇÃO E EVOLUÇÃO

### 17.1. Manutenção Preventiva

#### 17.1.1. Rotinas Diárias
- Backup automático do banco de dados
- Verificação de integridade dos arquivos
- Limpeza de sessões expiradas
- Monitoramento de logs de erro

#### 17.1.2. Rotinas Semanais
- Análise de performance das consultas
- Verificação de espaço em disco
- Atualização de estatísticas do banco
- Relatório de uso do sistema

#### 17.1.3. Rotinas Mensais
- Arquivamento de documentos antigos
- Limpeza de logs históricos
- Backup completo do sistema
- Revisão de usuários inativos

### 17.2. Evolutivas Planejadas

#### 17.2.1. Melhorias de Interface
- Interface responsiva para dispositivos móveis
- Dark mode
- Melhor acessibilidade (WCAG)
- Personalização de dashboards

#### 17.2.2. Funcionalidades Avançadas
- Assinatura digital de documentos
- Integração com email (notificações)
- Workflow automático baseado em regras
- Relatórios avançados com gráficos

#### 17.2.3. Integrações Externas
- API REST para sistemas externos
- Integração com Active Directory
- Conectores para sistemas ERP
- Webservices para consulta externa

### 17.3. Migração e Atualizações

#### 17.3.1. Processo de Atualização
1. Backup completo antes da atualização
2. Ambiente de teste para validação
3. Migração gradual em horário de baixo movimento
4. Validação pós-migração
5. Rollback planejado se necessário

#### 17.3.2. Migração de Dados
- Scripts automáticos de migração
- Validação de integridade pós-migração
- Conversão de formatos quando necessário
- Preservação do histórico completo

---

## 18. CONCLUSÃO E CONSIDERAÇÕES FINAIS

### 18.1. Resumo do Sistema

O DocFlow representa uma solução completa e robusta para gestão de documentos organizacionais, implementando as melhores práticas de desenvolvimento de software e atendendo às necessidades específicas de organizações brasileiras. O sistema combina:

- **Segurança robusta** com controle de acesso baseado em áreas
- **Rastreabilidade completa** com histórico imutável de movimentações  
- **Interface intuitiva** desenvolvida com tecnologias modernas
- **Escalabilidade** através de arquitetura bem estruturada
- **Compliance** com normas de gestão documental

### 18.2. Benefícios Principais

#### 18.2.1. Para a Organização
- Eliminação de documentos perdidos
- Transparência total no fluxo de processos
- Redução significativa no tempo de tramitação
- Facilidade na preparação para auditorias
- Padronização dos processos organizacionais

#### 18.2.2. Para os Usuários
- Interface simples e intuitiva
- Acesso rápido às informações necessárias
- Mobilidade através de interface web
- Redução de trabalho manual repetitivo
- Maior controle sobre prazos e deadlines

#### 18.2.3. Para a Administração
- Visão executiva completa dos processos
- Relatórios automáticos de performance
- Controle total sobre usuários e permissões
- Backup automático e segurança dos dados
- Facilidade de manutenção e suporte

### 18.3. Impacto Organizacional

A implementação do DocFlow promove uma transformação digital significativa na gestão documental, eliminando processos manuais suscetíveis a erros e criando um ambiente de trabalho mais eficiente e controlado. O sistema estabelece uma base sólida para futuras expansões e integrações, posicionando a organização para crescimento sustentável.

### 18.4. Compromisso com a Qualidade

Este documento representa o comprometimento com a excelência no desenvolvimento e manutenção do sistema DocFlow. Todas as regras aqui estabelecidas devem ser rigorosamente seguidas para garantir a integridade, segurança e eficiência do sistema ao longo de sua vida útil.

---

**Documento:** REGRAS-DE-NEGOCIO.md  
**Versão:** 1.0  
**Data:** Janeiro 2024  
**Autor:** Equipe de Desenvolvimento DocFlow  
**Status:** Aprovado  
**Próxima Revisão:** Julho 2024

---

*Este documento contém informações confidenciais e proprietárias. A reprodução ou distribuição sem autorização é estritamente proibida.*
