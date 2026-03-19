import { useState, useEffect } from 'react';
import { BarChart3, Users, Newspaper, FolderKanban, MessageSquareText, Eye, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { getAnalytics, trackEvent } from '../utils/api';

const COLORS = ['#1B8A2E', '#0047AB', '#D4A843', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'];

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        trackEvent('page_view', '/analytics');
        getAnalytics()
            .then(res => { setData(res); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="empty-state">
                <BarChart3 />
                <h3>Loading analytics...</h3>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="empty-state">
                <BarChart3 />
                <h3>No analytics data available</h3>
            </div>
        );
    }

    const { summary, projectsByStatus, officialsByCategory, newsByCategory, monthlyData } = data;

    return (
        <div>
            <div className="page-header">
                <h1>Analytics & Performance</h1>
                <p>Real-time usage analytics and engagement metrics</p>
            </div>

            {/* KPI Summary */}
            <div className="kpi-grid">
                <div className="kpi-card animate-in">
                    <div className="kpi-icon green"><Eye size={24} /></div>
                    <div className="kpi-info">
                        <h3>{summary.totalPageViews?.toLocaleString()}</h3>
                        <p>Page Views</p>
                        <span className="kpi-trend up">+24%</span>
                    </div>
                </div>
                <div className="kpi-card animate-in">
                    <div className="kpi-icon blue"><Users size={24} /></div>
                    <div className="kpi-info">
                        <h3>{summary.activeUsers?.toLocaleString()}</h3>
                        <p>Active Users</p>
                        <span className="kpi-trend up">+18%</span>
                    </div>
                </div>
                <div className="kpi-card animate-in">
                    <div className="kpi-icon gold"><MessageSquareText size={24} /></div>
                    <div className="kpi-info">
                        <h3>{summary.totalChatQueries?.toLocaleString()}</h3>
                        <p>Chat Queries</p>
                        <span className="kpi-trend up">+32%</span>
                    </div>
                </div>
                <div className="kpi-card animate-in">
                    <div className="kpi-icon purple"><TrendingUp size={24} /></div>
                    <div className="kpi-info">
                        <h3>{summary.satisfaction}%</h3>
                        <p>Satisfaction Rate</p>
                        <span className="kpi-trend up">+2.1%</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: '20px' }}>
                {/* Monthly Engagement */}
                <div className="card chart-card animate-in">
                    <h3>Monthly Engagement</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1B8A2E" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#1B8A2E" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0047AB" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#0047AB" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                            />
                            <Area type="monotone" dataKey="views" stroke="#1B8A2E" fill="url(#gradViews)" strokeWidth={2} />
                            <Area type="monotone" dataKey="users" stroke="#0047AB" fill="url(#gradUsers)" strokeWidth={2} />
                            <Legend />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Chat Queries Trend */}
                <div className="card chart-card animate-in">
                    <h3>Chat Queries Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                            />
                            <Bar dataKey="queries" fill="#D4A843" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid-2">
                {/* Projects by Status */}
                <div className="card chart-card animate-in">
                    <h3>Projects by Status</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={projectsByStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="count"
                                nameKey="status"
                                label={({ status, count }) => `${status}: ${count}`}
                            >
                                {projectsByStatus.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Officials by Category */}
                <div className="card chart-card animate-in">
                    <h3>Officials by Category</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={officialsByCategory} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={90} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                            />
                            <Bar dataKey="count" fill="#0047AB" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* News by Category */}
            {newsByCategory && newsByCategory.length > 0 && (
                <div className="card chart-card animate-in" style={{ marginTop: '20px' }}>
                    <h3>News Coverage by Category</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                        {newsByCategory.map((cat, i) => (
                            <div key={i} style={{
                                padding: '12px 20px', borderRadius: 'var(--radius-md)',
                                background: `${COLORS[i % COLORS.length]}10`,
                                border: `1px solid ${COLORS[i % COLORS.length]}30`,
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: COLORS[i % COLORS.length] }}>
                                    {cat.count}
                                </span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                                    {cat.category}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
