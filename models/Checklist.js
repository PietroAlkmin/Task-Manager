/**
 * Model Checklist - Representa a entidade Checklist no sistema
 * Responsável por toda interação com a tabela 'checklists' no banco de dados
 * 
 * CRIADO: Versão 1.0 - FASE 2 do projeto Task-It!
 */
const pool = require('../config/db');

class Checklist {
    /**
     * Retorna todos os itens de checklist de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {Array} Lista de itens de checklist
     */
    static async getByTask(taskId) {
        const query = `
            SELECT * 
            FROM checklists 
            WHERE task_id = $1 
            ORDER BY ordem ASC, criado_em ASC
        `;
        const result = await pool.query(query, [taskId]);
        return result.rows;
    }

    /**
     * Busca um item de checklist específico pelo ID
     * @param {number} id - ID do item de checklist
     * @returns {Object|null} Item de checklist encontrado ou null
     */
    static async getById(id) {
        const query = `
            SELECT c.*, t.user_id
            FROM checklists c
            INNER JOIN tasks t ON c.task_id = t.id
            WHERE c.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Cria um novo item de checklist no banco de dados
     * @param {Object} checklistData - Dados do item de checklist
     * @param {number} taskId - ID da tarefa
     * @returns {Object} Item de checklist criado
     */
    static async create(checklistData, taskId) {
        const { content, ordem } = checklistData;

        // Se não foi especificada uma ordem, usar a próxima disponível
        let finalOrder = ordem;
        if (!finalOrder) {
            const orderQuery = 'SELECT COALESCE(MAX(ordem), 0) + 1 as next_order FROM checklists WHERE task_id = $1';
            const orderResult = await pool.query(orderQuery, [taskId]);
            finalOrder = orderResult.rows[0].next_order;
        }

        const query = `
            INSERT INTO checklists (content, task_id, ordem) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        const result = await pool.query(query, [content, taskId, finalOrder]);
        return result.rows[0];
    }

    /**
     * Atualiza um item de checklist existente
     * @param {number} id - ID do item de checklist
     * @param {Object} checklistData - Dados atualizados do item
     * @returns {Object|null} Item de checklist atualizado ou null
     */
    static async update(id, checklistData) {
        const { content, completed, ordem } = checklistData;

        const query = `
            UPDATE checklists 
            SET content = $1, completed = $2, ordem = $3
            WHERE id = $4 
            RETURNING *
        `;
        const result = await pool.query(query, [content, completed, ordem, id]);
        return result.rows[0];
    }

    /**
     * Marca/desmarca um item de checklist como concluído
     * @param {number} id - ID do item de checklist
     * @param {boolean} completed - Status de conclusão
     * @returns {Object|null} Item de checklist atualizado ou null
     */
    static async toggleCompleted(id, completed) {
        const query = `
            UPDATE checklists 
            SET completed = $1
            WHERE id = $2 
            RETURNING *
        `;
        const result = await pool.query(query, [completed, id]);
        return result.rows[0];
    }

    /**
     * Remove um item de checklist do banco de dados
     * @param {number} id - ID do item de checklist
     * @returns {Object|null} Item de checklist removido ou null
     */
    static async delete(id) {
        const query = `
            DELETE FROM checklists 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    /**
     * Reordena os itens de checklist de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @param {Array} itemsOrder - Array com IDs dos itens na nova ordem
     * @returns {boolean} Sucesso da operação
     */
    static async reorder(taskId, itemsOrder) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            for (let i = 0; i < itemsOrder.length; i++) {
                await client.query(
                    'UPDATE checklists SET ordem = $1 WHERE id = $2 AND task_id = $3',
                    [i + 1, itemsOrder[i], taskId]
                );
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Obtém estatísticas do checklist de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {Object} Estatísticas do checklist
     */
    static async getTaskStats(taskId) {
        const query = `
            SELECT 
                COUNT(*) as total_items,
                COUNT(CASE WHEN completed = true THEN 1 END) as completed_items,
                COUNT(CASE WHEN completed = false THEN 1 END) as pending_items,
                CASE 
                    WHEN COUNT(*) = 0 THEN 0
                    ELSE ROUND((COUNT(CASE WHEN completed = true THEN 1 END) * 100.0) / COUNT(*), 2)
                END as completion_percentage
            FROM checklists 
            WHERE task_id = $1
        `;
        const result = await pool.query(query, [taskId]);
        return result.rows[0];
    }

    /**
     * Obtém estatísticas gerais dos checklists do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Estatísticas gerais dos checklists
     */
    static async getUserStats(userId) {
        const query = `
            SELECT 
                COUNT(c.*) as total_checklist_items,
                COUNT(CASE WHEN c.completed = true THEN 1 END) as completed_items,
                COUNT(CASE WHEN c.completed = false THEN 1 END) as pending_items,
                COUNT(DISTINCT c.task_id) as tasks_with_checklists,
                CASE 
                    WHEN COUNT(c.*) = 0 THEN 0
                    ELSE ROUND((COUNT(CASE WHEN c.completed = true THEN 1 END) * 100.0) / COUNT(c.*), 2)
                END as overall_completion_percentage
            FROM checklists c
            INNER JOIN tasks t ON c.task_id = t.id
            WHERE t.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * Duplica todos os itens de checklist de uma tarefa para outra
     * @param {number} sourceTaskId - ID da tarefa origem
     * @param {number} targetTaskId - ID da tarefa destino
     * @returns {Array} Itens de checklist criados
     */
    static async duplicateFromTask(sourceTaskId, targetTaskId) {
        const sourceItems = await this.getByTask(sourceTaskId);
        const createdItems = [];

        for (const item of sourceItems) {
            const newItem = await this.create({
                content: item.content,
                ordem: item.ordem
            }, targetTaskId);
            createdItems.push(newItem);
        }

        return createdItems;
    }

    /**
     * Marca todos os itens de checklist de uma tarefa como concluídos/pendentes
     * @param {number} taskId - ID da tarefa
     * @param {boolean} completed - Status de conclusão
     * @returns {number} Número de itens atualizados
     */
    static async markAllAsCompleted(taskId, completed) {
        const query = `
            UPDATE checklists 
            SET completed = $1
            WHERE task_id = $2 
            RETURNING id
        `;
        const result = await pool.query(query, [completed, taskId]);
        return result.rowCount;
    }

    /**
     * Remove todos os itens de checklist de uma tarefa
     * @param {number} taskId - ID da tarefa
     * @returns {number} Número de itens removidos
     */
    static async deleteAllFromTask(taskId) {
        const query = 'DELETE FROM checklists WHERE task_id = $1';
        const result = await pool.query(query, [taskId]);
        return result.rowCount;
    }
}

// Exporta a classe Checklist para uso em outros módulos
module.exports = Checklist;
