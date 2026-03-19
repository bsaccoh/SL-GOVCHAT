import { useState, useEffect } from 'react';
import { Search, Users, Building2, Briefcase, Scale, Landmark, Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { getOfficials, createOfficial, updateOfficial, deleteOfficial, trackEvent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const categoryIcons = {
    Executive: Landmark,
    Minister: Briefcase,
    Parliament: Building2,
    Judiciary: Scale,
    'MDA Head': Building2,
};

const CATEGORIES = ['Executive', 'Minister', 'Parliament', 'Judiciary', 'MDA Head'];

const emptyForm = {
    name: '', title: '', category: 'Minister', office: '',
    institution: '', tenure_start: '', tenure_end: '', photo_url: '', bio: '',
};

export default function Officials() {
    const { user } = useAuth();
    const [officials, setOfficials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    // CRUD state
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        trackEvent('page_view', '/officials');
    }, []);

    useEffect(() => { fetchOfficials(); }, [category]);

    async function fetchOfficials() {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (search) params.search = search;
            const res = await getOfficials(params);
            setOfficials(res.data || []);
            setCategories(res.categories || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    function handleSearch(e) { e.preventDefault(); fetchOfficials(); }

    function getInitials(name) {
        return name.split(' ').filter(w => !['Hon.', 'Dr.', 'Brig.', '(Rtd.)', 'Eng.', 'Justice', 'Prof.'].includes(w))
            .map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    function getCategoryColor(cat) {
        const colors = {
            Executive: 'badge-gold',
            Minister: 'badge-green',
            Parliament: 'badge-blue',
            Judiciary: 'badge-red',
            'MDA Head': 'badge-gray',
        };
        return colors[cat] || 'badge-gray';
    }

    // CRUD handlers
    function openCreate() {
        setEditItem(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    function openEdit(official) {
        setEditItem(official);
        setForm({
            name: official.name || '',
            title: official.title || '',
            category: official.category || 'Minister',
            office: official.office || '',
            institution: official.institution || '',
            tenure_start: official.tenure_start || '',
            tenure_end: official.tenure_end || '',
            photo_url: official.photo_url || '',
            bio: official.bio || '',
        });
        setShowForm(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) {
                await updateOfficial(editItem.id, form);
            } else {
                await createOfficial(form);
            }
            setShowForm(false);
            fetchOfficials();
        } catch (err) { alert(err.message); }
        setSaving(false);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteOfficial(deleteTarget.id);
            setDeleteTarget(null);
            fetchOfficials();
        } catch (err) { alert(err.message); }
    }

    return (
        <div>
            {/* Header with Add button */}
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Public Officials & Appointees Directory</h1>
                    <p>Verified directory of government-appointed officials and public servants</p>
                </div>
                {user && (
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Add Official
                    </button>
                )}
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="search-bar">
                <Search />
                <input
                    type="text"
                    placeholder="Search officials by name, title, or institution..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </form>

            <div className="tabs">
                <button className={`tab ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>
                    All ({officials.length})
                </button>
                {categories.map(c => (
                    <button key={c} className={`tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                        {c}
                    </button>
                ))}
            </div>

            {/* Officials Grid */}
            <div className="officials-grid">
                {officials.map(official => (
                    <div key={official.id} className="card official-card animate-in">
                        <div className="official-avatar">
                            {getInitials(official.name)}
                        </div>
                        <div className="official-info" style={{ flex: 1 }}>
                            <h4>{official.name}</h4>
                            <p className="official-title">{official.title}</p>
                            <p className="official-inst">{official.institution}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <span className={`badge ${getCategoryColor(official.category)}`}>{official.category}</span>
                                {official.office && (
                                    <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Building2 size={10} /> {official.office}
                                    </span>
                                )}
                            </div>
                            {official.bio && (
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '10px', lineHeight: 1.5 }}>
                                    {official.bio.length > 120 ? official.bio.slice(0, 120) + '...' : official.bio}
                                </p>
                            )}

                            {/* Edit/Delete actions */}
                            {user && (
                                <div className="card-actions">
                                    <button className="btn btn-secondary" onClick={() => openEdit(official)}><Pencil size={13} /> Edit</button>
                                    <button className="btn btn-danger" onClick={() => setDeleteTarget(official)}><Trash2 size={13} /> Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="empty-state"><Users /><h3>Loading directory...</h3></div>
            )}

            {!loading && officials.length === 0 && (
                <div className="empty-state">
                    <Users />
                    <h3>No officials found</h3>
                    <p>Try adjusting your search or category filter</p>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Edit Official' : 'New Official'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave} className="crud-form">
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Hon. John Smith" />
                                    </div>
                                    <div className="form-group">
                                        <label>Title *</label>
                                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Minister of Finance" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Office</label>
                                        <input value={form.office} onChange={e => setForm({ ...form, office: e.target.value })} placeholder="e.g. State House" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Institution</label>
                                    <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} placeholder="e.g. Ministry of Finance" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Tenure Start</label>
                                        <input value={form.tenure_start} onChange={e => setForm({ ...form, tenure_start: e.target.value })} placeholder="e.g. 2023" />
                                    </div>
                                    <div className="form-group">
                                        <label>Tenure End</label>
                                        <input value={form.tenure_end} onChange={e => setForm({ ...form, tenure_end: e.target.value })} placeholder="e.g. Present" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Photo URL</label>
                                    <input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Brief biography..." />
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
                        <h3>Delete Official?</h3>
                        <p>"{deleteTarget.name}" will be permanently removed from the directory.</p>
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
