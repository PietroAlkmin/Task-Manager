// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa o framework Express para criar o servidor web
const express = require('express');
// Cria uma instância da aplicação Express
const app = express();
// Módulo para trabalhar com caminhos de arquivos
const path = require('path');
// Importa helper personalizado para tratamento de erros do servidor
const ServerErrorHandler = require('./helpers/serverErrorHandler');

// Configura EJS como engine de template para renderizar views
app.set('view engine', 'ejs');
// Define o diretório onde estão os templates EJS
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir arquivos estáticos (CSS, JS, imagens) da pasta public
// Permite acessar arquivos como: http://localhost:3000/css/style.css
app.use(express.static(path.join(__dirname, 'public')));

// Função assíncrona para inicializar o servidor
async function startServer() {
  // Verifica se a conexão com o banco de dados está funcionando
  const dbConnected = await ServerErrorHandler.databaseConnectionHandler();
  
  // Se não conseguir conectar ao banco, encerra a aplicação
  if (!dbConnected) {
    console.error('❌ Falha na conexão com o banco de dados');
    process.exit(1); // Código 1 indica erro
  }

  // Middleware para parsear requisições JSON
  // Permite ler req.body em requisições POST/PUT
  app.use(express.json());

  // Importa e registra as rotas da API de usuários
  const userRoutes = require('./routes/userRoutes');
  // Todas as rotas de userRoutes ficarão sob /users
  // Ex: GET /users, POST /users, etc.
  app.use('/users', userRoutes);

  // Importa e registra as rotas do frontend
  const frontendRoutes = require('./routes/frontRoutes');
  // Rotas do frontend ficam na raiz /
  app.use('/', frontendRoutes);

  // Middleware para capturar rotas que não existem (404)
  // Deve vir DEPOIS de todas as rotas válidas
  app.use(ServerErrorHandler.notFoundHandler);

  // Middleware global para tratar erros internos do servidor (500)
  // Captura qualquer erro não tratado nas rotas
  app.use(ServerErrorHandler.globalErrorHandler);

  // Define a porta do servidor (variável de ambiente ou 3000 por padrão)
  const PORT = process.env.PORT || 3000;
  
  // Inicia o servidor HTTP na porta especificada
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/users`);
  });
}

// Chama a função para iniciar o servidor
startServer();
