import { useState, useEffect } from 'react';
import { Search, Newspaper, Calendar, X, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { getNews, createNews, updateNews, deleteNews, trackEvent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Education', 'Economy', 'Infrastructure', 'Technology', 'Health', 'General'];

const emptyForm = { title: '', summary: '', content: '', category: 'General', image_url: '', author: '' };

export default function News() {
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    // CRUD state
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { trackEvent('page_view', '/news'); }, []);

    useEffect(() => { fetchNews(); }, [category]);

    async function fetchNews() {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (search) params.search = search;
            const res = await getNews(params);
            setArticles(res.data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    function handleSearch(e) { e.preventDefault(); fetchNews(); }

    // CRUD handlers
    function openCreate() {
        setEditItem(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    function openEdit(article) {
        setEditItem(article);
        setForm({
            title: article.title || '',
            summary: article.summary || '',
            content: article.content || '',
            category: article.category || 'General',
            image_url: article.image_url || '',
            author: article.author || '',
        });
        setShowForm(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) {
                await updateNews(editItem.id, form);
            } else {
                await createNews(form);
            }
            setShowForm(false);
            fetchNews();
        } catch (err) { alert(err.message); }
        setSaving(false);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteNews(deleteTarget.id);
            setDeleteTarget(null);
            setSelected(null);
            fetchNews();
        } catch (err) { alert(err.message); }
    }

    return (
        <div>
            {/* Header with Add button */}
            <div className="page-header-row">
                <div className="page-header">
                    <h1>News & Press Releases</h1>
                    <p>Latest updates from the Government of Sierra Leone</p>
                </div>
                {user && (
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Add News
                    </button>
                )}
            </div>

            <form onSubmit={handleSearch} className="search-bar">
                <Search />
                <input
                    type="text"
                    placeholder="Search news articles..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
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

            {/* Articles Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {articles.map(article => (
                    <div key={article.id} className="card animate-in" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span className="badge badge-green">{article.category}</span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} />
                                {new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--gray-900)', margin: '10px 0 6px', lineHeight: 1.4 }}>
                            {article.title}
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', lineHeight: 1.6 }}>
                            {article.summary?.slice(0, 120)}...
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ fontSize: 'var(--text-xs)' }}
                                onClick={() => setSelected(article)}
                            >
                                Read More
                            </button>
                            {user && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn btn-secondary" style={{ padding: '6px 8px' }} onClick={() => openEdit(article)} title="Edit">
                                        <Pencil size={14} />
                                    </button>
                                    <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => setDeleteTarget(article)} title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!loading && articles.length === 0 && (
                <div className="empty-state"><Newspaper /><h3>No articles found</h3></div>
            )}

            {/* View Article Modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>{selected.title}</h2>
                            <button className="modal-close" onClick={() => setSelected(null)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <span className="badge badge-green">{selected.category}</span>
                                {selected.author && <span className="badge badge-blue">{selected.author}</span>}
                                <span className="badge badge-gray">
                                    {new Date(selected.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-700)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                {selected.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Edit Article' : 'New Article'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave} className="crud-form">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Summary</label>
                                    <input value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Content *</label>
                                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Author</label>
                                        <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
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
                        <h3>Delete Article?</h3>
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
