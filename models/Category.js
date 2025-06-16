/**
 * Model Category - Representa a entidade Categoria no sistema
 * Responsável por toda interação com a tabela 'categories' no banco de dados
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const pool = require('../config/db');

class Category {
    /**
     * Retorna todas as categorias de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de categorias
     */
    static async getAll(userId) {
        const query = `
            SELECT 
                c.*,
                COUNT(t.id) as task_count
            FROM categories c
            LEFT JOIN tasks t ON c.id = t.category_id AND t.status != 'concluida'
            WHERE c.user_id = $1
            GROUP BY c.id
            ORDER BY c.nome ASC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    /**
     * Busca uma categoria específica pelo ID e usuário
     * @param {number} id - ID da categoria
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Categoria encontrada ou null
     */
    static async getById(id, userId) {
        const query = `
            SELECT 
                c.*,
                COUNT(t.id) as task_count
            FROM categories c
            LEFT JOIN tasks t ON c.id = t.category_id
            WHERE c.id = $1 AND c.user_id = $2
            GROUP BY c.id
        `;
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    /**
     * Cria uma nova categoria no banco de dados
     * @param {Object} categoryData - Dados da categoria
     * @param {number} userId - ID do usuário
     * @returns {Object} Categoria criada
     */
    static async create(categoryData, userId) {
        const { nome, cor = '#8B3DFF' } = categoryData;

        const query = `
            INSERT INTO categories (nome, cor, user_id) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await pool.query(query, [nome, cor, userId]);
        return result.rows[0];
    }

    /**
     * Atualiza uma categoria existente
     * @param {number} id - ID da categoria
     * @param {Object} categoryData - Dados atualizados da categoria
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Categoria atualizada ou null
     */
    static async update(id, categoryData, userId) {
        const { nome, cor } = categoryData;

        const query = `
            UPDATE categories 
            SET nome = $1, cor = $2
            WHERE id = $3 AND user_id = $4 
            RETURNING *
        `;
        const result = await pool.query(query, [nome, cor, id, userId]);
        return result.rows[0];
    }

    /**
     * Remove uma categoria do banco de dados
     * @param {number} id - ID da categoria
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Categoria removida ou null
     */
    static async delete(id, userId) {
        // Primeiro, verificar se há tarefas usando esta categoria
        const tasksQuery = 'SELECT COUNT(*) as count FROM tasks WHERE category_id = $1';
        const tasksResult = await pool.query(tasksQuery, [id]);
        
        if (parseInt(tasksResult.rows[0].count) > 0) {
            throw new Error('Não é possível excluir categoria que possui tarefas associadas');
        }

        const query = `
            DELETE FROM categories 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    /**
     * Verifica se um nome de categoria já existe para o usuário
     * @param {string} nome - Nome da categoria
     * @param {number} userId - ID do usuário
     * @param {number} excludeId - ID da categoria a excluir da verificação (para updates)
     * @returns {boolean} True se nome já existe
     */
    static async nameExists(nome, userId, excludeId = null) {
        let query = 'SELECT id FROM categories WHERE nome = $1 AND user_id = $2';
        let params = [nome, userId];

        if (excludeId) {
            query += ' AND id != $3';
            params.push(excludeId);
        }

        const result = await pool.query(query, params);
        return result.rows.length > 0;
    }

    /**
     * Obtém categorias mais utilizadas pelo usuário
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de resultados (padrão: 5)
     * @returns {Array} Lista de categorias mais utilizadas
     */
    static async getMostUsed(userId, limit = 5) {
        const query = `
            SELECT 
                c.*,
                COUNT(t.id) as task_count
            FROM categories c
            LEFT JOIN tasks t ON c.id = t.category_id
            WHERE c.user_id = $1
            GROUP BY c.id
            HAVING COUNT(t.id) > 0
            ORDER BY task_count DESC, c.nome ASC
            LIMIT $2
        `;
        const result = await pool.query(query, [userId, limit]);
        return result.rows;
    }

    /**
     * Obtém estatísticas das categorias do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Estatísticas das categorias
     */
    static async getStats(userId) {
        const query = `
            SELECT 
                COUNT(DISTINCT c.id) as total_categories,
                COUNT(t.id) as total_tasks_with_category,
                (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND category_id IS NULL) as tasks_without_category
            FROM categories c
            LEFT JOIN tasks t ON c.id = t.category_id
            WHERE c.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * Busca categorias por nome (busca parcial)
     * @param {string} searchTerm - Termo de busca
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de categorias encontradas
     */
    static async search(searchTerm, userId) {
        const query = `
            SELECT 
                c.*,
                COUNT(t.id) as task_count
            FROM categories c
            LEFT JOIN tasks t ON c.id = t.category_id
            WHERE c.user_id = $1 AND c.nome ILIKE $2
            GROUP BY c.id
            ORDER BY c.nome ASC
        `;
        const result = await pool.query(query, [userId, `%${searchTerm}%`]);
        return result.rows;
    }

    /**
     * Obtém cores disponíveis para categorias
     * @returns {Array} Lista de cores sugeridas
     */
    static getAvailableColors() {
        return [
            '#8B3DFF', // Roxo (primária)
            '#FF6B6B', // Vermelho
            '#4ECDC4', // Verde água
            '#45B7D1', // Azul
            '#96CEB4', // Verde claro
            '#FECA57', // Amarelo
            '#FF9FF3', // Rosa
            '#54A0FF', // Azul claro
            '#5F27CD', // Roxo escuro
            '#00D2D3', // Ciano
            '#FF9F43', // Laranja
            '#10AC84', // Verde
            '#EE5A24', // Laranja escuro
            '#0984E3', // Azul escuro
            '#6C5CE7'  // Roxo médio
        ];
    }
}

// Exporta a classe Category para uso em outros módulos
module.exports = Category;
