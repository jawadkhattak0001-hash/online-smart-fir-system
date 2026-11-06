import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on load
    const storedUser = localStorage.getItem('@smartfir_user');
    const storedToken = localStorage.getItem('@smartfir_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      
      if (res.ok && (data.success || data.token)) {
        const userData = data.user || data;
        const token = data.token;
        
        localStorage.setItem('@smartfir_token', token);
        localStorage.setItem('@smartfir_user', JSON.stringify(userData));
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('@smartfir_token');
    localStorage.removeItem('@smartfir_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);