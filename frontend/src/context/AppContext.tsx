import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Axios instance with default config
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Child {
  id: string;
  name: string;
  avatarUrl: string;
  totalPoints: number;
  createdAt: string;
}

export interface PointLog {
  id: string;
  childId: string;
  type: 'EARN' | 'REDEEM' | 'DEDUCT';
  amount: number;
  title: string;
  createdAt: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warn' | 'danger' | 'success';
}

interface AppContextType {
  children: Child[];
  selectedChild: Child | null;
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  isLoading: boolean;
  error: string | null;
  fetchChildren: () => Promise<void>;
  earnPoints: (activityId: string) => Promise<boolean>;
  redeemPoints: (rewardId: string) => Promise<{ success: boolean; message?: string }>;
  revokePoints: (logId: string) => Promise<{ success: boolean; message?: string }>;
  deductPoints: (childId: string, amount: number, title: string) => Promise<{ success: boolean; message?: string }>;
  adminToken: string | null;
  isAdmin: boolean;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => void;
  confirmState: {
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  
  // Custom Confirmation Modal state
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        options,
        resolve,
      });
    });
  };

  const handleConfirm = () => {
    if (confirmState) {
      confirmState.resolve(true);
      setConfirmState(null);
    }
  };

  const handleCancel = () => {
    if (confirmState) {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  };

  // Load auth token and selected child from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const savedChildId = localStorage.getItem('selectedChildId');
    if (savedChildId) {
      setSelectedChildIdState(savedChildId);
    }
  }, []);

  const setSelectedChildId = (id: string | null) => {
    setSelectedChildIdState(id);
    if (id) {
      localStorage.setItem('selectedChildId', id);
    } else {
      localStorage.removeItem('selectedChildId');
    }
  };

  const fetchChildren = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/children');
      setChildrenList(response.data);
      
      // If no child is selected, or the selected child doesn't exist anymore, select the first one
      if (response.data.length > 0) {
        const currentSavedId = localStorage.getItem('selectedChildId');
        const childExists = response.data.some((c: Child) => c.id === currentSavedId);
        if (!currentSavedId || !childExists) {
          setSelectedChildId(response.data[0].id);
        }
      } else {
        setSelectedChildId(null);
      }
    } catch (err: any) {
      console.error(err);
      setError('Gagal memuat data anak. Pastikan server aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  const earnPoints = async (activityId: string): Promise<boolean> => {
    if (!selectedChildId) return false;
    try {
      const response = await api.post(`/children/${selectedChildId}/earn`, { activityId });
      // Update local child points and logs
      setChildrenList((prev) =>
        prev.map((c) => (c.id === selectedChildId ? { ...c, totalPoints: response.data.child.totalPoints } : c))
      );
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const redeemPoints = async (rewardId: string): Promise<{ success: boolean; message?: string }> => {
    if (!selectedChildId) return { success: false, message: 'Tidak ada anak yang terpilih.' };
    try {
      const response = await api.post(`/children/${selectedChildId}/redeem`, { rewardId });
      // Update local child points
      setChildrenList((prev) =>
        prev.map((c) => (c.id === selectedChildId ? { ...c, totalPoints: response.data.child.totalPoints } : c))
      );
      return { success: true };
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Gagal menukarkan reward.';
      return { success: false, message: errMsg };
    }
  };

  const revokePoints = async (logId: string): Promise<{ success: boolean; message?: string }> => {
    if (!selectedChildId) return { success: false, message: 'Tidak ada anak yang terpilih.' };
    try {
      const response = await api.delete(`/children/${selectedChildId}/logs/${logId}`);
      // Update local child points
      setChildrenList((prev) =>
        prev.map((c) => (c.id === selectedChildId ? { ...c, totalPoints: response.data.child.totalPoints } : c))
      );
      return { success: true };
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Gagal membatalkan transaksi poin.';
      return { success: false, message: errMsg };
    }
  };

  const deductPoints = async (childId: string, amount: number, title: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(`/children/${childId}/deduct`, { amount, title });
      // Update local child points
      setChildrenList((prev) =>
        prev.map((c) => (c.id === childId ? { ...c, totalPoints: response.data.child.totalPoints } : c))
      );
      return { success: true };
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Gagal mengurangi poin.';
      return { success: false, message: errMsg };
    }
  };

  const loginAdmin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('adminToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
  };

  // Fetch children list on mount and when token changes (just to be safe)
  useEffect(() => {
    fetchChildren();
  }, [adminToken]);

  const selectedChild = childrenList.find((c) => c.id === selectedChildId) || null;

  return (
    <AppContext.Provider
      value={{
        children: childrenList,
        selectedChild,
        selectedChildId,
        setSelectedChildId,
        isLoading,
        error,
        fetchChildren,
        earnPoints,
        redeemPoints,
        revokePoints,
        deductPoints,
        adminToken,
        isAdmin: !!adminToken,
        loginAdmin,
        logoutAdmin,
        confirmState,
        showConfirm,
        handleConfirm,
        handleCancel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
