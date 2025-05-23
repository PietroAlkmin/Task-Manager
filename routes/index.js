const express = require('express');
const router = express.Router();
const path = require('path');

// Importando rotas
const tableRoutes = require('./tableRoutes');

// Configuração para servir arquivos estáticos
router.use(express.static(path.join(__dirname, '../public')));

// Rotas da API para as tabelas
router.use('/api', tableRoutes);

// Rota principal
router.get('/', (req, res) => {
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

const TarefaController = require('../controllers/taskController');

// Rotas para o CRUD de tarefas
router.post('/tarefas', TarefaController.createTask);
router.get('/tarefas', TarefaController.getAllTasks);
router.get('/tarefas/:id', TarefaController.buscarTarefa);
router.put('/tarefas/:id', TarefaController.updateTask);
router.delete('/tarefas/:id', TarefaController.deleteTask);

// Rota de teste para o frontend
router.get('/test', (req, res) => {
    res.sendFile('test.html', { root: './public' });
});

// Exportar o router
module.exports = router;