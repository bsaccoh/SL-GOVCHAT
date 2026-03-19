import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Users, FolderKanban, MessageSquareText, BarChart3, TrendingUp, ArrowRight, Sparkles, Globe, FileText } from 'lucide-react';
import { getNews, getAnalytics, trackEvent } from '../utils/api';

export default function Home() {
    const [news, setNews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        trackEvent('page_view', '/');
        Promise.all([
            getNews({ limit: 4 }).catch(() => ({ data: [] })),
            getAnalytics().catch(() => null),
        ]).then(([newsRes, analyticsRes]) => {
            setNews(newsRes.data || []);
            setStats(analyticsRes?.summary || null);
            setLoading(false);
        });
    }, []);

    const kpis = stats ? [
        { label: 'News Articles', value: stats.totalNews, icon: Newspaper, color: 'green', trend: '+12%' },
        { label: 'Public Officials', value: stats.totalOfficials, icon: Users, color: 'blue', trend: null },
        { label: 'Gov. Projects', value: stats.totalProjects, icon: FolderKanban, color: 'gold', trend: '+3' },
        { label: 'Active Users', value: stats.activeUsers?.toLocaleString(), icon: BarChart3, color: 'purple', trend: '+18%' },
    ] : [];

    const quickLinks = [
        { label: 'News & Updates', desc: 'Latest government press releases', icon: Newspaper, to: '/news', color: 'var(--green)' },
        { label: 'Public Officials', desc: 'Directory of government appointees', icon: Users, to: '/officials', color: 'var(--blue)' },
        { label: 'Government Projects', desc: 'Track national development projects', icon: FolderKanban, to: '/projects', color: 'var(--gold)' },
        { label: 'AI Assistant', desc: 'Ask about government services', icon: MessageSquareText, to: '/chatbot', color: 'var(--green)' },
        { label: 'Publications', desc: 'Official policy documents', icon: FileText, to: '/news', color: '#8b5cf6' },
        { label: 'Analytics', desc: 'Usage & performance metrics', icon: BarChart3, to: '/analytics', color: 'var(--blue)' },
    ];

    return (
        <div>
            {/* Hero Banner */}
            <div className="hero-banner">
                <h2>🇸🇱 Welcome to GovChat Sierra Leone</h2>
                <p>Your official digital hub for government information, services, and citizen engagement. Access verified news, projects, and AI-powered assistance.</p>
            </div>

            {/* KPI Cards */}
            {stats && (
                <div className="kpi-grid">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="kpi-card animate-in">
                            <div className={`kpi-icon ${kpi.color}`}>
                                <kpi.icon size={24} />
                            </div>
                            <div className="kpi-info">
                                <h3>{kpi.value}</h3>
                                <p>{kpi.label}</p>
                                {kpi.trend && <span className="kpi-trend up">{kpi.trend}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Access Grid */}
            <div className="page-header" style={{ marginTop: '8px' }}>
                <h1>Quick Access</h1>
                <p>Navigate to key sections of the platform</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {quickLinks.map((link, i) => (
                    <div
                        key={i}
                        className="card animate-in"
                        style={{ padding: '20px', cursor: 'pointer' }}
                        onClick={() => navigate(link.to)}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                background: `${link.color}15`, color: link.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <link.icon size={22} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '4px' }}>
                                    {link.label}
                                </h4>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{link.desc}</p>
                            </div>
                            <ArrowRight size={16} style={{ color: 'var(--gray-300)', marginTop: '4px' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Latest News */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1>Latest News</h1>
                        <p>Recent government updates and press releases</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/news')}>
                        View All <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <div className="news-grid">
                {news.map((article, i) => (
                    <div key={article.id} className="card news-card animate-in">
                        <div className="news-card-header">
                            <span className="badge badge-green">{article.category}</span>
                        </div>
                        <h3>{article.title}</h3>
                        <p>{article.summary}</p>
                        <div className="news-card-footer">
                            <span>{article.author}</span>
                            <span>{new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="empty-state">
                    <Sparkles />
                    <h3>Loading dashboard...</h3>
                    <p>Fetching the latest government information</p>
                </div>
            )}
        </div>
    );
}
