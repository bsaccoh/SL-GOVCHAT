const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Configure multer storage
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E6) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv',
            'application/json',
            'image/jpeg',
            'image/png',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not supported. Allowed: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JSON, JPG, PNG'));
        }
    }
});

// GET /api/documents - List all documents
router.get('/', (req, res) => {
    const { category, search } = req.query;
    let query = 'SELECT id, title, filename, original_name, file_size, mime_type, category, description, uploaded_by, created_at FROM documents WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        query += ' AND (title LIKE ? OR description LIKE ? OR original_name LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json({ data: rows });
});

// POST /api/documents/upload - Upload a document
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { title, category, description } = req.body;
    const fileName = req.file.filename;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    // Extract text content for AI indexing (for text-based files)
    let textContent = '';
    try {
        if (mimeType === 'text/plain' || mimeType === 'text/csv' || mimeType === 'application/json') {
            textContent = fs.readFileSync(req.file.path, 'utf-8');
        }
    } catch (e) {
        console.error('Text extraction error:', e.message);
    }

    // Also include description and title in text_content for AI searching
    const fullTextContent = [title || '', description || '', textContent].filter(Boolean).join('\n\n');

    const result = db.prepare(
        'INSERT INTO documents (title, filename, original_name, file_size, mime_type, category, description, text_content, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
        title || originalName,
        fileName,
        originalName,
        fileSize,
        mimeType,
        category || 'General',
        description || '',
        fullTextContent,
        req.body.uploaded_by || 'Admin'
    );

    res.status(201).json({
        id: result.lastInsertRowid,
        filename: fileName,
        original_name: originalName,
    });
});

// PUT /api/documents/:id - Update metadata
router.put('/:id', (req, res) => {
    const { title, category, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const existing = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Update text_content to include new title/description
    const textContent = existing.text_content || '';
    const baseText = textContent.split('\n\n').slice(2).join('\n\n'); // Keep original file text
    const fullTextContent = [title, description || '', baseText].filter(Boolean).join('\n\n');

    db.prepare(
        'UPDATE documents SET title = ?, category = ?, description = ?, text_content = ? WHERE id = ?'
    ).run(title, category || 'General', description, fullTextContent, req.params.id);
    res.json({ success: true });
});

// DELETE /api/documents/:id
router.delete('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Delete file from disk
    const filePath = path.join(uploadsDir, existing.filename);
    try { fs.unlinkSync(filePath); } catch (e) { /* file may already be gone */ }

    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// GET /api/documents/download/:filename
router.get('/download/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

    const doc = db.prepare('SELECT original_name FROM documents WHERE filename = ?').get(req.params.filename);
    res.download(filePath, doc ? doc.original_name : req.params.filename);
});

module.exports = router;
