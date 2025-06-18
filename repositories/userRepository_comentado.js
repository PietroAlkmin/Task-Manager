// Importa a configuração de conexão com o banco de dados
const db = require('../config/db');

/**
 * Repository para operações de banco de dados relacionadas a usuários
 * Camada responsável por executar queries SQL e interagir diretamente com o PostgreSQL
 * Segue o padrão Repository para isolar a lógica de acesso a dados
 */
class UserRepository {
  /**
   * Constructor que inicializa a conexão com o banco
   */
  constructor() {
    this.db = db; // Armazena a referência da conexão com o banco
  }

  /**
   * Busca todos os usuários na tabela users
   * @returns {Array} Lista de todos os usuários
   */
  async findAll() {
    try {
      // Verifica se a conexão com o banco está disponível
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      // Executa query SQL para buscar todos os usuários ordenados por ID
      const result = await this.db.query('SELECT * FROM users ORDER BY id');
      // Retorna as linhas do resultado ou array vazio se não houver dados
      return result.rows || [];
    } catch (error) {
      // Tratamento específico para diferentes tipos de erro do PostgreSQL
      
      // Erros de conexão de rede
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      // Erro quando a tabela não existe (código 42P01)
      if (error.code === '42P01') {
        throw new Error('Tabela de usuários não encontrada');
      }
      // Propaga outros erros com contexto adicional
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  /**
   * Busca um usuário específico pelo ID
   * @param {string} id - UUID do usuário a ser buscado
   * @returns {Object|null} Dados do usuário ou null se não encontrado
   */
  async findById(id) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      // Validação básica do parâmetro ID
      if (!id) {
        throw new Error('ID é obrigatório para busca');
      }

      // Query parametrizada para evitar SQL injection
      // $1 será substituído pelo valor do array [id]
      const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
      // Retorna o primeiro resultado ou null se não encontrar
      return result.rows[0] || null;
    } catch (error) {
      // Tratamento de erros específicos
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      // Erro de formato inválido do UUID (código 22P02)
      if (error.code === '22P02') {
        throw new Error('ID deve ser um número válido');
      }
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  /**
   * Cria um novo usuário na base de dados
   * @param {Object} userData - Dados do usuário a ser criado
   * @param {string} userData.name - Nome do usuário
   * @param {string} userData.email - Email do usuário
   * @returns {Object} Dados do usuário criado (incluindo ID gerado)
   */
  async create(userData) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      // Validação dos dados obrigatórios
      if (!userData || !userData.name || !userData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      // INSERT com RETURNING * para retornar o registro criado
      // O UUID será gerado automaticamente pelo banco
      const result = await this.db.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [userData.name, userData.email]
      );

      // Verifica se o INSERT foi bem-sucedido
      if (!result.rows || result.rows.length === 0) {
        throw new Error('Falha ao criar usuário no banco de dados');
      }

      // Retorna o usuário recém-criado com ID e timestamps
      return result.rows[0];
    } catch (error) {
      // Tratamento de erros específicos do PostgreSQL
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      // Violação de constraint UNIQUE (email já existe)
      if (error.code === '23505') {
        throw new Error('Email já está em uso');
      }
      // Violação de constraint NOT NULL
      if (error.code === '23502') {
        throw new Error('Dados obrigatórios não fornecidos');
      }
      // Preserva erros de validação já tratados
      if (error.message.includes('obrigatório')) {
        throw error;
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  /**
   * Atualiza os dados de um usuário existente
   * @param {string} id - UUID do usuário a ser atualizado
   * @param {Object} userData - Novos dados do usuário
   * @returns {Object|null} Dados do usuário atualizado ou null se não encontrado
   */
  async update(id, userData) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!id) {
        throw new Error('ID é obrigatório para atualização');
      }

      if (!userData || typeof userData !== 'object') {
        throw new Error('Dados para atualização são obrigatórios');
      }

      // Constrói dinamicamente a query UPDATE baseada nos campos fornecidos
      const fields = [];  // Array para armazenar as cláusulas SET
      const values = [];  // Array para armazenar os valores dos parâmetros
      let paramCount = 1; // Contador para os parâmetros ($1, $2, etc.)

      // Adiciona campos que foram fornecidos para atualização
      if (userData.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(userData.name);
      }
      if (userData.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(userData.email);
      }

      // Verifica se pelo menos um campo foi fornecido para atualização
      if (fields.length === 0) {
        throw new Error('Nenhum campo para atualizar');
      }

      // Adiciona o ID como último parâmetro
      values.push(id);
      // Constrói a query final juntando os campos com vírgula
      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      // Executa a query de atualização
      const result = await this.db.query(query, values);
      // Retorna o usuário atualizado ou null se não encontrado
      return result.rows[0] || null;
    } catch (error) {
      // Tratamento de erros específicos
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      // Email já existe em outro registro
      if (error.code === '23505') {
        throw new Error('Email já está em uso');
      }
      // Formato de ID inválido
      if (error.code === '22P02') {
        throw new Error('ID deve ser um número válido');
      }
      // Preserva erros de validação já tratados
      if (error.message.includes('obrigatório') || error.message.includes('Nenhum campo')) {
        throw error;
      }
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  /**
   * Remove um usuário da base de dados
   * @param {string} id - UUID do usuário a ser deletado
   * @returns {Object|null} Dados do usuário deletado ou null se não encontrado
   */
  async delete(id) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!id) {
        throw new Error('ID é obrigatório para exclusão');
      }

      // DELETE com RETURNING * para retornar os dados do registro deletado
      const result = await this.db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      // Retorna o usuário deletado ou null se não encontrado
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.code === '22P02') {
        throw new Error('ID deve ser um número válido');
      }
      if (error.message.includes('obrigatório')) {
        throw error;
      }
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  /**
   * Busca um usuário pelo endereço de email
   * @param {string} email - Email do usuário a ser buscado
   * @returns {Object|null} Dados do usuário ou null se não encontrado
   */
  async findByEmail(email) {
    try {
      if (!this.db) {
        throw new Error('Conexão com banco de dados não disponível');
      }

      if (!email) {
        throw new Error('Email é obrigatório para busca');
      }

      // Query para buscar usuário por email (usado para validar duplicatas)
      const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error('Erro de conexão com o banco de dados');
      }
      if (error.message.includes('obrigatório')) {
        throw error;
      }
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }
  }
}

// Exporta a classe para ser usada em outros módulos
module.exports = UserRepository;
