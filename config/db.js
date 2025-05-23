/**
 * Configuração da conexão com o banco de dados PostgreSQL
 * Utiliza o pacote 'pg' para criar um pool de conexões
 */

const { Pool } = require('pg');
require('dotenv').config();

// Verifica se deve usar SSL na conexão com o banco
const isSSL = process.env.DB_SSL === 'true';

// Criação do pool de conexões com o PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,          // Usuário do banco
  host: process.env.DB_HOST,          // Host do banco
  database: process.env.DB_DATABASE,   // Nome do banco
  password: process.env.DB_PASSWORD,   // Senha do banco
  port: process.env.DB_PORT,          // Porta do banco
  ssl: isSSL ? { rejectUnauthorized: false } : false, // Configuração SSL
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
