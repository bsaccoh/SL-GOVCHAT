import { useState, useEffect } from 'react';
import { Search, FolderKanban, MapPin, Calendar, DollarSign, X, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { getProjects, createProject, updateProject, deleteProject, trackEvent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
    name: '', description: '', status: 'ongoing', ministry: '',
    budget: '', start_date: '', end_date: '', progress: 0, location: '',
};

export default function Projects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    // CRUD state
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { trackEvent('page_view', '/projects'); fetchProjects(); }, []);

    useEffect(() => { fetchProjects(); }, [status]);

    async function fetchProjects() {
        setLoading(true);
        try {
            const params = {};
            if (status) params.status = status;
            if (search) params.search = search;
            const res = await getProjects(params);
            setProjects(res.data || []);
            setStats(res.stats || null);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    function handleSearch(e) { e.preventDefault(); fetchProjects(); }

    function getStatusBadge(s) {
        return { ongoing: 'badge-green', completed: 'badge-blue', past: 'badge-gray' }[s] || 'badge-gray';
    }

    // CRUD handlers
    function openCreate() {
        setEditItem(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    function openEdit(project) {
        setEditItem(project);
        setForm({
            name: project.name || '',
            description: project.description || '',
            status: project.status || 'ongoing',
            ministry: project.ministry || '',
            budget: project.budget || '',
            start_date: project.start_date || '',
            end_date: project.end_date || '',
            progress: project.progress || 0,
            location: project.location || '',
        });
        setShowForm(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const data = { ...form, progress: Number(form.progress) };
            if (editItem) {
                await updateProject(editItem.id, data);
            } else {
                await createProject(data);
            }
            setShowForm(false);
            fetchProjects();
        } catch (err) { alert(err.message); }
        setSaving(false);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteProject(deleteTarget.id);
            setDeleteTarget(null);
            fetchProjects();
        } catch (err) { alert(err.message); }
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header-row">
                <div className="page-header">
                    <h1>Government Projects</h1>
                    <p>Track national development projects and their progress</p>
                </div>
                {user && (
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Add Project
                    </button>
                )}
            </div>

            {/* Stats */}
            {stats && (
                <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                    <div className="kpi-card" onClick={() => setStatus('')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-icon gold"><FolderKanban size={24} /></div>
                        <div className="kpi-info"><h3>{stats.total}</h3><p>Total Projects</p></div>
                    </div>
                    <div className="kpi-card" onClick={() => setStatus('ongoing')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-icon green"><FolderKanban size={24} /></div>
                        <div className="kpi-info"><h3>{stats.ongoing}</h3><p>Ongoing</p></div>
                    </div>
                    <div className="kpi-card" onClick={() => setStatus('completed')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-icon blue"><FolderKanban size={24} /></div>
                        <div className="kpi-info"><h3>{stats.completed}</h3><p>Completed</p></div>
                    </div>
                    <div className="kpi-card" onClick={() => setStatus('past')} style={{ cursor: 'pointer' }}>
                        <div className="kpi-icon purple"><FolderKanban size={24} /></div>
                        <div className="kpi-info"><h3>{stats.past}</h3><p>Past</p></div>
                    </div>
                </div>
            )}

            {/* Search & Tabs */}
            <form onSubmit={handleSearch} className="search-bar">
                <Search />
                <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
            </form>

            <div className="tabs">
                {['All Projects', 'Ongoing', 'Completed', 'Past'].map(label => {
                    const val = label === 'All Projects' ? '' : label.toLowerCase();
                    return (
                        <button key={label} className={`tab ${status === val ? 'active' : ''}`} onClick={() => setStatus(val)}>
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Projects Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
                {projects.map(project => (
                    <div key={project.id} className="card project-card animate-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h4>{project.name}</h4>
                            <span className={`badge ${getStatusBadge(project.status)}`}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                        </div>
                        <p className="project-ministry">{project.ministry}</p>
                        <p className="project-desc">
                            {project.description && project.description.length > 150
                                ? project.description.slice(0, 150) + '...'
                                : project.description}
                        </p>
                        <div className="project-meta">
                            {project.budget && <span><DollarSign size={12} /> {project.budget}</span>}
                            {project.location && <span><MapPin size={12} /> {project.location}</span>}
                            {project.start_date && (
                                <span><Calendar size={12} /> {new Date(project.start_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                            )}
                        </div>

                        {/* Progress */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                                <div className={`progress-fill ${project.status === 'completed' ? 'completed' : ''}`} style={{ width: `${project.progress}%` }} />
                            </div>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-600)' }}>{project.progress}%</span>
                        </div>

                        {/* Actions */}
                        {user && (
                            <div className="card-actions">
                                <button className="btn btn-secondary" onClick={() => openEdit(project)}><Pencil size={13} /> Edit</button>
                                <button className="btn btn-danger" onClick={() => setDeleteTarget(project)}><Trash2 size={13} /> Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {loading && <div className="empty-state"><FolderKanban /><h3>Loading projects...</h3></div>}
            {!loading && projects.length === 0 && <div className="empty-state"><FolderKanban /><h3>No projects found</h3></div>}

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Edit Project' : 'New Project'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave} className="crud-form">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Project Name *</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ministry</label>
                                        <input value={form.ministry} onChange={e => setForm({ ...form, ministry: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                            <option value="past">Past</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Budget</label>
                                        <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. $5M" />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Progress ({form.progress}%)</label>
                                    <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: e.target.value })} />
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
                        <h3>Delete Project?</h3>
                        <p>"{deleteTarget.name}" will be permanently removed.</p>
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
