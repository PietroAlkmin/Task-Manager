/**
 * Model Anotacao - Representa a entidade Anotação no sistema
 * Responsável por toda interação com a tabela 'anotacoes' no banco de dados
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const pool = require('../config/db');

class Anotacao {
    /**
     * Retorna todas as anotações de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {Array} Lista de anotações
     */
    static async getByTask(taskId) {
        const query = `
            SELECT 
                a.*,
                u.nome as author_name
            FROM anotacoes a
            INNER JOIN users u ON a.user_id = u.id
            WHERE a.task_id = $1 
            ORDER BY a.criado_em DESC
        `;
        const result = await pool.query(query, [taskId]);
        return result.rows;
    }

    /**
     * Busca uma anotação específica pelo ID
     * @param {number} id - ID da anotação
     * @returns {Object|null} Anotação encontrada ou null
     */
    static async getById(id) {
        const query = `
            SELECT 
                a.*,
                u.nome as author_name,
                t.user_id as task_owner_id
            FROM anotacoes a
            INNER JOIN users u ON a.user_id = u.id
            INNER JOIN tasks t ON a.task_id = t.id
            WHERE a.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Cria uma nova anotação no banco de dados
     * @param {Object} anotacaoData - Dados da anotação
     * @param {number} taskId - ID da tarefa
     * @param {number} userId - ID do usuário que está criando a anotação
     * @returns {Object} Anotação criada
     */
    static async create(anotacaoData, taskId, userId) {
        const { content } = anotacaoData;

        const query = `
            INSERT INTO anotacoes (content, task_id, user_id) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await pool.query(query, [content, taskId, userId]);
        
        // Buscar a anotação criada com informações do autor
        const createdNote = await this.getById(result.rows[0].id);
        return createdNote;
    }

    /**
     * Atualiza uma anotação existente
     * @param {number} id - ID da anotação
     * @param {Object} anotacaoData - Dados atualizados da anotação
     * @param {number} userId - ID do usuário que está atualizando
     * @returns {Object|null} Anotação atualizada ou null
     */
    static async update(id, anotacaoData, userId) {
        const { content } = anotacaoData;

        // Verificar se o usuário é o autor da anotação
        const existingNote = await this.getById(id);
        if (!existingNote || existingNote.user_id !== userId) {
            return null;
        }

        const query = `
            UPDATE anotacoes 
            SET content = $1, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [content, id, userId]);
        
        if (result.rows[0]) {
            return await this.getById(id);
        }
        return null;
    }

    /**
     * Remove uma anotação do banco de dados
     * @param {number} id - ID da anotação
     * @param {number} userId - ID do usuário que está removendo
     * @returns {Object|null} Anotação removida ou null
     */
    static async delete(id, userId) {
        // Verificar se o usuário é o autor da anotação ou dono da tarefa
        const existingNote = await this.getById(id);
        if (!existingNote || (existingNote.user_id !== userId && existingNote.task_owner_id !== userId)) {
            return null;
        }

        const query = `
            DELETE FROM anotacoes 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Obtém todas as anotações de um usuário
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de resultados (padrão: 50)
     * @returns {Array} Lista de anotações do usuário
     */
    static async getByUser(userId, limit = 50) {
        const query = `
            SELECT 
                a.*,
                u.nome as author_name,
                t.title as task_title
            FROM anotacoes a
            INNER JOIN users u ON a.user_id = u.id
            INNER JOIN tasks t ON a.task_id = t.id
            WHERE a.user_id = $1 OR t.user_id = $1
            ORDER BY a.criado_em DESC
            LIMIT $2
        `;
        const result = await pool.query(query, [userId, limit]);
        return result.rows;
    }

    /**
     * Busca anotações por conteúdo (busca parcial)
     * @param {string} searchTerm - Termo de busca
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de anotações encontradas
     */
    static async search(searchTerm, userId) {
        const query = `
            SELECT 
                a.*,
                u.nome as author_name,
                t.title as task_title
            FROM anotacoes a
            INNER JOIN users u ON a.user_id = u.id
            INNER JOIN tasks t ON a.task_id = t.id
            WHERE (a.user_id = $1 OR t.user_id = $1) 
                AND a.content ILIKE $2
            ORDER BY a.criado_em DESC
        `;
        const result = await pool.query(query, [userId, `%${searchTerm}%`]);
        return result.rows;
    }

    /**
     * Obtém estatísticas das anotações do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Estatísticas das anotações
     */
    static async getUserStats(userId) {
        const query = `
            SELECT 
                COUNT(a.*) as total_notes,
                COUNT(CASE WHEN a.user_id = $1 THEN 1 END) as notes_created,
                COUNT(DISTINCT a.task_id) as tasks_with_notes,
                COUNT(CASE WHEN a.criado_em >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as notes_this_week,
                COUNT(CASE WHEN a.criado_em >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as notes_this_month
            FROM anotacoes a
            INNER JOIN tasks t ON a.task_id = t.id
            WHERE a.user_id = $1 OR t.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * Obtém as anotações mais recentes do usuário
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de resultados (padrão: 10)
     * @returns {Array} Lista das anotações mais recentes
     */
    static async getRecent(userId, limit = 10) {
        const query = `
            SELECT 
                a.*,
                u.nome as author_name,
                t.title as task_title,
                t.status as task_status
            FROM anotacoes a
            INNER JOIN users u ON a.user_id = u.id
            INNER JOIN tasks t ON a.task_id = t.id
            WHERE a.user_id = $1 OR t.user_id = $1
            ORDER BY a.criado_em DESC
            LIMIT $2
        `;
        const result = await pool.query(query, [userId, limit]);
        return result.rows;
    }

    /**
     * Remove todas as anotações de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {number} Número de anotações removidas
     */
    static async deleteAllFromTask(taskId) {
        const query = 'DELETE FROM anotacoes WHERE task_id = $1';
        const result = await pool.query(query, [taskId]);
        return result.rowCount;
    }

    /**
     * Duplica todas as anotações de uma tarefa para outra (apenas o conteúdo)
     * @param {number} sourceTaskId - ID da tarefa origem
     * @param {number} targetTaskId - ID da tarefa destino
     * @param {number} userId - ID do usuário que está duplicando
     * @returns {Array} Anotações criadas
     */
    static async duplicateFromTask(sourceTaskId, targetTaskId, userId) {
        const sourceNotes = await this.getByTask(sourceTaskId);
        const createdNotes = [];

        for (const note of sourceNotes) {
            const newNote = await this.create({
                content: `[Duplicado] ${note.content}`
            }, targetTaskId, userId);
            createdNotes.push(newNote);
        }

        return createdNotes;
    }

    /**
     * Obtém estatísticas de anotações por período
     * @param {number} userId - ID do usuário
     * @param {string} period - Período ('week', 'month', 'year')
     * @returns {Object} Estatísticas por período
     */
    static async getStatsByPeriod(userId, period = 'month') {
        let interval;
        switch (period) {
            case 'week':
                interval = '7 days';
                break;
            case 'year':
                interval = '1 year';
                break;
            default:
                interval = '30 days';
        }

        const query = `
            SELECT 
                DATE(a.criado_em) as date,
                COUNT(*) as notes_count
            FROM anotacoes a
            INNER JOIN tasks t ON a.task_id = t.id
            WHERE (a.user_id = $1 OR t.user_id = $1)
                AND a.criado_em >= CURRENT_DATE - INTERVAL '${interval}'
            GROUP BY DATE(a.criado_em)
            ORDER BY date DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }
}

// Exporta a classe Anotacao para uso em outros módulos
module.exports = Anotacao;
