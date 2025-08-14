# Contribuindo com o DocFlow

Obrigado por considerar contribuir com o DocFlow! Este documento fornece diretrizes para contribuições.

## 🚀 Como Contribuir

### 1. Fork o Projeto
```bash
git clone https://github.com/frizen94/docflow.git
cd docflow
```

### 2. Crie uma Branch para sua Feature
```bash
git checkout -b feature/nova-funcionalidade
```

### 3. Configuração do Ambiente

#### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

#### Instalação
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações
npm run db:push

# Iniciar em desenvolvimento
npm run dev
```

### 4. Padrões de Código

#### TypeScript
- Use tipos explícitos sempre que possível
- Prefira interfaces para objetos complexos
- Use enums para constantes relacionadas

#### React
- Componentes funcionais com hooks
- Use React Hook Form para formulários
- Implemente loading states adequados

#### Backend
- Validação com Zod em todas as rotas
- Use o padrão Repository através do DocumentService
- Implemente logs adequados para auditoria

### 5. Testes

```bash
# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage
```

### 6. Commit e Pull Request

#### Padrão de Commit
```
tipo(escopo): descrição curta

Descrição detalhada se necessário

Closes #123
```

Tipos válidos:
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `docs`: documentação
- `style`: formatação
- `refactor`: refatoração
- `test`: testes
- `chore`: manutenção

#### Pull Request
1. Atualize a documentação se necessário
2. Adicione testes para novas funcionalidades
3. Verifique se todos os testes passam
4. Descreva claramente as mudanças

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] Dashboard analítico avançado
- [ ] Relatórios personalizáveis
- [ ] Integração com assinatura digital
- [ ] API REST completa
- [ ] Mobile app
- [ ] Notificações em tempo real

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Performance monitoring
- [ ] Backup automatizado

## 🐛 Reportando Bugs

Antes de reportar um bug:
1. Verifique se já não existe uma issue similar
2. Use o template de bug report
3. Inclua passos para reproduzir
4. Adicione screenshots se relevante

## 💡 Sugerindo Melhorias

Para sugerir melhorias:
1. Use o template de feature request
2. Explique o problema que resolve
3. Descreva a solução proposta
4. Considere alternativas

## 📞 Contato

- Email: suporte@docflow.com.br
- Issues: [GitHub Issues](https://github.com/frizen94/docflow/issues)
- Discussões: [GitHub Discussions](https://github.com/frizen94/docflow/discussions)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.