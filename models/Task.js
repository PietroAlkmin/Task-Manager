/**
 * Model Task - Representa a entidade Tarefa no sistema
 * Responsável por toda interação com a tabela 'tasks' no banco de dados
 *
 * ATUALIZADO: Versão 2.0 - Consistente com novo schema do banco
 */
const pool = require('../config/db');

class Task {
    /**
     * Retorna todas as tarefas de um usuário ordenadas por data de criação
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de tarefas
     */
    static async getAll(userId) {
        const query = `
            SELECT
                t.*,
                c.nome as category_name,
                c.cor as category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
            ORDER BY t.criado_em DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    /**
     * Busca uma tarefa específica pelo ID e usuário
     * @param {number} id - ID da tarefa
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Tarefa encontrada ou null
     */
    static async getById(id, userId) {
        const query = `
            SELECT
                t.*,
                c.nome as category_name,
                c.cor as category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.id = $1 AND t.user_id = $2
        `;
        const result = await pool.query(query, [id, userId]);
        return result.rows[0];
    }

    /**
     * Cria uma nova tarefa no banco de dados
     * @param {Object} taskData - Dados da tarefa
     * @param {number} userId - ID do usuário
     * @returns {Object} Tarefa criada
     */
    static async create(taskData, userId) {
        const {
            title,
            description,
            due_date,
            priority = 'media',
            status = 'pendente',
            category_id,
            lembrete_minutos = 0
        } = taskData;

        // Query de inserção retornando a tarefa criada
        const result = await pool.query(
            `INSERT INTO tasks (
                title, description, due_date, priority, status,
                category_id, user_id, lembrete_minutos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [title, description, due_date, priority, status, category_id, userId, lembrete_minutos]
        );

        // Registrar log de atividade
        await this.logActivity('criada', `Tarefa "${title}" foi criada`, result.rows[0].id, userId);

        return result.rows[0];
    }

    /**
     * Atualiza uma tarefa existente
     * @param {number} id - ID da tarefa
     * @param {Object} taskData - Dados atualizados da tarefa
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Tarefa atualizada ou null
     */
    static async update(id, taskData, userId) {
        const {
            title,
            description,
            due_date,
            priority,
            status,
            category_id,
            lembrete_minutos
        } = taskData;

        // Query de atualização retornando a tarefa atualizada
        const result = await pool.query(
            `UPDATE tasks
            SET title = $1, description = $2, due_date = $3,
                priority = $4, status = $5, category_id = $6,
                lembrete_minutos = $7, atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $8 AND user_id = $9 RETURNING *`,
            [title, description, due_date, priority, status, category_id, lembrete_minutos, id, userId]
        );

        if (result.rows[0]) {
            // Registrar log de atividade
            await this.logActivity('editada', `Tarefa "${title}" foi atualizada`, id, userId);
        }

        return result.rows[0];
    }

    /**
     * Remove uma tarefa do banco de dados
     * @param {number} id - ID da tarefa
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Tarefa removida ou null
     */
    static async delete(id, userId) {
        // Buscar título da tarefa antes de deletar para o log
        const taskToDelete = await this.getById(id, userId);

        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows[0] && taskToDelete) {
            // Registrar log de atividade
            await this.logActivity('cancelada', `Tarefa "${taskToDelete.title}" foi removida`, id, userId);
        }

        return result.rows[0];
    }

    /**
     * Busca tarefas por categoria
     * @param {number} categoryId - ID da categoria
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de tarefas da categoria
     */
    static async getByCategory(categoryId, userId) {
        const query = `
            SELECT
                t.*,
                c.nome as category_name,
                c.cor as category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.category_id = $1 AND t.user_id = $2
            ORDER BY t.criado_em DESC
        `;
        const result = await pool.query(query, [categoryId, userId]);
        return result.rows;
    }

    /**
     * Busca tarefas por status
     * @param {string} status - Status da tarefa
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de tarefas com o status especificado
     */
    static async getByStatus(status, userId) {
        const query = `
            SELECT
                t.*,
                c.nome as category_name,
                c.cor as category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.status = $1 AND t.user_id = $2
            ORDER BY t.criado_em DESC
        `;
        const result = await pool.query(query, [status, userId]);
        return result.rows;
    }

    /**
     * Busca tarefas por prioridade
     * @param {string} priority - Prioridade da tarefa
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de tarefas com a prioridade especificada
     */
    static async getByPriority(priority, userId) {
        const query = `
            SELECT
                t.*,
                c.nome as category_name,
                c.cor as category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.priority = $1 AND t.user_id = $2
            ORDER BY t.due_date ASC, t.criado_em DESC
        `;
        const result = await pool.query(query, [priority, userId]);
        return result.rows;
    }

    /**
     * Busca tarefas que vencem em breve
     * @param {number} userId - ID do usuário
     * @param {number} days - Número de dias para considerar "em breve" (padrão: 7)
     * @returns {Array} Lista de tarefas que vencem em breve
     */
    static async getUpcoming(userId, days = 7) {
        // Calcular a data limite no JavaScript para evitar problemas com INTERVAL
        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() + parseInt(days));

        const query = `
            SELECT
                t.*,
                c.nome as category_name,
                c.cor as category_color
            FROM tasks t
            LEFT JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = $1
                AND t.status != 'concluida'
                AND t.due_date IS NOT NULL
                AND t.due_date <= $2
            ORDER BY t.due_date ASC, t.priority DESC
        `;
        const result = await pool.query(query, [userId, limitDate.toISOString().split('T')[0]]);
        return result.rows;
    }

    /**
     * Obtém estatísticas das tarefas do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Estatísticas das tarefas
     */
    static async getStats(userId) {
        const query = `
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
                COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as em_andamento,
                COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
                COUNT(CASE WHEN priority = 'alta' AND status != 'concluida' THEN 1 END) as alta_prioridade,
                COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'concluida' THEN 1 END) as atrasadas
            FROM tasks
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }

    /**
     * Registra uma atividade no log
     * @param {string} tipo - Tipo da atividade
     * @param {string} descricao - Descrição da atividade
     * @param {number} taskId - ID da tarefa
     * @param {number} userId - ID do usuário
     */
    static async logActivity(tipo, descricao, taskId, userId) {
        try {
            await pool.query(
                'INSERT INTO log_atividades (tipo, descricao, task_id, user_id) VALUES ($1, $2, $3, $4)',
                [tipo, descricao, taskId, userId]
            );
        } catch (error) {
            console.error('Erro ao registrar log de atividade:', error);
        }
    }

    /**
     * Marca uma tarefa como concluída
     * @param {number} id - ID da tarefa
     * @param {number} userId - ID do usuário
     * @returns {Object|null} Tarefa atualizada ou null
     */
    static async markAsCompleted(id, userId) {
        const result = await pool.query(
            `UPDATE tasks
            SET status = 'concluida', atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );

        if (result.rows[0]) {
            await this.logActivity('concluida', `Tarefa "${result.rows[0].title}" foi marcada como concluída`, id, userId);
        }

        return result.rows[0];
    }
}

// Exporta a classe Task para uso em outros módulos
module.exports = Task;
