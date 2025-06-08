const express = require('express');
const router = express.Router();
const path = require('path');

// Importando rotas
const tableRoutes = require('./tableRoutes');

// Configuração para servir arquivos estáticos
router.use(express.static(path.join(__dirname, '../public')));

// Rotas da API para as tabelas
router.use('/api', tableRoutes);

// Rota para página de demonstração (movida para /demo)
router.get('/demo', (req, res) => {
  res.render('pages/page1', {
    pageTitle: 'Task-It! - Gerenciador de Tarefas',
    content: '../pages/page1'
  });
});

// Rota para a página sobre
router.get('/about', (req, res) => {
  res.render('pages/page2', {
    pageTitle: 'Sobre o Task-It!',
    content: '../pages/page2'
  });
});

// Rota para visualização das tabelas do banco de dados
router.get('/tables', (req, res) => {
  res.render('tables', {
    pageTitle: 'Task-It! - Tabelas do Banco de Dados'
  });
});

const TaskController = require('../controllers/taskController');

// =====================================================
// ROTAS PARA O CRUD DE TAREFAS
// =====================================================

// Rotas especiais (DEVEM vir ANTES das rotas com parâmetros :id)
router.get('/tarefas/upcoming', TaskController.getUpcomingTasks);
router.get('/tarefas/stats/summary', TaskController.getTaskStats);

// Rotas de filtros e busca (com parâmetros específicos)
router.get('/tarefas/category/:categoryId', TaskController.getTasksByCategory);
router.get('/tarefas/status/:status', TaskController.getTasksByStatus);
router.get('/tarefas/priority/:priority', TaskController.getTasksByPriority);

// Rotas básicas de CRUD (rotas com :id devem vir por último)
router.post('/tarefas', TaskController.createTask);
router.get('/tarefas', TaskController.getAllTasks);
router.get('/tarefas/:id', TaskController.getTaskById);
router.put('/tarefas/:id', TaskController.updateTask);
router.delete('/tarefas/:id', TaskController.deleteTask);

// Rotas específicas para ações (com :id)
router.patch('/tarefas/:id/complete', TaskController.markAsCompleted);

// Manter compatibilidade com nome antigo
router.get('/tarefas/:id/buscar', TaskController.buscarTarefa);

// =====================================================
// ROTAS PARA USUÁRIOS
// =====================================================
const UserController = require('../controllers/userController');

// Rotas de autenticação
router.post('/auth/login', UserController.login);
router.post('/auth/register', UserController.createUser);

// Rotas CRUD de usuários
router.get('/users', UserController.getAllUsers);
router.get('/users/:id', UserController.getUserById);
router.post('/users', UserController.createUser);
router.put('/users/:id', UserController.updateUser);
router.patch('/users/:id/password', UserController.updatePassword);
router.delete('/users/:id', UserController.deleteUser);

// Rotas de estatísticas de usuários
router.get('/users/:id/stats', UserController.getUserStats);

// =====================================================
// ROTAS PARA CATEGORIAS
// =====================================================
const CategoryController = require('../controllers/categoryController');

// Rotas especiais (devem vir antes das rotas com :id)
router.get('/categories/most-used', CategoryController.getMostUsedCategories);
router.get('/categories/search', CategoryController.searchCategories);
router.get('/categories/stats', CategoryController.getCategoryStats);
router.get('/categories/colors', CategoryController.getAvailableColors);

// Rotas CRUD de categorias
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.post('/categories', CategoryController.createCategory);
router.put('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

// =====================================================
// ROTAS PARA TAGS
// =====================================================
const TagController = require('../controllers/tagController');

// Rotas especiais (devem vir antes das rotas com :id)
router.get('/tags/most-used', TagController.getMostUsedTags);
router.get('/tags/search', TagController.searchTags);
router.get('/tags/stats', TagController.getTagStats);

// Rotas CRUD de tags
router.get('/tags', TagController.getAllTags);
router.get('/tags/:id', TagController.getTagById);
router.post('/tags', TagController.createTag);
router.put('/tags/:id', TagController.updateTag);
router.delete('/tags/:id', TagController.deleteTag);

// Rotas específicas de tags
router.get('/tags/:id/tasks', TagController.getTasksWithTag);
router.get('/tasks/:taskId/tags', TagController.getTagsByTask);
router.post('/tasks/:taskId/tags', TagController.addTagsToTask);
router.delete('/tasks/:taskId/tags/:tagId', TagController.removeTagFromTask);

// =====================================================
// ROTAS PARA CHECKLISTS
// =====================================================
const ChecklistController = require('../controllers/checklistController');

// Rotas especiais
router.get('/checklists/user-stats', ChecklistController.getUserChecklistStats);

// Rotas de checklist por tarefa
router.get('/tasks/:taskId/checklist', ChecklistController.getChecklistByTask);
router.post('/tasks/:taskId/checklist', ChecklistController.createChecklistItem);
router.get('/tasks/:taskId/checklist/stats', ChecklistController.getTaskChecklistStats);
router.post('/tasks/:taskId/checklist/reorder', ChecklistController.reorderChecklist);
router.patch('/tasks/:taskId/checklist/mark-all', ChecklistController.markAllChecklistItems);
router.delete('/tasks/:taskId/checklist/all', ChecklistController.deleteAllChecklistItems);

// Rotas CRUD de itens de checklist
router.get('/checklist/:id', ChecklistController.getChecklistItemById);
router.put('/checklist/:id', ChecklistController.updateChecklistItem);
router.patch('/checklist/:id/toggle', ChecklistController.toggleChecklistItem);
router.delete('/checklist/:id', ChecklistController.deleteChecklistItem);

// =====================================================
// ROTAS PARA ANOTAÇÕES
// =====================================================
const AnotacaoController = require('../controllers/anotacaoController');

// Rotas especiais
router.get('/anotacoes/user', AnotacaoController.getAnotacoesByUser);
router.get('/anotacoes/search', AnotacaoController.searchAnotacoes);
router.get('/anotacoes/stats', AnotacaoController.getAnotacaoStats);
router.get('/anotacoes/recent', AnotacaoController.getRecentAnotacoes);
router.get('/anotacoes/stats/period', AnotacaoController.getAnotacaoStatsByPeriod);

// Rotas de anotações por tarefa
router.get('/tasks/:taskId/anotacoes', AnotacaoController.getAnotacoesByTask);
router.post('/tasks/:taskId/anotacoes', AnotacaoController.createAnotacao);
router.delete('/tasks/:taskId/anotacoes/all', AnotacaoController.deleteAllAnotacoesFromTask);

// Rotas CRUD de anotações
router.get('/anotacoes/:id', AnotacaoController.getAnotacaoById);
router.put('/anotacoes/:id', AnotacaoController.updateAnotacao);
router.delete('/anotacoes/:id', AnotacaoController.deleteAnotacao);

// =====================================================
// ROTAS DO FRONTEND
// =====================================================

// Página de autenticação (login/cadastro)
router.get('/auth', (req, res) => {
    res.render('pages/auth', {
        title: 'Task-It! - Login',
        bodyClass: 'auth-page'
    });
});

// Dashboard principal (rota raiz)
router.get('/', (req, res) => {
    res.render('pages/dashboard', {
        title: 'Task-It! - Dashboard',
        bodyClass: 'dashboard-page',
        additionalCSS: ['/css/dashboard.css'],
        additionalJS: ['/js/dashboard.js']
    });
});

// Página de calendário
router.get('/calendar', (req, res) => {
    res.render('pages/calendar', {
        title: 'Task-It! - Calendário',
        bodyClass: 'calendar-page',
        additionalCSS: ['/css/calendar.css'],
        additionalJS: ['/js/calendar.js']
    });
});

// Página de criação/edição de tarefas
router.get('/tasks/new', (req, res) => {
    res.render('pages/task-form', {
        title: 'Task-It! - Nova Tarefa',
        bodyClass: 'task-form-page',
        mode: 'create',
        additionalCSS: ['/css/tasks.css'],
        additionalJS: ['/js/task-form.js']
    });
});

router.get('/tasks/:id/edit', (req, res) => {
    res.render('pages/task-form', {
        title: 'Task-It! - Editar Tarefa',
        bodyClass: 'task-form-page',
        mode: 'edit',
        taskId: req.params.id,
        additionalCSS: ['/css/tasks.css'],
        additionalJS: ['/js/task-form.js']
    });
});

// Página de visualização de tarefa
router.get('/tasks/:id', (req, res) => {
    res.render('pages/task-detail', {
        title: 'Task-It! - Detalhes da Tarefa',
        bodyClass: 'task-detail-page',
        taskId: req.params.id,
        additionalCSS: ['/css/tasks.css'],
        additionalJS: ['/js/task-detail.js']
    });
});

// Rota de teste para o frontend
router.get('/test', (req, res) => {
    res.sendFile('test.html', { root: './public' });
});

// Exportar o router
module.exports = router;