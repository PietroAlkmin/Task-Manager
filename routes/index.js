const express = require('express');
const router = express.Router();
const path = require('path');

// Configuração para servir arquivos estáticos
router.use(express.static(path.join(__dirname, '../public')));

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

// Importar outras rotas
const userRoutes = require('./userRoutes');
router.use('/users', userRoutes);

// Exportar o router
module.exports = router;