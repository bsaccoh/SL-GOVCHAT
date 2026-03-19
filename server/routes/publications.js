const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/publications
router.get('/', (req, res) => {
    const { category, search } = req.query;
    let query = 'SELECT * FROM publications WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        query += ' AND (title LIKE ? OR description LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s);
    }

    query += ' ORDER BY published_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json({ data: rows });
});

// POST /api/publications
router.post('/', (req, res) => {
    const { title, description, document_url, category } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const result = db.prepare(
        'INSERT INTO publications (title, description, document_url, category) VALUES (?, ?, ?, ?)'
    ).run(title, description, document_url, category || 'Policy');
    res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/publications/:id
router.put('/:id', (req, res) => {
    const { title, description, document_url, category } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const existing = db.prepare('SELECT * FROM publications WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare(
        'UPDATE publications SET title = ?, description = ?, document_url = ?, category = ? WHERE id = ?'
    ).run(title, description, document_url, category || 'Policy', req.params.id);
    res.json({ success: true });
});

// DELETE /api/publications/:id
router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM publications WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare('DELETE FROM publications WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
