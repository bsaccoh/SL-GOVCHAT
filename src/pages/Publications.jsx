import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, ExternalLink, X, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { getPublications, createPublication, updatePublication, deletePublication, trackEvent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Policy', 'Report', 'Budget', 'Legal', 'Strategy'];

const emptyForm = { title: '', description: '', document_url: '', category: 'Policy' };

export default function Publications() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    // CRUD state
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { trackEvent('page_view', '/publications'); }, []);
    useEffect(() => { fetchData(); }, [category]);

    async function fetchData() {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (search) params.search = search;
            const res = await getPublications(params);
            setItems(res.data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    function handleSearch(e) { e.preventDefault(); fetchData(); }

    // CRUD
    function openCreate() {
        setEditItem(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    function openEdit(item) {
        setEditItem(item);
        setForm({
            title: item.title || '',
            description: item.description || '',
            document_url: item.document_url || '',
            category: item.category || 'Policy',
        });
        setShowForm(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) {
                await updatePublication(editItem.id, form);
            } else {
                await createPublication(form);
            }
            setShowForm(false);
            fetchData();
        } catch (err) { alert(err.message); }
        setSaving(false);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deletePublication(deleteTarget.id);
            setDeleteTarget(null);
            fetchData();
        } catch (err) { alert(err.message); }
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Publications & Documents</h1>
                    <p>Official government publications, policies, and reports</p>
                </div>
                {user && (
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Add Publication
                    </button>
                )}
            </div>

            <form onSubmit={handleSearch} className="search-bar">
                <Search />
                <input placeholder="Search publications..." value={search} onChange={e => setSearch(e.target.value)} />
            </form>

            <div className="tabs">
                {CATEGORIES.map(c => (
                    <button
                        key={c}
                        className={`tab ${(c === 'All' ? !category : category === c) ? 'active' : ''}`}
                        onClick={() => setCategory(c === 'All' ? '' : c)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Publications List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {items.map(item => (
                    <div key={item.id} className="card pub-card animate-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <span className="badge badge-blue">{item.category}</span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} />
                                {item.published_at ? new Date(item.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                        <h4>{item.title}</h4>
                        <p>{item.description?.slice(0, 140)}{item.description?.length > 140 ? '...' : ''}</p>

                        <div className="pub-meta">
                            {item.document_url && (
                                <a href={item.document_url} target="_blank" rel="noopener noreferrer"
                                    className="btn btn-secondary" style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', textDecoration: 'none' }}>
                                    <ExternalLink size={12} /> View Document
                                </a>
                            )}
                        </div>

                        {user && (
                            <div className="card-actions">
                                <button className="btn btn-secondary" onClick={() => openEdit(item)}><Pencil size={13} /> Edit</button>
                                <button className="btn btn-danger" onClick={() => setDeleteTarget(item)}><Trash2 size={13} /> Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!loading && items.length === 0 && (
                <div className="empty-state"><FileText /><h3>No publications found</h3></div>
            )}

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Edit Publication' : 'New Publication'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave} className="crud-form">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Document URL</label>
                                        <input value={form.document_url} onChange={e => setForm({ ...form, document_url: e.target.value })} placeholder="https://..." />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editItem ? 'Update' : 'Create')}
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
                        <h3>Delete Publication?</h3>
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
