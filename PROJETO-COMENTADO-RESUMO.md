# 📝 PROJETO MVC COMENTADO - RESUMO EXECUTIVO

## 🏗️ ARQUITETURA DO PROJETO

### FLUXO DE DADOS (REQUEST → RESPONSE):
```
Frontend (HTML/JS) → Routes → Controller → Service → Repository → Database
     ↓                                                                ↓
User Interface    ←  JSON Response  ←  HTTP Status  ←  SQL Result  ←  PostgreSQL
```

## 📁 ESTRUTURA DE ARQUIVOS COMENTADOS

### 1. **server.js** - PONTO DE ENTRADA
```javascript
// ✅ Configuração do Express
// ✅ Middleware de JSON parsing
// ✅ Registra rotas (/users, /)
// ✅ Configuração de arquivos estáticos
// ✅ Middleware de tratamento de erros
// ✅ Verificação de conexão com banco
```

### 2. **routes/userRoutes.js** - DEFINIÇÃO DE ENDPOINTS
```javascript
// ✅ GET /users - Lista todos
// ✅ GET /users/:id - Busca por ID  
// ✅ POST /users - Cria novo
// ✅ PUT /users/:id - Atualiza
// ✅ DELETE /users/:id - Remove
// ✅ Injeção de dependência (Repository → Service → Controller)
```

### 3. **controllers/userController.js** - CAMADA HTTP
```javascript
// ✅ Recebe requisições HTTP (req, res)
// ✅ Validação básica de parâmetros
// ✅ Chama serviços de negócio
// ✅ Retorna respostas JSON com status codes corretos
// ✅ Tratamento de erros centralizado
```

### 4. **repositories/userRepository.js** - CAMADA DE DADOS
```javascript
// ✅ Queries SQL parametrizadas (evita SQL injection)
// ✅ Operações CRUD no PostgreSQL
// ✅ Tratamento específico de erros do banco
// ✅ Validação de conexão
// ✅ Métodos: findAll, findById, create, update, delete, findByEmail
```

### 5. **config/db.js** - CONFIGURAÇÃO DO BANCO
```javascript
// ✅ Pool de conexões PostgreSQL
// ✅ Configuração via variáveis de ambiente
// ✅ Suporte a SSL para produção
// ✅ Exporta métodos query() e connect()
```

### 6. **public/js/main.js** - FRONTEND INTERATIVO
```javascript
// ✅ Classe UserManager para gerenciar CRUD
// ✅ Fetch API para chamadas assíncronas
// ✅ Manipulação do DOM
// ✅ Animações CSS
// ✅ Event listeners para botões
```

## 🔄 PRINCIPAIS OPERAÇÕES COMENTADAS

### ➕ CRIAR USUÁRIO (POST):
1. **Frontend**: Coleta dados do formulário
2. **Routes**: `POST /users` → chama controller.createUser()
3. **Controller**: Valida req.body → chama service.createUser()
4. **Service**: Aplica regras de negócio → chama repository.create()
5. **Repository**: Executa `INSERT INTO users...` → retorna usuário criado
6. **Response**: Status 201 + dados do usuário em JSON

### 📋 LISTAR USUÁRIOS (GET):
1. **Frontend**: Chama `fetch('/users')`
2. **Routes**: `GET /users` → chama controller.getAllUsers()
3. **Controller**: Chama service.getAllUsers()
4. **Repository**: Executa `SELECT * FROM users ORDER BY id`
5. **Response**: Status 200 + array de usuários

### ✏️ ATUALIZAR USUÁRIO (PUT):
1. **Frontend**: Envia dados via `fetch('/users/:id', {method: 'PUT'})`
2. **Controller**: Valida ID e dados → chama service.updateUser()
3. **Repository**: Constrói UPDATE dinâmico → executa query
4. **Response**: Status 200 + usuário atualizado OU 404 se não encontrado

### 🗑️ DELETAR USUÁRIO (DELETE):
1. **Frontend**: Confirma ação → `fetch('/users/:id', {method: 'DELETE'})`
2. **Repository**: Executa `DELETE FROM users WHERE id = $1 RETURNING *`
3. **Response**: Status 200 + confirmação OU 404 se não encontrado

## 🚨 TRATAMENTO DE ERROS COMENTADO

### CÓDIGOS DE STATUS HTTP:
- **200**: Operação bem-sucedida
- **201**: Recurso criado com sucesso  
- **400**: Dados inválidos ou ausentes
- **404**: Recurso não encontrado
- **409**: Conflito (ex: email já existe)
- **500**: Erro interno do servidor

### ERROS ESPECÍFICOS DO POSTGRESQL:
- **ECONNREFUSED**: Banco fora do ar
- **42P01**: Tabela não existe
- **23505**: Violação de constraint UNIQUE
- **23502**: Campo obrigatório não fornecido
- **22P02**: Formato de UUID inválido

## 🎯 PADRÕES DE CÓDIGO COMENTADOS

### ASYNC/AWAIT:
```javascript
// ✅ Sempre usar try/catch com async/await
// ✅ await em todas as operações de banco
// ✅ Propagação adequada de erros
```

### QUERIES PARAMETRIZADAS:
```javascript
// ✅ Usar $1, $2, $3 nos comandos SQL
// ✅ Passar valores em array separado
// ✅ Evita SQL injection
```

### VALIDAÇÕES:
```javascript
// ✅ Verificar se dados obrigatórios existem
// ✅ Validar IDs antes de usar
// ✅ Tratar casos de null/undefined
```

## 💡 DICAS PARA PROVA

### 🔄 ORDEM DE DESENVOLVIMENTO:
1. **SQL**: Criar tabela no banco
2. **Repository**: Implementar queries básicas
3. **Controller**: Criar endpoints HTTP
4. **Routes**: Conectar URLs aos controllers
5. **Frontend**: Implementar interface e fetch()

### ⚡ DEBUGGING RÁPIDO:
1. **Console.log** em cada camada
2. **Testar endpoints** no navegador/Postman
3. **Verificar conexão** com banco primeiro
4. **Validar JSON** nas requisições

### 🎯 PONTOS CRÍTICOS:
- **Não esquecer** `.bind(controller)` nas rotas
- **Validar parâmetros** antes de usar
- **Usar RETURNING*** nos INSERTs/UPDATEs
- **Testar casos de erro** (404, 400, etc.)

## 🚀 COMANDOS ESSENCIAIS

```bash
# Instalar dependências
npm install express pg dotenv

# Executar migrations
node scripts/runMigration.js dev

# Iniciar servidor
node server.js

# Acessar aplicação
http://localhost:3000
```

---
**✅ COM TODOS ESSES COMENTÁRIOS, VOCÊ TEM TOTAL CONTROLE SOBRE CADA LINHA DO CÓDIGO!**
