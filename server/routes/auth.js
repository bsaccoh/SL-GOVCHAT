const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sl-govchat-secret-key-2024';

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
    const user = db.prepare('SELECT id, email, name, role, category FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

// ──── Admin User Management ────

// GET /api/auth/users - List all users (admin only)
router.get('/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const users = db.prepare('SELECT id, email, name, role, category, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ data: users });
});

// POST /api/auth/users - Create a new user (admin only)
router.post('/users', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const { email, password, name, role, category } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

    const validRoles = ['admin', 'editor', 'viewer'];
    const userRole = validRoles.includes(role) ? role : 'viewer';
    const password_hash = bcrypt.hashSync(password, 10);

    const userCategory = category || 'General';
    const result = db.prepare(
        'INSERT INTO users (email, password_hash, name, role, category) VALUES (?, ?, ?, ?, ?)'
    ).run(email, password_hash, name, userRole, userCategory);

    res.status(201).json({ id: result.lastInsertRowid, email, name, role: userRole, category: userCategory });
});

// PUT /api/auth/users/:id - Update user (admin only)
router.put('/users/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const { email, name, role, password, category } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name are required' });

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    // Check if email is taken by another user
    const emailTaken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.params.id);
    if (emailTaken) return res.status(409).json({ error: 'Email already in use by another user' });

    const validRoles = ['admin', 'editor', 'viewer'];
    const userRole = validRoles.includes(role) ? role : existing.role;

    const userCategory = category || existing.category || 'General';

    if (password) {
        const password_hash = bcrypt.hashSync(password, 10);
        db.prepare('UPDATE users SET email = ?, password_hash = ?, name = ?, role = ?, category = ? WHERE id = ?')
            .run(email, password_hash, name, userRole, userCategory, req.params.id);
    } else {
        db.prepare('UPDATE users SET email = ?, name = ?, role = ?, category = ? WHERE id = ?')
            .run(email, name, userRole, userCategory, req.params.id);
    }

    res.json({ success: true });
});

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    // Prevent deleting yourself
    if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
