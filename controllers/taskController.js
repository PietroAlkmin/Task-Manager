/**
 * Controller de Tarefas
 * Responsável por processar as requisições HTTP relacionadas às tarefas
 *
 * ATUALIZADO: Versão 2.0 - Consistente com novo schema e funcionalidades
 */
const Task = require('../models/Task');

/**
 * Lista todas as tarefas do usuário
 */
exports.getAllTasks = async (req, res) => {
    try {
        // TODO: Implementar autenticação e usar ID do usuário real
        const userId = req.user?.id || 1; // Fallback para desenvolvimento
        const tasks = await Task.getAll(userId);
        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (err) {
        console.error('Erro ao buscar tarefas:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Busca uma tarefa específica pelo ID
 */
exports.getTaskById = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // TODO: Usar ID do usuário autenticado
        const task = await Task.getById(req.params.id, userId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        console.error('Erro ao buscar tarefa:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Cria uma nova tarefa
 */
exports.createTask = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // TODO: Usar ID do usuário autenticado
        const taskData = {
            title: req.body.title,
            description: req.body.description,
            due_date: req.body.due_date,
            priority: req.body.priority || 'media',
            status: req.body.status || 'pendente',
            category_id: req.body.category_id,
            lembrete_minutos: req.body.lembrete_minutos || 0
        };

        // Validação básica dos dados
        if (!taskData.title || taskData.title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Título é obrigatório'
            });
        }

        // Validação de prioridade
        const validPriorities = ['baixa', 'media', 'alta'];
        if (taskData.priority && !validPriorities.includes(taskData.priority)) {
            return res.status(400).json({
                success: false,
                error: 'Prioridade deve ser: baixa, media ou alta'
            });
        }

        // Validação de status
        const validStatuses = ['pendente', 'em_andamento', 'concluida', 'cancelada'];
        if (taskData.status && !validStatuses.includes(taskData.status)) {
            return res.status(400).json({
                success: false,
                error: 'Status deve ser: pendente, em_andamento, concluida ou cancelada'
            });
        }

        const newTask = await Task.create(taskData, userId);
        res.status(201).json({
            success: true,
            data: newTask,
            message: 'Tarefa criada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao criar tarefa:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Atualiza uma tarefa existente
 */
exports.updateTask = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // TODO: Usar ID do usuário autenticado
        const taskData = {
            title: req.body.title,
            description: req.body.description,
            due_date: req.body.due_date,
            priority: req.body.priority,
            status: req.body.status,
            category_id: req.body.category_id,
            lembrete_minutos: req.body.lembrete_minutos
        };

        // Validação básica dos dados
        if (taskData.title && taskData.title.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Título não pode estar vazio'
            });
        }

        const updatedTask = await Task.update(req.params.id, taskData, userId);

        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedTask,
            message: 'Tarefa atualizada com sucesso'
        });
    } catch (err) {
        console.error('Erro ao atualizar tarefa:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Remove uma tarefa
 */
exports.deleteTask = async (req, res) => {
    try {
        const userId = req.user?.id || 1; // TODO: Usar ID do usuário autenticado
        const deletedTask = await Task.delete(req.params.id, userId);

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tarefa deletada com sucesso',
            data: deletedTask
        });
    } catch (err) {
        console.error('Erro ao deletar tarefa:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Marca uma tarefa como concluída
 */
exports.markAsCompleted = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const completedTask = await Task.markAsCompleted(req.params.id, userId);

        if (!completedTask) {
            return res.status(404).json({
                success: false,
                message: 'Tarefa não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: completedTask,
            message: 'Tarefa marcada como concluída'
        });
    } catch (err) {
        console.error('Erro ao marcar tarefa como concluída:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Busca tarefas por categoria
 */
exports.getTasksByCategory = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const tasks = await Task.getByCategory(req.params.categoryId, userId);

        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (err) {
        console.error('Erro ao buscar tarefas por categoria:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Busca tarefas por status
 */
exports.getTasksByStatus = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const tasks = await Task.getByStatus(req.params.status, userId);

        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (err) {
        console.error('Erro ao buscar tarefas por status:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Busca tarefas por prioridade
 */
exports.getTasksByPriority = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const tasks = await Task.getByPriority(req.params.priority, userId);

        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (err) {
        console.error('Erro ao buscar tarefas por prioridade:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Busca tarefas que vencem em breve
 */
exports.getUpcomingTasks = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const days = req.query.days || 7;
        const tasks = await Task.getUpcoming(userId, days);

        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length,
            days: days
        });
    } catch (err) {
        console.error('Erro ao buscar tarefas próximas do vencimento:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

/**
 * Obtém estatísticas das tarefas do usuário
 */
exports.getTaskStats = async (req, res) => {
    try {
        const userId = req.user?.id || 1;
        const stats = await Task.getStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            message: err.message
        });
    }
};

// Manter compatibilidade com nome antigo
exports.buscarTarefa = exports.getTaskById;
