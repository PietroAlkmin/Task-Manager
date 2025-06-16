/**
 * Controller de Usuários
 * Responsável por processar as requisições HTTP relacionadas aos usuários
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const User = require('../models/User');

/**
 * Lista todos os usuários (apenas para admin)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAll();
        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca um usuário específico pelo ID
 */
exports.getUserById = async (req, res) => {
    try {
        const user = await User.getById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Cria um novo usuário
 */
exports.createUser = async (req, res) => {
    try {
        const userData = {
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha
        };

        // Validação básica dos dados
        if (!userData.nome || userData.nome.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Nome é obrigatório' 
            });
        }

        if (!userData.email || userData.email.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Email é obrigatório' 
            });
        }

        if (!userData.senha || userData.senha.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'Senha deve ter pelo menos 6 caracteres' 
            });
        }

        // Verificar se email já existe
        const emailExists = await User.emailExists(userData.email);
        if (emailExists) {
            return res.status(400).json({ 
                success: false,
                error: 'Email já está em uso' 
            });
        }

        const newUser = await User.create(userData);
        res.status(201).json({
            success: true,
            data: newUser,
            message: 'Usuário criado com sucesso'
        });
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Atualiza um usuário existente
 */
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = {
            nome: req.body.nome,
            email: req.body.email
        };

        // Validação básica dos dados
        if (userData.nome && userData.nome.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Nome não pode estar vazio' 
            });
        }

        if (userData.email && userData.email.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Email não pode estar vazio' 
            });
        }

        // Verificar se email já existe (excluindo o usuário atual)
        if (userData.email) {
            const emailExists = await User.emailExists(userData.email, userId);
            if (emailExists) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Email já está em uso por outro usuário' 
                });
            }
        }

        const updatedUser = await User.update(userId, userData);
        
        if (!updatedUser) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedUser,
            message: 'Usuário atualizado com sucesso'
        });
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Atualiza a senha de um usuário
 */
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { novaSenha } = req.body;

        if (!novaSenha || novaSenha.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'Nova senha deve ter pelo menos 6 caracteres' 
            });
        }

        const success = await User.updatePassword(userId, novaSenha);
        
        if (!success) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado' 
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Senha atualizada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao atualizar senha:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove um usuário
 */
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.delete(req.params.id);
        
        if (!deletedUser) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuário não encontrado' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Usuário deletado com sucesso',
            data: deletedUser
        });
    } catch (err) {
        console.error('Erro ao deletar usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Autentica um usuário (login)
 */
exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ 
                success: false,
                error: 'Email e senha são obrigatórios' 
            });
        }

        const user = await User.authenticate(email, senha);
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Email ou senha inválidos' 
            });
        }
        
        // TODO: Implementar JWT ou sessão aqui
        res.status(200).json({
            success: true,
            data: user,
            message: 'Login realizado com sucesso'
        });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém estatísticas do usuário
 */
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.params.id;
        const stats = await User.getUserStats(userId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas do usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};
