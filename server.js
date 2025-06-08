// Arquivo principal do servidor Express
// Responsável por configurar e inicializar o servidor web com todas as middlewares necessárias

// Importando o framework Express para criar o servidor web
const express = require('express');
const cors = require('cors');               // Para permitir requisições cross-origin
require('dotenv').config();                 // Carrega variáveis de ambiente
const path = require('path');

// Inicialização da aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;      // Porta do servidor, default 3000

// Middleware de segurança para permitir requisições cross-origin
app.use(cors());

// Configuração do parser de JSON e URL encoded para requisições
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do EJS
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração do banco de dados
const db = require('./config/db');

// Rotas
const routes = require('./routes/index');
app.use('/', routes);

// Middleware para tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Conecta ao banco de dados e inicializa o servidor
db.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  });