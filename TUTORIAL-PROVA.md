

# 🎯 GUIA PRÁTICO - ENDPOINTS & CRUD COM JAVASCRIPT

## 📋 FOCO DA PROVA: CRIAR FUNCIONALIDADES RAPIDAMENTE

### ESTRUTURA ESSENCIAL:
```
projeto/
├── controllers/     - Lógica dos endpoints
├── routes/          - Definição das rotas  
├── config/          - Conexão com banco
├── public/          - Frontend (HTML/CSS/JS)
└── scripts/         - SQL para criar tabelas
```

## � 1. CONTROLLER SIMPLES (SEM VALIDAÇÃO)

### controllers/[entidade]Controller.js
```javascript
// ⚠️ SUBSTITUA "produto" pela sua entidade
class ProdutoController {
  // Constructor recebe o repository para acessar o banco de dados
  constructor(repository) {
    this.repository = repository; // Guarda a referência do repository
  }

  // GET /produtos - Endpoint para listar todos os produtos
  async listarTodos(req, res) {
    try {
      // Chama o repository para buscar todos os produtos no banco
      const produtos = await this.repository.buscarTodos();
      // Retorna os produtos em formato JSON com status 200 (OK)
      res.json(produtos);
    } catch (error) {
      // Em caso de erro, retorna status 500 (Internal Server Error)
      res.status(500).json({ erro: error.message });
    }
  }

  // GET /produtos/:id - Endpoint para buscar um produto específico por ID
  async buscarPorId(req, res) {
    try {
      // Extrai o ID dos parâmetros da URL (req.params)
      const { id } = req.params;
      // Busca o produto no banco usando o ID
      const produto = await this.repository.buscarPorId(id);
      
      // Se não encontrou o produto, retorna erro 404 (Not Found)
      if (!produto) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      
      // Se encontrou, retorna o produto
      res.json(produto);
    } catch (error) {
      // Erro interno do servidor
      res.status(500).json({ erro: error.message });
    }
  }

  // POST /produtos - Endpoint para criar um novo produto
  async criar(req, res) {
    try {
      // Pega os dados enviados no corpo da requisição (req.body)
      const dados = req.body;
      // Chama o repository para criar o produto no banco
      const novoProduto = await this.repository.criar(dados);
      // Retorna o produto criado com status 201 (Created)
      res.status(201).json(novoProduto);
    } catch (error) {
      // Erro de validação ou dados inválidos - status 400 (Bad Request)
      res.status(400).json({ erro: error.message });
    }
  }

  // PUT /produtos/:id - Endpoint para atualizar um produto existente
  async atualizar(req, res) {
    try {
      // Pega o ID da URL e os dados do corpo da requisição
      const { id } = req.params;
      const dados = req.body;
      // Chama o repository para atualizar o produto
      const produtoAtualizado = await this.repository.atualizar(id, dados);
      
      // Se não encontrou o produto para atualizar, retorna 404
      if (!produtoAtualizado) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      
      // Retorna o produto atualizado
      res.json(produtoAtualizado);
    } catch (error) {
      // Erro de validação ou dados inválidos
      res.status(400).json({ erro: error.message });
    }
  }

  // DELETE /produtos/:id - Endpoint para deletar um produto
  async deletar(req, res) {
    try {
      // Pega o ID do produto a ser deletado
      const { id } = req.params;
      // Chama o repository para deletar do banco
      const produtoDeletado = await this.repository.deletar(id);
      
      // Se não encontrou o produto para deletar, retorna 404
      if (!produtoDeletado) {
        return res.status(404).json({ erro: 'Produto não encontrado' });
      }
      
      // Confirma que o produto foi deletado
      res.json({ mensagem: 'Produto deletado com sucesso' });
    } catch (error) {
      // Erro interno do servidor
      res.status(500).json({ erro: error.message });
    }
  }
}

// Exporta a classe para ser usada em outros arquivos
module.exports = ProdutoController;
```
```

## 🗄️ 2. REPOSITORY DIRETO (ACESSO AO BANCO)

### repositories/[entidade]Repository.js
```javascript
// Importa a configuração de conexão com o banco de dados
const db = require('../config/db');

// ⚠️ SUBSTITUA "produto" e "produtos" pela sua entidade
class ProdutoRepository {
  
  // Método para buscar todos os produtos da tabela
  async buscarTodos() {
    // Executa query SQL para selecionar todos os registros
    // ORDER BY id garante que os resultados venham ordenados
    const resultado = await db.query('SELECT * FROM produtos ORDER BY id');
    // Retorna apenas as linhas do resultado (array de objetos)
    return resultado.rows;
  }

  // Método para buscar um produto específico pelo ID
  async buscarPorId(id) {
    // Query SQL com parâmetro ($1) para evitar SQL injection
    // O segundo parâmetro [id] substitui o $1 na query
    const resultado = await db.query('SELECT * FROM produtos WHERE id = $1', [id]);
    // Retorna apenas o primeiro resultado (ou undefined se não encontrar)
    return resultado.rows[0];
  }

  // Método para criar um novo produto no banco
  async criar(dados) {
    // ⚠️ AJUSTE OS CAMPOS CONFORME SUA TABELA
    // Desestruturação para extrair os campos do objeto dados
    const { nome, preco, categoria } = dados;
    
    // INSERT com RETURNING * para retornar o registro criado
    // Os $1, $2, $3 são substituídos pelos valores do array
    const resultado = await db.query(
      'INSERT INTO produtos (nome, preco, categoria) VALUES ($1, $2, $3) RETURNING *',
      [nome, preco, categoria]
    );
    // Retorna o produto recém-criado (com ID gerado automaticamente)
    return resultado.rows[0];
  }

  // Método para atualizar um produto existente
  async atualizar(id, dados) {
    // ⚠️ AJUSTE OS CAMPOS CONFORME SUA TABELA
    // Extrai os novos valores dos dados
    const { nome, preco, categoria } = dados;
    
    // UPDATE com updated_at = NOW() para marcar quando foi atualizado
    // WHERE id = $4 especifica qual registro atualizar
    const resultado = await db.query(
      'UPDATE produtos SET nome = $1, preco = $2, categoria = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [nome, preco, categoria, id]
    );
    // Retorna o produto atualizado (ou undefined se ID não existir)
    return resultado.rows[0];
  }

  // Método para deletar um produto pelo ID
  async deletar(id) {
    // DELETE com RETURNING * para retornar o registro que foi deletado
    const resultado = await db.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
    // Retorna o produto deletado (ou undefined se ID não existir)
    return resultado.rows[0];
  }
}

// Exporta a classe para ser usada em outros arquivos
module.exports = ProdutoRepository;
```

## 🛣️ 3. ROTAS SIMPLES

### routes/[entidade]Routes.js
```javascript
// Importa o módulo express para criar as rotas
const express = require('express');
// Cria um router - objeto que gerencia as rotas
const router = express.Router();

// ⚠️ IMPORTE SEU CONTROLLER E REPOSITORY
// Importa as classes necessárias para o funcionamento
const ProdutoController = require('../controllers/produtoController');
const ProdutoRepository = require('../repositories/produtoRepository');

// Instancia o repository e passa para o controller
// Padrão de injeção de dependência: controller depende do repository
const produtoController = new ProdutoController(new ProdutoRepository());

// ⚠️ DEFINIR AS ROTAS (CRUD COMPLETO)
// GET / - Lista todos os produtos
// .bind(produtoController) é necessário para manter o contexto 'this'
router.get('/', produtoController.listarTodos.bind(produtoController));

// GET /:id - Busca um produto específico pelo ID
// :id é um parâmetro de rota que será acessível em req.params.id
router.get('/:id', produtoController.buscarPorId.bind(produtoController));

// POST / - Cria um novo produto
// Os dados virão no corpo da requisição (req.body)
router.post('/', produtoController.criar.bind(produtoController));

// PUT /:id - Atualiza um produto existente
// Combina ID da URL com dados do corpo da requisição
router.put('/:id', produtoController.atualizar.bind(produtoController));

// DELETE /:id - Deleta um produto pelo ID
router.delete('/:id', produtoController.deletar.bind(produtoController));

// Exporta o router para ser usado no server.js
module.exports = router;
```

## ⚙️ 4. CONFIGURAR NO SERVER.JS

```javascript
// Importa o framework Express para criar o servidor web
const express = require('express');
// Cria uma instância da aplicação Express
const app = express();

// Middleware para JSON
// Permite que a aplicação entenda requisições com corpo em JSON
// Sem isso, req.body ficaria undefined
app.use(express.json());

// ⚠️ IMPORTAR E USAR SUAS ROTAS
// Importa o arquivo de rotas dos produtos
const produtoRoutes = require('./routes/produtoRoutes');
// Registra as rotas com prefixo '/api/produtos'
// Todas as rotas definidas em produtoRoutes ficarão acessíveis em /api/produtos/*
app.use('/api/produtos', produtoRoutes);

// Servir arquivos estáticos (frontend)
// Permite que arquivos da pasta 'public' sejam servidos diretamente
// Ex: public/index.html fica acessível em http://localhost:3000/index.html
app.use(express.static('public'));

// Define a porta do servidor
// Usa a variável de ambiente PORT ou 3000 como padrão
const PORT = process.env.PORT || 3000;

// Inicia o servidor na porta especificada
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});
```
```

## 🌐 5. FRONTEND COM FETCH() - CHAMADAS ASSÍNCRONAS

### public/index.html
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Produtos</title>
    <style>
        /* CSS básico para deixar a interface mais apresentável */
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        button { padding: 10px 15px; margin: 5px; cursor: pointer; }
        input, select { padding: 8px; margin: 5px; }
        .produto-item { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sistema de Produtos</h1>
        
        <!-- FORMULÁRIO PARA CRIAR/EDITAR -->
        <div>
            <h2>Adicionar Produto</h2>
            <!-- Campo hidden para guardar o ID quando estiver editando -->
            <input type="hidden" id="produtoId">
            <!-- Campos do formulário - ajuste conforme sua entidade -->
            <input type="text" id="nome" placeholder="Nome do produto">
            <input type="number" id="preco" placeholder="Preço">
            <input type="text" id="categoria" placeholder="Categoria">
            <!-- Botões para salvar e cancelar -->
            <button onclick="salvarProduto()">Salvar</button>
            <button onclick="cancelarEdicao()">Cancelar</button>
        </div>

        <!-- LISTA DE PRODUTOS -->
        <div>
            <h2>Lista de Produtos</h2>
            <!-- Botão para recarregar a lista -->
            <button onclick="carregarProdutos()">Atualizar Lista</button>
            <!-- Div onde os produtos serão exibidos dinamicamente -->
            <div id="listaProdutos"></div>
        </div>
    </div>

    <!-- Importa o arquivo JavaScript com as funções -->
    <script src="script.js"></script>
</body>
</html>
```

### public/script.js - JAVASCRIPT COM FETCH()
```javascript
// ⚠️ BASE_URL - AJUSTE CONFORME SUA API
// URL base para todas as requisições à API
const BASE_URL = '/api/produtos';

// 🔄 CARREGAR TODOS OS PRODUTOS (GET)
async function carregarProdutos() {
    try {
        // Faz requisição GET para buscar todos os produtos
        // fetch() retorna uma Promise, por isso usamos await
        const response = await fetch(BASE_URL);
        
        // Converte a resposta para JSON
        // response.json() também retorna uma Promise
        const produtos = await response.json();
        
        // Pega o elemento HTML onde vamos mostrar os produtos
        const listaProdutos = document.getElementById('listaProdutos');
        
        // Limpa o conteúdo atual da lista
        listaProdutos.innerHTML = '';
        
        // Para cada produto no array, cria um elemento HTML
        produtos.forEach(produto => {
            // Cria uma div para cada produto
            const div = document.createElement('div');
            div.className = 'produto-item'; // Aplica a classe CSS
            
            // Define o HTML interno da div com os dados do produto
            // Template literals (`) permitem usar ${} para inserir variáveis
            div.innerHTML = `
                <h3>${produto.nome}</h3>
                <p>Preço: R$ ${produto.preco}</p>
                <p>Categoria: ${produto.categoria}</p>
                <button onclick="editarProduto('${produto.id}')">Editar</button>
                <button onclick="deletarProduto('${produto.id}')">Deletar</button>
            `;
            
            // Adiciona a div criada à lista de produtos
            listaProdutos.appendChild(div);
        });
    } catch (error) {
        // Se der erro na requisição, mostra um alerta
        alert('Erro ao carregar produtos: ' + error.message);
    }
}

// ➕ CRIAR OU ATUALIZAR PRODUTO (POST/PUT)
async function salvarProduto() {
    // Pega os valores dos campos do formulário
    const id = document.getElementById('produtoId').value;
    const nome = document.getElementById('nome').value;
    const preco = document.getElementById('preco').value;
    const categoria = document.getElementById('categoria').value;
    
    // Validação simples - verifica se todos os campos estão preenchidos
    if (!nome || !preco || !categoria) {
        alert('Preencha todos os campos!');
        return; // Para a execução da função
    }
    
    // Cria o objeto com os dados a serem enviados
    // parseFloat() converte string para número decimal
    const dados = { nome, preco: parseFloat(preco), categoria };
    
    try {
        let response; // Variável para guardar a resposta
        
        if (id) {
            // Se tem ID, é uma ATUALIZAÇÃO (PUT)
            response = await fetch(`${BASE_URL}/${id}`, {
                method: 'PUT', // Método HTTP para atualização
                headers: {
                    // Informa que estamos enviando JSON
                    'Content-Type': 'application/json'
                },
                // Converte o objeto para string JSON
                body: JSON.stringify(dados)
            });
        } else {
            // Se não tem ID, é uma CRIAÇÃO (POST)
            response = await fetch(BASE_URL, {
                method: 'POST', // Método HTTP para criação
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
        }
        
        // Verifica se a requisição foi bem-sucedida
        if (response.ok) {
            alert('Produto salvo com sucesso!');
            limparFormulario(); // Limpa os campos
            carregarProdutos(); // Recarrega a lista
        } else {
            // Se houve erro, pega a mensagem de erro da resposta
            const erro = await response.json();
            alert('Erro: ' + erro.erro);
        }
    } catch (error) {
        // Erro de rede ou outro problema
        alert('Erro ao salvar produto: ' + error.message);
    }
}

// ✏️ EDITAR PRODUTO (CARREGAR DADOS NO FORMULÁRIO)
async function editarProduto(id) {
    try {
        // Busca os dados do produto específico
        const response = await fetch(`${BASE_URL}/${id}`);
        const produto = await response.json();
        
        // Preenche os campos do formulário com os dados do produto
        document.getElementById('produtoId').value = produto.id;
        document.getElementById('nome').value = produto.nome;
        document.getElementById('preco').value = produto.preco;
        document.getElementById('categoria').value = produto.categoria;
    } catch (error) {
        alert('Erro ao carregar produto: ' + error.message);
    }
}

// 🗑️ DELETAR PRODUTO (DELETE)
async function deletarProduto(id) {
    // Confirma antes de deletar (boa prática de UX)
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
        return; // Se cancelar, não faz nada
    }
    
    try {
        // Faz requisição DELETE para o endpoint específico
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE' // Método HTTP para deleção
        });
        
        if (response.ok) {
            alert('Produto deletado com sucesso!');
            carregarProdutos(); // Recarrega a lista
        } else {
            const erro = await response.json();
            alert('Erro: ' + erro.erro);
        }
    } catch (error) {
        alert('Erro ao deletar produto: ' + error.message);
    }
}

// 🧹 LIMPAR FORMULÁRIO
function limparFormulario() {
    // Reseta todos os campos do formulário
    document.getElementById('produtoId').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('categoria').value = '';
}

// Função para cancelar edição
function cancelarEdicao() {
    limparFormulario(); // Apenas limpa o formulário
}

// CARREGAR PRODUTOS AO INICIAR A PÁGINA
// addEventListener espera o DOM estar completamente carregado
// Então executa a função carregarProdutos automaticamente
document.addEventListener('DOMContentLoaded', carregarProdutos);
```
```

## 🗄️ 6. SQL PARA CRIAR TABELA

### scripts/criar_tabela.sql
```sql
-- ⚠️ SUBSTITUA "produtos" E OS CAMPOS PELA SUA ENTIDADE

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados de exemplo
INSERT INTO produtos (nome, preco, categoria) VALUES 
  ('Notebook', 2500.00, 'Eletrônicos'),
  ('Mouse', 50.00, 'Acessórios'),
  ('Teclado', 120.00, 'Acessórios');
```

## ⚙️ 7. CONFIGURAÇÃO DO BANCO (config/db.js)
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'meu_projeto',
  password: process.env.DB_PASSWORD || 'senha',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
```

## 🚀 CHECKLIST RÁPIDO PARA PROVA

### ✅ ORDEM DE IMPLEMENTAÇÃO:
1. **SQL**: Criar tabela no banco
2. **Repository**: Métodos de acesso ao banco
3. **Controller**: Lógica dos endpoints
4. **Routes**: Definir as rotas da API
5. **Server.js**: Conectar tudo
6. **Frontend**: HTML + JavaScript com fetch()

### ✅ ENDPOINTS ESSENCIAIS:
- `GET /api/produtos` → Listar todos
- `GET /api/produtos/:id` → Buscar por ID
- `POST /api/produtos` → Criar novo
- `PUT /api/produtos/:id` → Atualizar
- `DELETE /api/produtos/:id` → Deletar

### ✅ FETCH() PATTERNS - COMENTADOS:
```javascript
// GET - Buscar dados do servidor
// Usado para carregar listas ou buscar registros específicos
const response = await fetch('/api/produtos');
const produtos = await response.json(); // Converte resposta para objeto JS

// POST - Criar novo registro no servidor
// Envia dados no corpo da requisição para criar algo novo
await fetch('/api/produtos', {
  method: 'POST',                           // Especifica que é criação
  headers: { 'Content-Type': 'application/json' }, // Tipo do conteúdo
  body: JSON.stringify(dados)               // Converte objeto para JSON
});

// PUT - Atualizar registro existente
// Similar ao POST, mas atualiza um registro específico (por ID)
await fetch(`/api/produtos/${id}`, {
  method: 'PUT',                            // Especifica que é atualização
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(dados)               // Novos dados para atualizar
});

// DELETE - Deletar registro
// Remove um registro específico do servidor
await fetch(`/api/produtos/${id}`, {
  method: 'DELETE'                          // Só precisa do método, sem body
});
```

## 🔥 COMANDOS ESSENCIAIS
```bash
# Instalar as dependências do projeto
npm install express pg dotenv    

# Iniciar o servidor (deve mostrar "Servidor rodando na porta 3000")
node server.js                  

# Se usar nodemon para restart automático (opcional)
npm install -g nodemon
nodemon server.js
```

## ⚡ SUBSTITUIÇÕES RÁPIDAS PARA QUALQUER ENTIDADE

**Para criar uma nova entidade, substitua em TODOS os arquivos:**
- `produto/produtos` → sua entidade (ex: `cliente/clientes`)
- `nome, preco, categoria` → seus campos (ex: `nome, email, telefone`)
- `ProdutoController` → SuaEntidadeController (ex: `ClienteController`)
- `ProdutoRepository` → SuaEntidadeRepository (ex: `ClienteRepository`)
- `/api/produtos` → `/api/suaentidade` (ex: `/api/clientes`)

**💡 DICA DE PROVA**: 
1. Copie um exemplo funcionando
2. Use "Ctrl+H" (Find & Replace) no VS Code para trocar todos os nomes de uma vez
3. Teste um endpoint por vez
4. Sempre verifique se o banco está conectado primeiro!
```

### 5. ROUTES - routes/[NOME_ENTIDADE_LOWER]Routes.js
```javascript
const express = require('express');
const router = express.Router();

// ⚠️ IMPORTE AS CLASSES DA SUA ENTIDADE
const [NOME_ENTIDADE]Repository = require('../repositories/[NOME_ENTIDADE_LOWER]Repository');
const [NOME_ENTIDADE]Service = require('../services/[NOME_ENTIDADE_LOWER]Service');
const [NOME_ENTIDADE]Controller = require('../controllers/[NOME_ENTIDADE_LOWER]Controller');

// ⚠️ SUBSTITUA PELOS NOMES DA SUA ENTIDADE
const controller = new [NOME_ENTIDADE]Controller(new [NOME_ENTIDADE]Service(new [NOME_ENTIDADE]Repository()));

// ⚠️ SUBSTITUA OS NOMES DOS MÉTODOS PELOS DA SUA ENTIDADE
router.get('/', controller.getAll[NOME_ENTIDADE]s.bind(controller));
router.get('/:id', controller.get[NOME_ENTIDADE]ById.bind(controller));
router.post('/', controller.create[NOME_ENTIDADE].bind(controller));
router.put('/:id', controller.update[NOME_ENTIDADE].bind(controller));
router.delete('/:id', controller.delete[NOME_ENTIDADE].bind(controller));

module.exports = router;
```

### 6. MIGRATION - scripts/migrate.sql
```sql
-- ⚠️ SUBSTITUA "NOME_TABELA" PELO NOME DA SUA TABELA
-- ⚠️ SUBSTITUA OS CAMPOS PELOS DA SUA ENTIDADE

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS [NOME_TABELA] (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  [CAMPO1] VARCHAR(100) NOT NULL,
  [CAMPO2] VARCHAR(100) UNIQUE NOT NULL,
  -- ➕ ADICIONE MAIS CAMPOS CONFORME NECESSÁRIO
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_[NOME_TABELA]_updated_at ON [NOME_TABELA];
CREATE TRIGGER update_[NOME_TABELA]_updated_at 
    BEFORE UPDATE ON [NOME_TABELA]
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ⚠️ DADOS DE TESTE - SUBSTITUA PELOS VALORES DA SUA ENTIDADE
INSERT INTO [NOME_TABELA] ([CAMPO1], [CAMPO2])
VALUES 
  ('[VALOR1]', '[VALOR2]'),
  ('[VALOR3]', '[VALOR4]');
```

### 7. CONECTAR NO SERVER.JS
```javascript
// ⚠️ NO SEU server.js, ADICIONE ESTAS LINHAS:

const express = require('express');
const app = express();

app.use(express.json());

// ⚠️ SUBSTITUA PELOS NOMES DA SUA ENTIDADE
const [NOME_ENTIDADE_LOWER]Routes = require('./routes/[NOME_ENTIDADE_LOWER]Routes');
app.use('/[NOME_ENTIDADE_LOWER]s', [NOME_ENTIDADE_LOWER]Routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```

## � EXEMPLO PRÁTICO: CRIANDO UMA ENTIDADE "PRODUTO"

### Substituições necessárias:
- `[NOME_ENTIDADE]` → `Produto`
- `[NOME_ENTIDADE_LOWER]` → `produto` 
- `[NOME_TABELA]` → `produtos`
- `[CAMPO1]` → `nome`
- `[CAMPO2]` → `preco`
- Adicionar campo: `categoria`

### Resultado do Model:
```javascript
const produtoSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required(),
  preco: Joi.number().positive().required(),
  categoria: Joi.string().required()
});

class ProdutoModel {
  static validate(data, isUpdate = false) {
    // ...código do template...
  }
}
```

## 🚨 PASSOS OBRIGATÓRIOS PARA QUALQUER ENTIDADE

### 1. Defina sua entidade:
- **Nome da entidade**: `______`
- **Nome da tabela**: `______`
- **Campos principais**: `______, ______, ______`

### 2. Crie os arquivos na ordem:
1. ✅ Model (validação)
2. ✅ Repository (banco)  
3. ✅ Service (regras)
4. ✅ Controller (HTTP)
5. ✅ Routes (rotas)
6. ✅ Migration (SQL)

### 3. Teste os endpoints:
- `GET /[ENTIDADE]s` - Listar todos
- `GET /[ENTIDADE]s/:id` - Buscar por ID
- `POST /[ENTIDADE]s` - Criar novo
- `PUT /[ENTIDADE]s/:id` - Atualizar
- `DELETE /[ENTIDADE]s/:id` - Deletar

## 💡 DICAS IMPORTANTES

1. **Nomenclatura consistente**: Sempre use o mesmo padrão de nomes
2. **Validação**: Todo dado deve passar pelo Model antes do Repository
3. **Tratamento de erro**: Use try/catch em todos os métodos
4. **UUID**: Sempre use UUID como chave primária
5. **Bind**: Não esqueça do `.bind(controller)` nas rotas

**✅ LISTA DE VERIFICAÇÃO FINAL:**
- [ ] Model criado com validação Joi
- [ ] Repository com CRUD completo
- [ ] Service com regras de negócio
- [ ] Controller com tratamento HTTP
- [ ] Routes configuradas corretamente
- [ ] Migration executada
- [ ] Endpoints testados
