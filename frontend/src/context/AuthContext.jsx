import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await authAPI.getUser();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await authAPI.login(username, password);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  // صلاحيات مساعدة
  const isAdmin = user?.is_staff === true;
  const userBranchId = user?.branch_id || null;
  const userBranchName = user?.branch_name || null;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, userBranchId, userBranchName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
