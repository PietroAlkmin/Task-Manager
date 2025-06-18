// Importa o helper personalizado para tratamento de erros
const ErrorHandler = require('../helpers/errorHandler');

/**
 * Controller para gerenciar operações CRUD de usuários
 * Camada responsável por receber requisições HTTP e retornar respostas
 */
class UserController {
  /**
   * Constructor que recebe o serviço de usuários por injeção de dependência
   * @param {UserService} userService - Serviço que contém a lógica de negócio
   */
  constructor(userService) {
    this.userService = userService;
  }

  /**
   * GET /users - Endpoint para listar todos os usuários
   * @param {Request} req - Objeto da requisição HTTP
   * @param {Response} res - Objeto da resposta HTTP
   */
  async getAllUsers(req, res) {
    try {
      // Chama o serviço para buscar todos os usuários
      const users = await this.userService.getAllUsers();
      // Retorna status 200 (OK) com a lista de usuários em JSON
      return res.status(200).json(users);
    } catch (error) {
      // Delega o tratamento de erro para o ErrorHandler
      ErrorHandler.handleControllerError(error, res);
    }
  }

  /**
   * GET /users/:id - Endpoint para buscar um usuário específico por ID
   * @param {Request} req - Requisição contendo o ID nos parâmetros
   * @param {Response} res - Resposta HTTP
   */
  async getUserById(req, res) {
    try {
      // Valida se o ID foi fornecido na URL
      if (!req.params.id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      // Busca o usuário pelo ID através do serviço
      const user = await this.userService.getUserById(req.params.id);
      
      if (user) {
        // Se encontrou o usuário, retorna com status 200
        return res.status(200).json(user);
      } else {
        // Se não encontrou, retorna erro 404 (Not Found)
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      // Tratamento centralizado de erros
      ErrorHandler.handleControllerError(error, res);
    }
  }

  /**
   * POST /users - Endpoint para criar um novo usuário
   * @param {Request} req - Requisição contendo os dados do usuário no body
   * @param {Response} res - Resposta HTTP
   */
  async createUser(req, res) {
    try {
      // Valida se foram enviados dados no corpo da requisição
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Dados do usuário são obrigatórios' });
      }

      // Extrai os dados do usuário do corpo da requisição
      const userData = req.body;
      // Chama o serviço para criar o usuário (inclui validações)
      const newUser = await this.userService.createUser(userData);
      // Retorna status 201 (Created) com o usuário criado
      return res.status(201).json(newUser);
    } catch (error) {
      ErrorHandler.handleControllerError(error, res);
    }
  }

  /**
   * PUT /users/:id - Endpoint para atualizar um usuário existente
   * @param {Request} req - Requisição com ID nos parâmetros e dados no body
   * @param {Response} res - Resposta HTTP
   */
  async updateUser(req, res) {
    try {
      // Valida se o ID foi fornecido
      if (!req.params.id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      // Valida se foram enviados dados para atualização
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Dados para atualização são obrigatórios' });
      }

      const userData = req.body;
      // Chama o serviço para atualizar o usuário
      const updatedUser = await this.userService.updateUser(req.params.id, userData);
      
      if (updatedUser) {
        // Se conseguiu atualizar, retorna o usuário atualizado
        return res.status(200).json(updatedUser);
      } else {
        // Se não encontrou o usuário para atualizar
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      ErrorHandler.handleControllerError(error, res);
    }
  }

  /**
   * DELETE /users/:id - Endpoint para deletar um usuário
   * @param {Request} req - Requisição contendo o ID nos parâmetros
   * @param {Response} res - Resposta HTTP
   */
  async deleteUser(req, res) {
    try {
      // Valida se o ID foi fornecido
      if (!req.params.id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      // Chama o serviço para deletar o usuário
      const deletedUser = await this.userService.deleteUser(req.params.id);
      
      if (deletedUser) {
        // Se conseguiu deletar, retorna mensagem de sucesso com os dados do usuário deletado
        return res.status(200).json({ 
          message: 'Usuário deletado com sucesso', 
          user: deletedUser 
        });
      } else {
        // Se não encontrou o usuário para deletar
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    } catch (error) {
      ErrorHandler.handleControllerError(error, res);
    }
  }
}

// Exporta a classe para ser usada em outros módulos
module.exports = UserController;
