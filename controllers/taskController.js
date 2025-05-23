// Controller de Tarefas
// Responsável por processar as requisições HTTP relacionadas às tarefas
const Task = require('../models/Task');

// Lista todas as tarefas do usuário
exports.getAllTasks = async (req, res) => {
    try {
        // TODO: Implementar autenticação e usar ID do usuário real
        const userId = 1;
        const tasks = await Task.getAll(userId);
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Busca uma tarefa específica pelo ID
exports.buscarTarefa = async (req, res) => {
    try {
        const userId = 1; // TODO: Usar ID do usuário autenticado
        const task = await Task.getById(req.params.id, userId);
        
        if (!task) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        
        res.status(200).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cria uma nova tarefa
exports.createTask = async (req, res) => {
    try {
        const userId = 1; // TODO: Usar ID do usuário autenticado
        const taskData = {
            title: req.body.title,
            description: req.body.description,
            due_date: req.body.due_date,
            priority: req.body.priority,
            status: req.body.status,
            category_id: req.body.category_id
        };

        // Validação básica dos dados
        if (!taskData.title) {
            return res.status(400).json({ error: 'Título é obrigatório' });
        }

        const newTask = await Task.create(taskData, userId);
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Atualiza uma tarefa existente
exports.updateTask = async (req, res) => {
    try {
        const userId = 1; // TODO: Usar ID do usuário autenticado
        const taskData = {
            title: req.body.title,
            description: req.body.description,
            due_date: req.body.due_date,
            priority: req.body.priority,
            status: req.body.status,
            category_id: req.body.category_id
        };

        const updatedTask = await Task.update(req.params.id, taskData, userId);
        
        if (!updatedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        
        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove uma tarefa
exports.deleteTask = async (req, res) => {
    try {
        const userId = 1; // TODO: Usar ID do usuário autenticado
        const deletedTask = await Task.delete(req.params.id, userId);
        
        if (!deletedTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada' });
        }
        
        res.status(200).json({ message: 'Tarefa deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
