// Model Task - Representa a entidade Tarefa no sistema
// Responsável por toda interação com a tabela 'tasks' no banco de dados
const pool = require('../config/db');

class Task {
    // Retorna todas as tarefas ordenadas por data de criação
    static async getAll() {
        const query = 'SELECT * FROM tasks ORDER BY criado_em DESC';
        const result = await pool.query(query);
        return result.rows;
    }

    // Busca uma tarefa específica pelo ID e usuário
    static async getById(id, userId) {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return result.rows[0];
    }

    // Cria uma nova tarefa no banco de dados
    static async create(taskData, userId) {
        const {
            title,
            description,
            due_date,
            priority,
            status = 'pending',
            category_id
        } = taskData;

        // Query de inserção retornando a tarefa criada
        const result = await pool.query(
            `INSERT INTO tasks (
                title, description, due_date, priority, status,
                category_id, user_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description, due_date, priority, status, category_id, userId]
        );
        return result.rows[0];
    }

    // Atualiza uma tarefa existente
    static async update(id, taskData, userId) {
        const {
            title,
            description,
            due_date,
            priority,
            status,
            category_id
        } = taskData;

        // Query de atualização retornando a tarefa atualizada
        const result = await pool.query(
            `UPDATE tasks 
            SET title = $1, description = $2, due_date = $3,
                priority = $4, status = $5, category_id = $6
             WHERE id = $7 AND user_id = $8 RETURNING *`,
            [title, description, due_date, priority, status, category_id, id, userId]
        );
        return result.rows[0];
    }

    // Remove uma tarefa do banco de dados
    static async delete(id, userId) {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );
        return result.rows[0];
    }

    // Busca tarefas por categoria
    static async getByCategory(categoryId, userId) {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE category_id = $1 AND user_id = $2 ORDER BY created_at DESC',
            [categoryId, userId]
        );
        return result.rows;
    }

    // Busca tarefas por status
    static async getByStatus(status, userId) {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE status = $1 AND user_id = $2 ORDER BY created_at DESC',
            [status, userId]
        );
        return result.rows;
    }
}

// Exporta a classe Task para uso em outros módulos
module.exports = Task;
