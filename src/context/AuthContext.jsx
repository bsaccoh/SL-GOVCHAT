import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('govchat_token'));

    useEffect(() => {
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ id: payload.id, email: payload.email, name: payload.name, role: payload.role });
            } catch {
                localStorage.removeItem('govchat_token');
                setToken(null);
            }
        }
    }, [token]);

    const loginUser = (tokenStr, userData) => {
        localStorage.setItem('govchat_token', tokenStr);
        setToken(tokenStr);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('govchat_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loginUser, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
