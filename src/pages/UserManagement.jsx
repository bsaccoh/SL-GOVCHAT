import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, X, AlertTriangle, Shield, Mail, Calendar, Tag } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser, trackEvent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
    { value: 'admin', label: 'Administrator', color: 'badge-gold' },
    { value: 'editor', label: 'Editor', color: 'badge-green' },
    { value: 'viewer', label: 'Viewer', color: 'badge-blue' },
];

const DEFAULT_CATEGORIES = [
    'General', 'Ministry of Finance', 'Ministry of Health', 'Ministry of Education',
    'Ministry of Agriculture', 'Ministry of Works', 'Ministry of Defence',
    'Ministry of Justice', 'Ministry of Trade', 'Ministry of Lands',
    'Ministry of Social Welfare', 'Ministry of Foreign Affairs',
    'Office of the President', 'National Revenue Authority', 'Parliament', 'Other',
];

const emptyForm = { name: '', email: '', password: '', role: 'viewer', category: 'General' };

export default function UserManagement() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    // CRUD state
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { trackEvent('page_view', '/user-management'); fetchUsers(); }, []);

    async function fetchUsers() {
        setLoading(true);
        setError('');
        try {
            const res = await getUsers();
            setUsers(res.data || []);
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }

    function getRoleBadge(role) {
        const r = ROLES.find(x => x.value === role);
        return r ? r.color : 'badge-gray';
    }

    function getRoleLabel(role) {
        const r = ROLES.find(x => x.value === role);
        return r ? r.label : role;
    }

    function getInitials(name) {
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    // CRUD
    function openCreate() {
        setEditItem(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    function openEdit(u) {
        setEditItem(u);
        setForm({
            name: u.name || '',
            email: u.email || '',
            password: '',
            role: u.role || 'viewer',
            category: u.category || 'General',
        });
        setShowForm(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) {
                const data = { name: form.name, email: form.email, role: form.role, category: form.category };
                if (form.password) data.password = form.password;
                await updateUser(editItem.id, data);
            } else {
                if (!form.password) { alert('Password is required for new users'); setSaving(false); return; }
                await createUser(form);
            }
            setShowForm(false);
            fetchUsers();
        } catch (err) { alert(err.message); }
        setSaving(false);
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteUser(deleteTarget.id);
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) { alert(err.message); }
    }

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="empty-state" style={{ marginTop: '80px' }}>
                <Shield size={48} />
                <h3>Admin Access Required</h3>
                <p>You need administrator privileges to manage users.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header-row">
                <div className="page-header">
                    <h1>User Management</h1>
                    <p>Add, edit, and manage user accounts and roles</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Plus size={16} /> Add User
                </button>
            </div>

            {/* Stats */}
            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="kpi-card">
                    <div className="kpi-icon green"><Users size={24} /></div>
                    <div className="kpi-info"><h3>{users.length}</h3><p>Total Users</p></div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon gold"><Shield size={24} /></div>
                    <div className="kpi-info"><h3>{users.filter(u => u.role === 'admin').length}</h3><p>Admins</p></div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon blue"><Pencil size={24} /></div>
                    <div className="kpi-info"><h3>{users.filter(u => u.role === 'editor').length}</h3><p>Editors</p></div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon purple"><Users size={24} /></div>
                    <div className="kpi-info"><h3>{users.filter(u => u.role === 'viewer').length}</h3><p>Viewers</p></div>
                </div>
            </div>

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.08)', color: '#dc2626',
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)', marginBottom: '16px',
                }}>
                    {error}
                </div>
            )}

            {/* Users Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>Joined</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={tdStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 600, fontSize: 'var(--text-xs)',
                                        }}>
                                            {getInitials(u.name)}
                                        </div>
                                        <span style={{ fontWeight: 500, color: 'var(--gray-800)' }}>{u.name}</span>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                                        <Mail size={13} /> {u.email}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <span className={`badge ${getRoleBadge(u.role)}`}>{getRoleLabel(u.role)}</span>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                                        <Tag size={12} /> {u.category || 'General'}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-400)', fontSize: 'var(--text-xs)' }}>
                                        <Calendar size={12} />
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-secondary" style={{ padding: '6px 8px' }} onClick={() => openEdit(u)} title="Edit">
                                            <Pencil size={14} />
                                        </button>
                                        {u.id !== currentUser.id && (
                                            <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => setDeleteTarget(u)} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>No users found</div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editItem ? 'Edit User' : 'Create New User'}</h2>
                            <button className="modal-close" onClick={() => setShowForm(false)}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleSave} className="crud-form">
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. John Smith" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="e.g. john@govchat.gov.sl" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{editItem ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            placeholder={editItem ? '••••••••' : 'Minimum 6 characters'}
                                            required={!editItem}
                                            minLength={editItem ? undefined : 6}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Role *</label>
                                        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Category / Department</label>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ flex: 1 }}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 10px', flexShrink: 0 }}
                                            onClick={() => setShowAddCategory(!showAddCategory)}
                                            title="Add new category"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    {showAddCategory && (
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                            <input
                                                value={newCategory}
                                                onChange={e => setNewCategory(e.target.value)}
                                                placeholder="Type new category name..."
                                                style={{ flex: 1 }}
                                                autoFocus
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const trimmed = newCategory.trim();
                                                        if (trimmed && !categories.includes(trimmed)) {
                                                            setCategories(prev => [...prev, trimmed]);
                                                            setForm({ ...form, category: trimmed });
                                                            setNewCategory('');
                                                            setShowAddCategory(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                style={{ padding: '8px 14px', flexShrink: 0 }}
                                                onClick={() => {
                                                    const trimmed = newCategory.trim();
                                                    if (trimmed && !categories.includes(trimmed)) {
                                                        setCategories(prev => [...prev, trimmed]);
                                                        setForm({ ...form, category: trimmed });
                                                        setNewCategory('');
                                                        setShowAddCategory(false);
                                                    }
                                                }}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    background: 'var(--gray-50)', borderRadius: 'var(--radius-md)',
                                    padding: '12px 16px', fontSize: 'var(--text-xs)', color: 'var(--gray-500)',
                                }}>
                                    <strong>Role permissions:</strong><br />
                                    <strong>Admin</strong> — Full access, manage users & all content<br />
                                    <strong>Editor</strong> — Can create and edit content<br />
                                    <strong>Viewer</strong> — Read-only access
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editItem ? 'Update User' : 'Create User')}
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
                        <h3>Delete User?</h3>
                        <p>"{deleteTarget.name}" ({deleteTarget.email}) will be permanently removed.</p>
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

const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 'var(--text-xs)',
    color: 'var(--gray-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const tdStyle = {
    padding: '12px 16px',
};
