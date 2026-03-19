import { useState, useEffect, useRef } from 'react';
import { Search, FileUp, FileText, Download, Calendar, X, Plus, Pencil, Trash2, AlertTriangle, Upload, File, HardDrive } from 'lucide-react';
import { getDocuments, uploadDocument, updateDocument, deleteDocument, trackEvent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'General', 'Policy', 'Report', 'Legal', 'Budget', 'Strategy', 'Other'];

function formatFileSize(bytes) {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(mimeType) {
    if (!mimeType) return File;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('image')) return File;
    return FileText;
}

export default function Documents() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    // Upload state
    const [showUpload, setShowUpload] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadForm, setUploadForm] = useState({ title: '', category: 'General', description: '' });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Edit state
    const [showEdit, setShowEdit] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', category: 'General', description: '' });
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { trackEvent('page_view', '/documents'); }, []);
    useEffect(() => { fetchData(); }, [category]);

    async function fetchData() {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (search) params.search = search;
            const res = await getDocuments(params);
            setItems(res.data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    function handleSearch(e) { e.preventDefault(); fetchData(); }

    // Upload
    function openUpload() {
        setUploadFile(null);
        setUploadForm({ title: '', category: 'General', description: '' });
        setShowUpload(true);
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            if (!uploadForm.title) {
                setUploadForm(prev => ({ ...prev, title: file.name.replace(/\.[^.]+$/, '') }));
            }
        }
    }

    async function handleUpload(e) {
        e.preventDefault();
        if (!uploadFile) return alert('Please select a file');
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', uploadFile);
            fd.append('title', uploadForm.title || uploadFile.name);
            fd.append('category', uploadForm.category);
            fd.append('description', uploadForm.description);
            await uploadDocument(fd);
            setShowUpload(false);
            fetchData();
        } catch (err) { alert(err.message); }
        setUploading(false);
    }

    // Edit
    function openEdit(item) {
        setEditItem(item);
        setEditForm({ title: item.title, category: item.category, description: item.description || '' });
        setShowEdit(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await updateDocument(editItem.id, editForm);
            setShowEdit(false);
            fetchData();
        } catch (err) { alert(err.message); }
        setSaving(false);
    }

    // Delete
    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteDocument(deleteTarget.id);
            setDeleteTarget(null);
            fetchData();
        } catch (err) { alert(err.message); }
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Document Library</h1>
                    <p>Upload and manage government documents — all documents are indexed by the AI assistant</p>
                </div>
                {user && (
                    <button className="btn btn-primary" onClick={openUpload}>
                        <Upload size={16} /> Upload Document
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="kpi-card">
                    <div className="kpi-icon blue"><FileText size={24} /></div>
                    <div className="kpi-info"><h3>{items.length}</h3><p>Total Documents</p></div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon green"><HardDrive size={24} /></div>
                    <div className="kpi-info">
                        <h3>{formatFileSize(items.reduce((sum, d) => sum + (d.file_size || 0), 0))}</h3>
                        <p>Total Size</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSearch} className="search-bar">
                <Search />
                <input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
            </form>

            <div className="tabs">
                {CATEGORIES.map(c => (
                    <button key={c} className={`tab ${(c === 'All' ? !category : category === c) ? 'active' : ''}`} onClick={() => setCategory(c === 'All' ? '' : c)}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Documents Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                {items.map(item => {
                    const Icon = getFileIcon(item.mime_type);
                    return (
                        <div key={item.id} className="card pub-card animate-in">
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                    background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <Icon size={20} style={{ color: 'white' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h4 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{item.title}</h4>
                                        <span className="badge badge-blue">{item.category}</span>
                                    </div>
                                    {item.description && <p>{item.description.slice(0, 100)}{item.description.length > 100 ? '...' : ''}</p>}
                                    <div className="pub-meta">
                                        <span><FileUp size={12} /> {formatFileSize(item.file_size)}</span>
                                        <span>{item.original_name}</span>
                                        <span><Calendar size={12} /> {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions" style={{ marginTop: '12px' }}>
                                <a href={`/api/documents/download/${item.filename}`} className="btn btn-secondary" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>
                                    <Download size={13} /> Download
                                </a>
                                {user && (
                                    <>
                                        <button className="btn btn-secondary" onClick={() => openEdit(item)}><Pencil size={13} /></button>
                                        <button className="btn btn-danger" onClick={() => setDeleteTarget(item)}><Trash2 size={13} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!loading && items.length === 0 && (
                <div className="empty-state">
                    <FileText />
                    <h3>No documents uploaded yet</h3>
                    <p>Upload documents to make them searchable by the AI assistant</p>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Upload Document</h2>
                            <button className="modal-close" onClick={() => setShowUpload(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleUpload} className="crud-form">
                            <div className="modal-body">
                                {/* Drop zone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed var(--gray-300)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '32px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        marginBottom: '18px',
                                        background: uploadFile ? 'rgba(27, 138, 46, 0.05)' : 'var(--gray-50)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.jpg,.jpeg,.png"
                                    />
                                    {uploadFile ? (
                                        <>
                                            <FileText size={36} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                                            <p style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{uploadFile.name}</p>
                                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>{formatFileSize(uploadFile.size)} — Click to change</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={36} style={{ color: 'var(--gray-400)', marginBottom: '8px' }} />
                                            <p style={{ fontWeight: 500, color: 'var(--gray-600)' }}>Click to select a file</p>
                                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JSON, JPG, PNG (max 20MB)</p>
                                        </>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Document Title</label>
                                    <input value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="Descriptive title for the document" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select value={uploadForm.category} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}>
                                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} placeholder="Brief description — this will also be indexed by the AI assistant..." />
                                </div>

                                <div style={{
                                    background: 'rgba(27, 138, 46, 0.06)', borderRadius: 'var(--radius-md)',
                                    padding: '12px 16px', fontSize: 'var(--text-xs)', color: 'var(--primary-dark)',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    🤖 The AI assistant will automatically learn from this document's content.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={uploading || !uploadFile}>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEdit && (
                <div className="modal-overlay" onClick={() => setShowEdit(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Document</h2>
                            <button className="modal-close" onClick={() => setShowEdit(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave} className="crud-form">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteTarget && (
                <div className="confirm-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
                        <AlertTriangle size={40} style={{ color: '#ef4444', marginBottom: '8px' }} />
                        <h3>Delete Document?</h3>
                        <p>"{deleteTarget.title}" will be permanently removed.</p>
                        <div className="confirm-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
