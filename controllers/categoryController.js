/**
 * Controller de Categorias
 * Responsável por processar as requisições HTTP relacionadas às categorias
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const Category = require('../models/Category');

/**
 * Lista todas as categorias do usuário
 */
exports.getAllCategories = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // TODO: Usar ID do usuário autenticado
        const categories = await Category.getAll(userId);
        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca uma categoria específica pelo ID
 */
exports.getCategoryById = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const category = await Category.getById(req.params.id, userId);
        
        if (!category) {
            return res.status(404).json({ 
                success: false,
                message: 'Categoria não encontrada' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (err) {
        console.error('Erro ao buscar categoria:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Cria uma nova categoria
 */
exports.createCategory = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const categoryData = {
            nome: req.body.nome,
            cor: req.body.cor || '#8B3DFF'
        };

        // Validação básica dos dados
        if (!categoryData.nome || categoryData.nome.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Nome da categoria é obrigatório' 
            });
        }

        // Verificar se nome já existe para este usuário
        const nameExists = await Category.nameExists(categoryData.nome, userId);
        if (nameExists) {
            return res.status(400).json({ 
                success: false,
                error: 'Já existe uma categoria com este nome' 
            });
        }

        // Validar formato da cor (hexadecimal)
        if (categoryData.cor && !/^#[0-9A-F]{6}$/i.test(categoryData.cor)) {
            return res.status(400).json({ 
                success: false,
                error: 'Cor deve estar no formato hexadecimal (#RRGGBB)' 
            });
        }

        const newCategory = await Category.create(categoryData, userId);
        res.status(201).json({
            success: true,
            data: newCategory,
            message: 'Categoria criada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao criar categoria:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Atualiza uma categoria existente
 */
exports.updateCategory = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const categoryData = {
            nome: req.body.nome,
            cor: req.body.cor
        };

        // Validação básica dos dados
        if (categoryData.nome && categoryData.nome.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Nome da categoria não pode estar vazio' 
            });
        }

        // Verificar se nome já existe para este usuário (excluindo a categoria atual)
        if (categoryData.nome) {
            const nameExists = await Category.nameExists(categoryData.nome, userId, req.params.id);
            if (nameExists) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Já existe uma categoria com este nome' 
                });
            }
        }

        // Validar formato da cor (hexadecimal)
        if (categoryData.cor && !/^#[0-9A-F]{6}$/i.test(categoryData.cor)) {
            return res.status(400).json({ 
                success: false,
                error: 'Cor deve estar no formato hexadecimal (#RRGGBB)' 
            });
        }

        const updatedCategory = await Category.update(req.params.id, categoryData, userId);
        
        if (!updatedCategory) {
            return res.status(404).json({ 
                success: false,
                message: 'Categoria não encontrada' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedCategory,
            message: 'Categoria atualizada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao atualizar categoria:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Remove uma categoria
 */
exports.deleteCategory = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const deletedCategory = await Category.delete(req.params.id, userId);
        
        if (!deletedCategory) {
            return res.status(404).json({ 
                success: false,
                message: 'Categoria não encontrada' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Categoria deletada com sucesso',
            data: deletedCategory
        });
    } catch (err) {
        console.error('Erro ao deletar categoria:', err);
        
        // Tratar erro específico de categoria com tarefas
        if (err.message.includes('tarefas associadas')) {
            return res.status(400).json({ 
                success: false,
                error: err.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca categorias mais utilizadas
 */
exports.getMostUsedCategories = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const limit = req.query.limit || 5;
        const categories = await Category.getMostUsed(userId, limit);
        
        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (err) {
        console.error('Erro ao buscar categorias mais utilizadas:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Busca categorias por nome
 */
exports.searchCategories = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const searchTerm = req.query.q;
        
        if (!searchTerm) {
            return res.status(400).json({ 
                success: false,
                error: 'Termo de busca é obrigatório' 
            });
        }
        
        const categories = await Category.search(searchTerm, userId);
        
        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length,
            searchTerm: searchTerm
        });
    } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém estatísticas das categorias
 */
exports.getCategoryStats = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const stats = await Category.getStats(userId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas das categorias:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};

/**
 * Obtém cores disponíveis para categorias
 */
exports.getAvailableColors = async (req, res) => {
    try {
        const colors = Category.getAvailableColors();
        
        res.status(200).json({
            success: true,
            data: colors,
            count: colors.length
        });
    } catch (err) {
        console.error('Erro ao buscar cores disponíveis:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor',
            message: err.message 
        });
    }
};
