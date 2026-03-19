const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/news - List all news
router.get('/', (req, res) => {
    const { category, search, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM news WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        query += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
    }

    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM news').get().count;
    res.json({ data: rows, total });
});

// GET /api/news/:id
router.get('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
});

// POST /api/news
router.post('/', (req, res) => {
    const { title, summary, content, category, image_url, author } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    const result = db.prepare(
        'INSERT INTO news (title, summary, content, category, image_url, author) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, summary, content, category || 'General', image_url, author);
    res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/news/:id
router.put('/:id', (req, res) => {
    const { title, summary, content, category, image_url, author } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
    const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare(
        'UPDATE news SET title = ?, summary = ?, content = ?, category = ?, image_url = ?, author = ? WHERE id = ?'
    ).run(title, summary, content, category || 'General', image_url, author, req.params.id);
    res.json({ success: true });
});

// DELETE /api/news/:id
router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
