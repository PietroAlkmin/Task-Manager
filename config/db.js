// Importa a classe Pool do módulo pg (driver PostgreSQL para Node.js)
const { Pool } = require('pg');
// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Verifica se SSL deve ser habilitado baseado na variável de ambiente
// Importante para bancos de dados em produção (como Heroku, Railway, etc.)
const isSSL = process.env.DB_SSL === 'true';

// Cria um pool de conexões com PostgreSQL
// Pool = gerenciador de múltiplas conexões simultâneas (mais eficiente que conexões individuais)
const pool = new Pool({
  user: process.env.DB_USER,         // Usuário do banco (ex: postgres)
  host: process.env.DB_HOST,         // Endereço do servidor (ex: localhost ou IP remoto)
  database: process.env.DB_DATABASE, // Nome do banco de dados
  password: process.env.DB_PASSWORD, // Senha do usuário do banco
  port: process.env.DB_PORT,         // Porta do PostgreSQL (padrão: 5432)
  // Configuração SSL para conexões seguras (necessário em produção)
  ssl: isSSL ? { rejectUnauthorized: false } : false,
});

// Exporta objeto com métodos para interagir com o banco
module.exports = {
  // Método principal para executar queries SQL
  // text = comando SQL, params = array com valores para substituir $1, $2, etc.
  query: (text, params) => pool.query(text, params),
  
  // Método para obter uma conexão individual do pool (raramente usado)
  connect: () => pool.connect(),
};
