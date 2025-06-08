/**
 * Controller de Anotações
 * Responsável por processar as requisições HTTP relacionadas às anotações
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const Anotacao = require('../models/Anotacao');

/**
 * Lista todas as anotações de uma tarefa
 */
exports.getAnotacoesByTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const anotacoes = await Anotacao.getByTask(taskId);
        
        res.status(200).json({
            success: true,
            data: anotacoes,
            count: anotacoes.length
        });
    } catch (err) {
        console.error('Erro ao buscar anotações:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca uma anotação específica pelo ID
 */
exports.getAnotacaoById = async (req, res) => {
    try {
        const anotacao = await Anotacao.getById(req.params.id);
        
        if (!anotacao) {
            return res.status(404).json({ 
                success: false,
                message: 'Anotação não encontrada' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: anotacao
        });
    } catch (err) {
        console.error('Erro ao buscar anotação:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Cria uma nova anotação
 */
exports.createAnotacao = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const userId = req.user?.id || 1; // TODO: Usar ID do usuário autenticado
        const anotacaoData = {
            content: req.body.content
        };

        // Validação básica dos dados
        if (!anotacaoData.content || anotacaoData.content.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Conteúdo da anotação é obrigatório' 
            });
        }

        const newAnotacao = await Anotacao.create(anotacaoData, taskId, userId);
        res.status(201).json({
            success: true,
            data: newAnotacao,
            message: 'Anotação criada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao criar anotação:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Atualiza uma anotação existente
 */
exports.updateAnotacao = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const anotacaoData = {
            content: req.body.content
        };

        // Validação básica dos dados
        if (anotacaoData.content && anotacaoData.content.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Conteúdo da anotação não pode estar vazio' 
            });
        }

        const updatedAnotacao = await Anotacao.update(req.params.id, anotacaoData, userId);
        
        if (!updatedAnotacao) {
            return res.status(404).json({ 
                success: false,
                message: 'Anotação não encontrada ou você não tem permissão para editá-la' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedAnotacao,
            message: 'Anotação atualizada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao atualizar anotação:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove uma anotação
 */
exports.deleteAnotacao = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const deletedAnotacao = await Anotacao.delete(req.params.id, userId);
        
        if (!deletedAnotacao) {
            return res.status(404).json({ 
                success: false,
                message: 'Anotação não encontrada ou você não tem permissão para removê-la' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Anotação deletada com sucesso',
            data: deletedAnotacao
        });
    } catch (err) {
        console.error('Erro ao deletar anotação:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém todas as anotações de um usuário
 */
exports.getAnotacoesByUser = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const limit = req.query.limit || 50;
        const anotacoes = await Anotacao.getByUser(userId, limit);
        
        res.status(200).json({
            success: true,
            data: anotacoes,
            count: anotacoes.length
        });
    } catch (err) {
        console.error('Erro ao buscar anotações do usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca anotações por conteúdo
 */
exports.searchAnotacoes = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const searchTerm = req.query.q;
        
        if (!searchTerm) {
            return res.status(400).json({ 
                success: false,
                error: 'Termo de busca é obrigatório' 
            });
        }
        
        const anotacoes = await Anotacao.search(searchTerm, userId);
        
        res.status(200).json({
            success: true,
            data: anotacoes,
            count: anotacoes.length,
            searchTerm: searchTerm
        });
    } catch (err) {
        console.error('Erro ao buscar anotações:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém estatísticas das anotações do usuário
 */
exports.getAnotacaoStats = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const stats = await Anotacao.getUserStats(userId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas das anotações:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém as anotações mais recentes do usuário
 */
exports.getRecentAnotacoes = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const limit = req.query.limit || 10;
        const anotacoes = await Anotacao.getRecent(userId, limit);
        
        res.status(200).json({
            success: true,
            data: anotacoes,
            count: anotacoes.length
        });
    } catch (err) {
        console.error('Erro ao buscar anotações recentes:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove todas as anotações de uma tarefa
 */
exports.deleteAllAnotacoesFromTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const deletedCount = await Anotacao.deleteAllFromTask(taskId);
        
        res.status(200).json({
            success: true,
            message: `${deletedCount} anotações removidas com sucesso`,
            deletedCount: deletedCount
        });
    } catch (err) {
        console.error('Erro ao remover todas as anotações da tarefa:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém estatísticas de anotações por período
 */
exports.getAnotacaoStatsByPeriod = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const period = req.query.period || 'month'; // week, month, year
        
        const validPeriods = ['week', 'month', 'year'];
        if (!validPeriods.includes(period)) {
            return res.status(400).json({ 
                success: false,
                error: 'Período deve ser: week, month ou year' 
            });
        }
        
        const stats = await Anotacao.getStatsByPeriod(userId, period);
        
        res.status(200).json({
            success: true,
            data: stats,
            period: period
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas por período:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};
