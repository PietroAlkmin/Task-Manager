/**
 * Controller de Checklists
 * Responsável por processar as requisições HTTP relacionadas aos checklists
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const Checklist = require('../models/Checklist');

/**
 * Lista todos os itens de checklist de uma tarefa
 */
exports.getChecklistByTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const checklist = await Checklist.getByTask(taskId);
        
        res.status(200).json({
            success: true,
            data: checklist,
            count: checklist.length
        });
    } catch (err) {
        console.error('Erro ao buscar checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca um item de checklist específico pelo ID
 */
exports.getChecklistItemById = async (req, res) => {
    try {
        const item = await Checklist.getById(req.params.id);
        
        if (!item) {
            return res.status(404).json({ 
                success: false,
                message: 'Item de checklist não encontrado' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: item
        });
    } catch (err) {
        console.error('Erro ao buscar item de checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Cria um novo item de checklist
 */
exports.createChecklistItem = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const checklistData = {
            content: req.body.content,
            ordem: req.body.ordem
        };

        // Validação básica dos dados
        if (!checklistData.content || checklistData.content.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Conteúdo do item é obrigatório' 
            });
        }

        const newItem = await Checklist.create(checklistData, taskId);
        res.status(201).json({
            success: true,
            data: newItem,
            message: 'Item de checklist criado com sucesso'
        });
    } catch (err) {
        console.error('Erro ao criar item de checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Atualiza um item de checklist existente
 */
exports.updateChecklistItem = async (req, res) => {
    try {
        const checklistData = {
            content: req.body.content,
            completed: req.body.completed,
            ordem: req.body.ordem
        };

        // Validação básica dos dados
        if (checklistData.content && checklistData.content.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Conteúdo do item não pode estar vazio' 
            });
        }

        const updatedItem = await Checklist.update(req.params.id, checklistData);
        
        if (!updatedItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Item de checklist não encontrado' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedItem,
            message: 'Item de checklist atualizado com sucesso'
        });
    } catch (err) {
        console.error('Erro ao atualizar item de checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Marca/desmarca um item de checklist como concluído
 */
exports.toggleChecklistItem = async (req, res) => {
    try {
        const { completed } = req.body;

        if (typeof completed !== 'boolean') {
            return res.status(400).json({ 
                success: false,
                error: 'Campo "completed" deve ser um boolean' 
            });
        }

        const updatedItem = await Checklist.toggleCompleted(req.params.id, completed);
        
        if (!updatedItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Item de checklist não encontrado' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedItem,
            message: `Item ${completed ? 'marcado como concluído' : 'desmarcado'} com sucesso`
        });
    } catch (err) {
        console.error('Erro ao alterar status do item:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove um item de checklist
 */
exports.deleteChecklistItem = async (req, res) => {
    try {
        const deletedItem = await Checklist.delete(req.params.id);
        
        if (!deletedItem) {
            return res.status(404).json({ 
                success: false,
                message: 'Item de checklist não encontrado' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Item de checklist deletado com sucesso',
            data: deletedItem
        });
    } catch (err) {
        console.error('Erro ao deletar item de checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Reordena os itens de checklist de uma tarefa
 */
exports.reorderChecklist = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { itemsOrder } = req.body;

        if (!Array.isArray(itemsOrder)) {
            return res.status(400).json({ 
                success: false,
                error: 'itemsOrder deve ser um array com os IDs dos itens na nova ordem' 
            });
        }

        const success = await Checklist.reorder(taskId, itemsOrder);
        
        if (!success) {
            return res.status(400).json({ 
                success: false,
                error: 'Erro ao reordenar itens do checklist' 
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Checklist reordenado com sucesso'
        });
    } catch (err) {
        console.error('Erro ao reordenar checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém estatísticas do checklist de uma tarefa
 */
exports.getTaskChecklistStats = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const stats = await Checklist.getTaskStats(taskId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas do checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém estatísticas gerais dos checklists do usuário
 */
exports.getUserChecklistStats = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const stats = await Checklist.getUserStats(userId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas dos checklists do usuário:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Marca todos os itens de checklist de uma tarefa como concluídos/pendentes
 */
exports.markAllChecklistItems = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { completed } = req.body;

        if (typeof completed !== 'boolean') {
            return res.status(400).json({ 
                success: false,
                error: 'Campo "completed" deve ser um boolean' 
            });
        }

        const updatedCount = await Checklist.markAllAsCompleted(taskId, completed);
        
        res.status(200).json({
            success: true,
            message: `${updatedCount} itens ${completed ? 'marcados como concluídos' : 'desmarcados'} com sucesso`,
            updatedCount: updatedCount
        });
    } catch (err) {
        console.error('Erro ao marcar todos os itens:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove todos os itens de checklist de uma tarefa
 */
exports.deleteAllChecklistItems = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const deletedCount = await Checklist.deleteAllFromTask(taskId);
        
        res.status(200).json({
            success: true,
            message: `${deletedCount} itens de checklist removidos com sucesso`,
            deletedCount: deletedCount
        });
    } catch (err) {
        console.error('Erro ao remover todos os itens do checklist:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};
