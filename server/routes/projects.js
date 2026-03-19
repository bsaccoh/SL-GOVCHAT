const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projects
router.get('/', (req, res) => {
    const { status, search, ministry } = req.query;
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (ministry) {
        query += ' AND ministry LIKE ?';
        params.push(`%${ministry}%`);
    }
    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ? OR location LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);

    const stats = {
        total: db.prepare('SELECT COUNT(*) as c FROM projects').get().c,
        ongoing: db.prepare("SELECT COUNT(*) as c FROM projects WHERE status='ongoing'").get().c,
        completed: db.prepare("SELECT COUNT(*) as c FROM projects WHERE status='completed'").get().c,
        past: db.prepare("SELECT COUNT(*) as c FROM projects WHERE status='past'").get().c,
    };

    res.json({ data: rows, stats });
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
});

// POST /api/projects
router.post('/', (req, res) => {
    const { name, description, status, ministry, budget, start_date, end_date, progress, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const result = db.prepare(
        'INSERT INTO projects (name, description, status, ministry, budget, start_date, end_date, progress, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, description, status || 'ongoing', ministry, budget, start_date, end_date, progress || 0, location);
    res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/projects/:id
router.put('/:id', (req, res) => {
    const { name, description, status, ministry, budget, start_date, end_date, progress, location } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare(
        'UPDATE projects SET name = ?, description = ?, status = ?, ministry = ?, budget = ?, start_date = ?, end_date = ?, progress = ?, location = ? WHERE id = ?'
    ).run(name, description, status || 'ongoing', ministry, budget, start_date, end_date, progress || 0, location, req.params.id);
    res.json({ success: true });
});

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
