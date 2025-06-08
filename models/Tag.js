/**
 * Model Tag - Representa a entidade Tag no sistema
 * Responsável por toda interação com a tabela 'tags' no banco de dados
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const pool = require('../config/db');

class Tag {
    /**
     * Retorna todas as tags de um usuário
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de tags
     */
    static async getAll(userId) {
        const query = `
            SELECT 
                t.*,
                COUNT(tt.task_id) as task_count
            FROM tags t
            LEFT JOIN task_tags tt ON t.id = tt.tag_id
            LEFT JOIN tasks ta ON tt.task_id = ta.id AND ta.status != 'concluida'
            WHERE t.user_id = $1
            GROUP BY t.id
            ORDER BY t.nome ASC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    /**
     * Busca uma tag específica pelo ID e usuário
     * @param {number} id - ID da tag
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Tag encontrada ou null
     */
    static async getById(id, userId) {
        const query = `
            SELECT 
                t.*,
                COUNT(tt.task_id) as task_count
            FROM tags t
            LEFT JOIN task_tags tt ON t.id = tt.tag_id
            WHERE t.id = $1 AND t.user_id = $2
            GROUP BY t.id
        `;
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    /**
     * Cria uma nova tag no banco de dados
     * @param {Object} tagData - Dados da tag
     * @param {number} userId - ID do usuário
     * @returns {Object} Tag criada
     */
    static async create(tagData, userId) {
        const { nome, cor = '#8B3DFF' } = tagData;

        const query = `
            INSERT INTO tags (nome, cor, user_id) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await pool.query(query, [nome, cor, userId]);
        return result.rows[0];
    }

    /**
     * Atualiza uma tag existente
     * @param {number} id - ID da tag
     * @param {Object} tagData - Dados atualizados da tag
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Tag atualizada ou null
     */
    static async update(id, tagData, userId) {
        const { nome, cor } = tagData;

        const query = `
            UPDATE tags 
            SET nome = $1, cor = $2
            WHERE id = $3 AND user_id = $4 
            RETURNING *
        `;
        const result = await pool.query(query, [nome, cor, id, userId]);
        return result.rows[0];
    }

    /**
     * Remove uma tag do banco de dados
     * @param {number} id - ID da tag
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Tag removida ou null
     */
    static async delete(id, userId) {
        const query = `
            DELETE FROM tags 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    /**
     * Verifica se um nome de tag já existe para o usuário
     * @param {string} nome - Nome da tag
     * @param {number} userId - ID do usuário
     * @param {number} excludeId - ID da tag a excluir da verificação (para updates)
     * @returns {boolean} True se nome já existe
     */
    static async nameExists(nome, userId, excludeId = null) {
        let query = 'SELECT id FROM tags WHERE nome = $1 AND user_id = $2';
        let params = [nome, userId];

        if (excludeId) {
            query += ' AND id != $3';
            params.push(excludeId);
        }

        const result = await pool.query(query, params);
        return result.rows.length > 0;
    }

    /**
     * Obtém tags de uma tarefa específica
     * @param {number} taskId - ID da tarefa
     * @returns {Array} Lista de tags da tarefa
     */
    static async getByTask(taskId) {
        const query = `
            SELECT t.*
            FROM tags t
            INNER JOIN task_tags tt ON t.id = tt.tag_id
            WHERE tt.task_id = $1
            ORDER BY t.nome ASC
        `;
        const result = await pool.query(query, [taskId]);
        return result.rows;
    }

    /**
     * Associa tags a uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {Array} tagIds - Array de IDs das tags
     * @returns {boolean} Sucesso da operação
     */
    static async addToTask(taskId, tagIds) {
        if (!tagIds || tagIds.length === 0) {
            return true;
        }

        // Primeiro, remove todas as tags existentes da tarefa
        await pool.query('DELETE FROM task_tags WHERE task_id = $1', [taskId]);

        // Depois, adiciona as novas tags
        const values = tagIds.map((tagId, index) => `($1, $${index + 2})`).join(', ');
        const query = `INSERT INTO task_tags (task_id, tag_id) VALUES ${values}`;
        const params = [taskId, ...tagIds];

        await pool.query(query, params);
        return true;
    }

    /**
     * Remove uma tag de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {number} tagId - ID da tag
     * @returns {boolean} Sucesso da operação
     */
    static async removeFromTask(taskId, tagId) {
        const query = 'DELETE FROM task_tags WHERE task_id = $1 AND tag_id = $2';
        const result = await pool.query(query, [taskId, tagId]);
        return result.rowCount > 0;
    }

    /**
     * Obtém tags mais utilizadas pelo usuário
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de resultados (padrão: 10)
     * @returns {Array} Lista de tags mais utilizadas
     */
    static async getMostUsed(userId, limit = 10) {
        const query = `
            SELECT 
                t.*,
                COUNT(tt.task_id) as task_count
            FROM tags t
            LEFT JOIN task_tags tt ON t.id = tt.tag_id
            WHERE t.user_id = $1
            GROUP BY t.id
            HAVING COUNT(tt.task_id) > 0
            ORDER BY task_count DESC, t.nome ASC
            LIMIT $2
        `;
        const result = await pool.query(query, [userId, limit]);
        return result.rows;
    }

    /**
     * Busca tags por nome (busca parcial)
     * @param {string} searchTerm - Termo de busca
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de tags encontradas
     */
    static async search(searchTerm, userId) {
        const query = `
            SELECT 
                t.*,
                COUNT(tt.task_id) as task_count
            FROM tags t
            LEFT JOIN task_tags tt ON t.id = tt.tag_id
            WHERE t.user_id = $1 AND t.nome ILIKE $2
            GROUP BY t.id
            ORDER BY t.nome ASC
        `;
        const result = await pool.query(query, [userId, `%${searchTerm}%`]);
        return result.rows;
    }

    /**
     * Obtém estatísticas das tags do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Estatísticas das tags
     */
    static async getStats(userId) {
        const query = `
            SELECT 
                COUNT(DISTINCT t.id) as total_tags,
                COUNT(tt.task_id) as total_tag_associations,
                (SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND id NOT IN (SELECT task_id FROM task_tags)) as tasks_without_tags
            FROM tags t
            LEFT JOIN task_tags tt ON t.id = tt.tag_id
            WHERE t.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * Obtém tarefas que possuem uma tag específica
     * @param {number} tagId - ID da tag
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de tarefas com a tag
     */
    static async getTasksWithTag(tagId, userId) {
        const query = `
            SELECT 
                ta.*,
                c.nome as category_name,
                c.cor as category_color
            FROM tasks ta
            INNER JOIN task_tags tt ON ta.id = tt.task_id
            LEFT JOIN categories c ON ta.category_id = c.id
            WHERE tt.tag_id = $1 AND ta.user_id = $2
            ORDER BY ta.criado_em DESC
        `;
        const result = await pool.query(query, [tagId, userId]);
        return result.rows;
    }
}

// Exporta a classe Tag para uso em outros módulos
module.exports = Tag;
