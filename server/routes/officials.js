const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/officials
router.get('/', (req, res) => {
    const { category, search, institution } = req.query;
    let query = 'SELECT * FROM officials WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (institution) {
        query += ' AND institution LIKE ?';
        params.push(`%${institution}%`);
    }
    if (search) {
        query += ' AND (name LIKE ? OR title LIKE ? OR institution LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
    }

    query += ' ORDER BY name ASC';
    const rows = db.prepare(query).all(...params);
    const categories = db.prepare('SELECT DISTINCT category FROM officials ORDER BY category').all().map(r => r.category);
    res.json({ data: rows, categories });
});

// GET /api/officials/:id
router.get('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM officials WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
});

// POST /api/officials
router.post('/', (req, res) => {
    const { name, title, category, office, institution, tenure_start, tenure_end, photo_url, bio } = req.body;
    if (!name || !title || !category) return res.status(400).json({ error: 'Name, title, and category required' });
    const result = db.prepare(
        'INSERT INTO officials (name, title, category, office, institution, tenure_start, tenure_end, photo_url, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, title, category, office, institution, tenure_start, tenure_end, photo_url, bio);
    res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/officials/:id
router.put('/:id', (req, res) => {
    const { name, title, category, office, institution, tenure_start, tenure_end, photo_url, bio } = req.body;
    if (!name || !title || !category) return res.status(400).json({ error: 'Name, title, and category required' });
    const existing = db.prepare('SELECT * FROM officials WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare(
        'UPDATE officials SET name = ?, title = ?, category = ?, office = ?, institution = ?, tenure_start = ?, tenure_end = ?, photo_url = ?, bio = ? WHERE id = ?'
    ).run(name, title, category, office, institution, tenure_start, tenure_end, photo_url, bio, req.params.id);
    res.json({ success: true });
});

// DELETE /api/officials/:id
router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM officials WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare('DELETE FROM officials WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
