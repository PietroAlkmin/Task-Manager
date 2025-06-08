/**
 * Controller de Tags
 * Responsável por processar as requisições HTTP relacionadas às tags
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const Tag = require('../models/Tag');

/**
 * Lista todas as tags do usuário
 */
exports.getAllTags = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // TODO: Usar ID do usuário autenticado
        const tags = await Tag.getAll(userId);
        res.status(200).json({
            success: true,
            data: tags,
            count: tags.length
        });
    } catch (err) {
        console.error('Erro ao buscar tags:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca uma tag específica pelo ID
 */
exports.getTagById = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const tag = await Tag.getById(req.params.id, userId);
        
        if (!tag) {
            return res.status(404).json({ 
                success: false,
                message: 'Tag não encontrada' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: tag
        });
    } catch (err) {
        console.error('Erro ao buscar tag:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Cria uma nova tag
 */
exports.createTag = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const tagData = {
            nome: req.body.nome,
            cor: req.body.cor || '#8B3DFF'
        };

        // Validação básica dos dados
        if (!tagData.nome || tagData.nome.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Nome da tag é obrigatório' 
            });
        }

        // Verificar se nome já existe para este usuário
        const nameExists = await Tag.nameExists(tagData.nome, userId);
        if (nameExists) {
            return res.status(400).json({ 
                success: false,
                error: 'Já existe uma tag com este nome' 
            });
        }

        // Validar formato da cor (hexadecimal)
        if (tagData.cor && !/^#[0-9A-F]{6}$/i.test(tagData.cor)) {
            return res.status(400).json({ 
                success: false,
                error: 'Cor deve estar no formato hexadecimal (#RRGGBB)' 
            });
        }

        const newTag = await Tag.create(tagData, userId);
        res.status(201).json({
            success: true,
            data: newTag,
            message: 'Tag criada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao criar tag:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Atualiza uma tag existente
 */
exports.updateTag = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const tagData = {
            nome: req.body.nome,
            cor: req.body.cor
        };

        // Validação básica dos dados
        if (tagData.nome && tagData.nome.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Nome da tag não pode estar vazio' 
            });
        }

        // Verificar se nome já existe para este usuário (excluindo a tag atual)
        if (tagData.nome) {
            const nameExists = await Tag.nameExists(tagData.nome, userId, req.params.id);
            if (nameExists) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Já existe uma tag com este nome' 
                });
            }
        }

        // Validar formato da cor (hexadecimal)
        if (tagData.cor && !/^#[0-9A-F]{6}$/i.test(tagData.cor)) {
            return res.status(400).json({ 
                success: false,
                error: 'Cor deve estar no formato hexadecimal (#RRGGBB)' 
            });
        }

        const updatedTag = await Tag.update(req.params.id, tagData, userId);
        
        if (!updatedTag) {
            return res.status(404).json({ 
                success: false,
                message: 'Tag não encontrada' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedTag,
            message: 'Tag atualizada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao atualizar tag:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove uma tag
 */
exports.deleteTag = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const deletedTag = await Tag.delete(req.params.id, userId);
        
        if (!deletedTag) {
            return res.status(404).json({ 
                success: false,
                message: 'Tag não encontrada' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Tag deletada com sucesso',
            data: deletedTag
        });
    } catch (err) {
        console.error('Erro ao deletar tag:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca tags de uma tarefa específica
 */
exports.getTagsByTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const tags = await Tag.getByTask(taskId);
        
        res.status(200).json({
            success: true,
            data: tags,
            count: tags.length
        });
    } catch (err) {
        console.error('Erro ao buscar tags da tarefa:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Associa tags a uma tarefa
 */
exports.addTagsToTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { tagIds } = req.body;

        if (!Array.isArray(tagIds)) {
            return res.status(400).json({ 
                success: false,
                error: 'tagIds deve ser um array' 
            });
        }

        const success = await Tag.addToTask(taskId, tagIds);
        
        if (!success) {
            return res.status(400).json({ 
                success: false,
                error: 'Erro ao associar tags à tarefa' 
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Tags associadas à tarefa com sucesso'
        });
    } catch (err) {
        console.error('Erro ao associar tags à tarefa:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove uma tag de uma tarefa
 */
exports.removeTagFromTask = async (req, res) => {
    try {
        const { taskId, tagId } = req.params;
        const success = await Tag.removeFromTask(taskId, tagId);
        
        if (!success) {
            return res.status(404).json({ 
                success: false,
                message: 'Associação não encontrada' 
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Tag removida da tarefa com sucesso'
        });
    } catch (err) {
        console.error('Erro ao remover tag da tarefa:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca tags mais utilizadas
 */
exports.getMostUsedTags = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const limit = req.query.limit || 10;
        const tags = await Tag.getMostUsed(userId, limit);
        
        res.status(200).json({
            success: true,
            data: tags,
            count: tags.length
        });
    } catch (err) {
        console.error('Erro ao buscar tags mais utilizadas:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca tags por nome
 */
exports.searchTags = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const searchTerm = req.query.q;
        
        if (!searchTerm) {
            return res.status(400).json({ 
                success: false,
                error: 'Termo de busca é obrigatório' 
            });
        }
        
        const tags = await Tag.search(searchTerm, userId);
        
        res.status(200).json({
            success: true,
            data: tags,
            count: tags.length,
            searchTerm: searchTerm
        });
    } catch (err) {
        console.error('Erro ao buscar tags:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém estatísticas das tags
 */
exports.getTagStats = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const stats = await Tag.getStats(userId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas das tags:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém tarefas que possuem uma tag específica
 */
exports.getTasksWithTag = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const tagId = req.params.id;
        const tasks = await Tag.getTasksWithTag(tagId, userId);
        
        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (err) {
        console.error('Erro ao buscar tarefas com tag:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};
