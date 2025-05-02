const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS como mecanismo de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para processar JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
const routes = require('./routes/index');
app.use('/', routes);

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).render('pages/page1', {
    pageTitle: 'Página não encontrada',
    content: '../pages/page1',
    error: 'Página não encontrada'
  });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});