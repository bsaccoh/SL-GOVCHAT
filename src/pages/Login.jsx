import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import { login as loginAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await loginAPI(email, password);
            loginUser(res.token, res.user);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        }
        setLoading(false);
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">SL</div>
                    <h1>GovChat Sierra Leone</h1>
                    <p>Sign in to access administration</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@govchat.gov.sl"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : (
                            <>
                                <LogIn size={16} /> Sign In
                            </>
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, color: 'var(--gray-600)' }}>
                        <Shield size={12} /> Secure Government Access
                    </div>
                    <p>Demo credentials: admin@govchat.gov.sl / admin123</p>
                </div>
            </div>
        </div>
    );
}
