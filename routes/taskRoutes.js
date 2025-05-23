const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Listar todas as tarefas do usuário
router.get('/', taskController.getAllTasks);

// Buscar uma tarefa específica
router.get('/:id', taskController.getTaskById);

// Criar uma nova tarefa
router.post('/', taskController.createTask);

// Atualizar uma tarefa
router.put('/:id', taskController.updateTask);

// Deletar uma tarefa
router.delete('/:id', taskController.deleteTask);

// Listar tarefas por categoria
router.get('/category/:categoryId', taskController.getTasksByCategory);

// Listar tarefas por status
router.get('/status/:status', taskController.getTasksByStatus);

module.exports = router;
