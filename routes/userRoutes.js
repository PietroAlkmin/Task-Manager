// Importa o módulo express para criar rotas
const express = require('express');
// Cria um router - objeto responsável por gerenciar as rotas
const router = express.Router();

// Importa as camadas do padrão MVC para usuários
const UserRepository = require('../repositories/userRepository'); // Acesso ao banco de dados
const UserService = require('../services/userService');           // Lógica de negócio e validações
const UserController = require('../controllers/userController');   // Controle das requisições HTTP

// Instancia o controller seguindo o padrão de injeção de dependência
// Repository → Service → Controller (cada camada depende da anterior)
const controller = new UserController(new UserService(new UserRepository()));

// DEFINIÇÃO DAS ROTAS DA API DE USUÁRIOS
// Todas essas rotas ficarão sob o prefixo /users (definido no server.js)

// GET /users - Lista todos os usuários
// .bind(controller) é necessário para manter o contexto 'this' do controller
router.get('/', controller.getAllUsers.bind(controller));

// GET /users/:id - Busca um usuário específico pelo ID
// :id é um parâmetro de rota que será acessível em req.params.id
router.get('/:id', controller.getUserById.bind(controller));

// POST /users - Cria um novo usuário
// Os dados do usuário vêm no corpo da requisição (req.body)
router.post('/', controller.createUser.bind(controller));

// PUT /users/:id - Atualiza um usuário existente
// Combina o ID da URL com os novos dados do corpo da requisição
router.put('/:id', controller.updateUser.bind(controller));

// DELETE /users/:id - Deleta um usuário pelo ID
router.delete('/:id', controller.deleteUser.bind(controller));

// Exporta o router para ser usado no arquivo principal (server.js)
module.exports = router;
