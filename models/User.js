/**
 * Model User - Representa a entidade Usuário no sistema
 * Responsável por toda interação com a tabela 'users' no banco de dados
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const pool = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    /**
     * Retorna todos os usuários (para admin)
     * @returns {Array} Lista de usuários (sem senhas)
     */
    static async getAll() {
        const query = `
            SELECT 
                id, nome, email, criado_em, atualizado_em
            FROM users 
            ORDER BY criado_em DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    /**
     * Busca um usuário específico pelo ID
     * @param {number} id - ID do usuário
     * @returns {Object|null} Usuário encontrado ou null
     */
    static async getById(id) {
        const query = `
            SELECT 
                id, nome, email, criado_em, atualizado_em
            FROM users 
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Busca um usuário pelo email
     * @param {string} email - Email do usuário
     * @returns {Object|null} Usuário encontrado ou null
     */
    static async getByEmail(email) {
        const query = `
            SELECT 
                id, nome, email, senha, criado_em, atualizado_em
            FROM users 
            WHERE email = $1
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    /**
     * Cria um novo usuário no banco de dados
     * @param {Object} userData - Dados do usuário
     * @returns {Object} Usuário criado (sem senha)
     */
    static async create(userData) {
        const { nome, email, senha } = userData;

        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        const query = `
            INSERT INTO users (nome, email, senha) 
            VALUES ($1, $2, $3) 
            RETURNING id, nome, email, criado_em, atualizado_em
        `;
        const result = await pool.query(query, [nome, email, hashedPassword]);
        return result.rows[0];
    }

    /**
     * Atualiza um usuário existente
     * @param {number} id - ID do usuário
     * @param {Object} userData - Dados atualizados do usuário
     * @returns {Object|null} Usuário atualizado ou null
     */
    static async update(id, userData) {
        const { nome, email } = userData;

        const query = `
            UPDATE users 
            SET nome = $1, email = $2, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $3 
            RETURNING id, nome, email, criado_em, atualizado_em
        `;
        const result = await pool.query(query, [nome, email, id]);
        return result.rows[0];
    }

    /**
     * Atualiza a senha de um usuário
     * @param {number} id - ID do usuário
     * @param {string} novaSenha - Nova senha
     * @returns {boolean} Sucesso da operação
     */
    static async updatePassword(id, novaSenha) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(novaSenha, saltRounds);

        const query = `
            UPDATE users 
            SET senha = $1, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $2
        `;
        const result = await pool.query(query, [hashedPassword, id]);
        return result.rowCount > 0;
    }

    /**
     * Remove um usuário do banco de dados
     * @param {number} id - ID do usuário
     * @returns {Object|null} Usuário removido ou null
     */
    static async delete(id) {
        const query = `
            DELETE FROM users 
            WHERE id = $1 
            RETURNING id, nome, email
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Verifica se um email já está em uso
     * @param {string} email - Email a verificar
     * @param {number} excludeId - ID do usuário a excluir da verificação (para updates)
     * @returns {boolean} True se email já existe
     */
    static async emailExists(email, excludeId = null) {
        let query = 'SELECT id FROM users WHERE email = $1';
        let params = [email];

        if (excludeId) {
            query += ' AND id != $2';
            params.push(excludeId);
        }

        const result = await pool.query(query, params);
        return result.rows.length > 0;
    }

    /**
     * Autentica um usuário
     * @param {string} email - Email do usuário
     * @param {string} senha - Senha do usuário
     * @returns {Object|null} Usuário autenticado (sem senha) ou null
     */
    static async authenticate(email, senha) {
        const user = await this.getByEmail(email);
        
        if (!user) {
            return null;
        }

        const isValidPassword = await bcrypt.compare(senha, user.senha);
        
        if (!isValidPassword) {
            return null;
        }

        // Retorna usuário sem a senha
        const { senha: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Obtém estatísticas do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Estatísticas do usuário
     */
    static async getUserStats(userId) {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM tasks WHERE user_id = $1) as total_tasks,
                (SELECT COUNT(*) FROM categories WHERE user_id = $1) as total_categories,
                (SELECT COUNT(*) FROM tags WHERE user_id = $1) as total_tags,
                (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND status = 'concluida') as completed_tasks,
                (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND due_date < CURRENT_DATE AND status != 'concluida') as overdue_tasks
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }
}

// Exporta a classe User para uso em outros módulos
module.exports = User;
