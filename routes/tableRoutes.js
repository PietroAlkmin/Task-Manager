const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helper function to execute SQL queries
const executeQuery = async (req, res, query) => {
    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

// Get all users
router.get('/users', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM users ORDER BY id');
});

// Get all categories
router.get('/categories', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM categories ORDER BY id');
});

// Get all tasks
router.get('/tasks', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM tasks ORDER BY id');
});

// Get all tags
router.get('/tags', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM tags ORDER BY id');
});

// Get all checklists
router.get('/checklists', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM checklists ORDER BY id');
});

// Get all task-tags
router.get('/task-tags', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM tarefa_tags ORDER BY tarefa_id, tag_id');
});

// Get all notes
router.get('/notes', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM anotacoes ORDER BY id');
});

// Get all activity logs
router.get('/activity-logs', async (req, res) => {
    await executeQuery(req, res, 'SELECT * FROM log_atividades ORDER BY id');
});

module.exports = router;
