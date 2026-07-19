import React, { useState, useEffect } from 'react';
import { useApp, api, Child } from '../context/AppContext';
import { Lock, LogOut, Plus, Trash2, ShieldCheck, ListTodo, Gift, Users, Pencil, X, MinusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ACTIVITY_ICONS = ['🛌', '📚', '🧹', '🪥', '🍽️', '🎒', '🥦', '🤝', '🎨', '🚶', '✨'];
const REWARD_ICONS = ['🎮', '🍦', '🎡', '🧸', '🍫', '🍕', '🍿', '🚲', '💵', '🎁'];

export const Admin: React.FC = () => {
  const { isAdmin, loginAdmin, logoutAdmin, children, fetchChildren, showConfirm, deductPoints } = useApp();
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Tab State
  const [activeSubTab, setActiveSubTab] = useState<'children' | 'activities' | 'rewards'>('children');

  // Child Management States
  const [childName, setChildName] = useState('');
  const [childAvatar, setChildAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isChildLoading, setIsChildLoading] = useState(false);

  // Point Deduction States
  const [deductingChildId, setDeductingChildId] = useState<string | null>(null);
  const [deductAmount, setDeductAmount] = useState<number>(5);
  const [deductReason, setDeductReason] = useState('');
  const [isDeductLoading, setIsDeductLoading] = useState(false);

  // Activity Management States
  const [activities, setActivities] = useState<any[]>([]);
  const [actName, setActName] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actPoints, setActPoints] = useState(10);
  const [isActLoading, setIsActLoading] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);

  // Reward Management States
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewName, setRewName] = useState('');
  const [rewDesc, setRewDesc] = useState('');
  const [rewCost, setRewCost] = useState(50);
  const [rewImage, setRewImage] = useState<File | null>(null);
  const [rewImagePreview, setRewImagePreview] = useState<string | null>(null);
  const [isRewLoading, setIsRewLoading] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);

  // Load lists when admin status is true
  useEffect(() => {
    if (isAdmin) {
      fetchActivities();
      fetchRewards();
    }
  }, [isAdmin]);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities');
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await api.get('/rewards');
      setRewards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      loginAdmin(res.data.token);
    } catch (err: any) {
      console.error(err);
      setLoginError(err.response?.data?.error || 'Email atau password salah.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Child Avatar File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChildAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle Add Child (multipart/form-data upload)
  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !childAvatar) {
      await showConfirm({ title: 'Validasi', message: 'Nama dan avatar wajib diisi.', confirmText: 'OK', cancelText: '', type: 'warn' });
      return;
    }

    setIsChildLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', childName);
      formData.append('avatar', childAvatar);

      await api.post('/children', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setChildName('');
      setChildAvatar(null);
      setAvatarPreview(null);
      
      // Reset input element
      const fileInput = document.getElementById('avatar-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchChildren();
      await showConfirm({ title: 'Berhasil', message: 'Anak berhasil ditambahkan!', confirmText: 'OK', cancelText: '', type: 'success' });
    } catch (err: any) {
      console.error(err);
      await showConfirm({ title: 'Gagal', message: err.response?.data?.error || 'Gagal menambahkan anak.', confirmText: 'OK', cancelText: '', type: 'danger' });
    } finally {
      setIsChildLoading(false);
    }
  };

  // Handle Delete Child
  const handleDeleteChild = async (id: string, name: string) => {
    const confirmDel = await showConfirm({
      title: 'Hapus Profil Anak',
      message: `Apakah Anda yakin ingin menghapus "${name}"? Seluruh data tabungan bintang dan riwayat anak juga akan terhapus permanen.`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });
    if (!confirmDel) return;

    try {
      await api.delete(`/children/${id}`);
      fetchChildren();
      await showConfirm({
        title: 'Berhasil',
        message: 'Profil anak berhasil dihapus.',
        confirmText: 'OK',
        cancelText: '',
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      await showConfirm({
        title: 'Gagal',
        message: 'Gagal menghapus anak. Silakan coba lagi.',
        confirmText: 'OK',
        cancelText: '',
        type: 'danger',
      });
    }
  };

  // Handle Point Deduction
  const handleDeductPoints = async (e: React.FormEvent, childId: string) => {
    e.preventDefault();
    if (deductAmount <= 0 || !deductReason) return;

    setIsDeductLoading(true);
    try {
      const res = await deductPoints(childId, deductAmount, deductReason);
      if (res.success) {
        setDeductingChildId(null);
        setDeductReason('');
        setDeductAmount(5);
        fetchChildren(); // refresh list to show updated points
        await showConfirm({
          title: 'Berhasil',
          message: `Berhasil mengurangi ${deductAmount} ⭐️ dari tabungan bintang anak.`,
          confirmText: 'OK',
          cancelText: '',
          type: 'success',
        });
      } else {
        await showConfirm({
          title: 'Gagal',
          message: res.message || 'Gagal mengurangi poin.',
          confirmText: 'OK',
          cancelText: '',
          type: 'danger',
        });
      }
    } catch (err: any) {
      console.error(err);
      await showConfirm({
        title: 'Gagal',
        message: 'Gagal mengurangi poin.',
        confirmText: 'OK',
        cancelText: '',
        type: 'danger',
      });
    } finally {
      setIsDeductLoading(false);
    }
  };

  // Handle Add Activity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actName || actPoints <= 0) return;

    setIsActLoading(true);
    try {
      await api.post('/activities', {
        name: actName,
        description: actDesc,
        icon: '✨',
        points: actPoints,
      });

      setActName('');
      setActDesc('');
      setActPoints(10);
      fetchActivities();
      await showConfirm({ title: 'Berhasil', message: 'Aktivitas berhasil ditambahkan!', confirmText: 'OK', cancelText: '', type: 'success' });
    } catch (err) {
      console.error(err);
      await showConfirm({ title: 'Gagal', message: 'Gagal menambahkan aktivitas.', confirmText: 'OK', cancelText: '', type: 'danger' });
    } finally {
      setIsActLoading(false);
    }
  };

  // Handle Delete Activity (Soft Delete)
  const handleDeleteActivity = async (id: string, name: string) => {
    const confirmDel = await showConfirm({
      title: 'Hapus Aktivitas',
      message: `Apakah Anda yakin ingin menghapus aktivitas "${name}" dari daftar?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'warn',
    });
    if (!confirmDel) return;
    try {
      await api.delete(`/activities/${id}`);
      fetchActivities();
    } catch (err) {
      console.error(err);
      await showConfirm({
        title: 'Gagal',
        message: 'Gagal menghapus aktivitas. Silakan coba lagi.',
        confirmText: 'OK',
        cancelText: '',
        type: 'danger',
      });
    }
  };

  // Handle Edit Activity
  const handleEditActivity = (act: any) => {
    setEditingActivity(act);
    setActName(act.name);
    setActDesc(act.description || '');
    setActPoints(act.points);
  };

  const handleCancelEditActivity = () => {
    setEditingActivity(null);
    setActName('');
    setActDesc('');
    setActPoints(10);
  };

  // Handle Update Activity
  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    if (!actName || actPoints <= 0) return;

    setIsActLoading(true);
    try {
      await api.patch(`/activities/${editingActivity.id}`, {
        name: actName,
        description: actDesc,
        icon: '✨',
        points: actPoints,
      });

      setEditingActivity(null);
      setActName('');
      setActDesc('');
      setActPoints(10);
      fetchActivities();
      await showConfirm({ title: 'Berhasil', message: 'Aktivitas berhasil diperbarui!', confirmText: 'OK', cancelText: '', type: 'success' });
    } catch (err) {
      console.error(err);
      await showConfirm({ title: 'Gagal', message: 'Gagal memperbarui aktivitas.', confirmText: 'OK', cancelText: '', type: 'danger' });
    } finally {
      setIsActLoading(false);
    }
  };

  // Handle Add Reward (with file upload)
  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewName || rewCost <= 0) return;

    setIsRewLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', rewName);
      formData.append('description', rewDesc);
      formData.append('cost', String(rewCost));
      if (rewImage) {
        formData.append('image', rewImage);
      }

      await api.post('/rewards', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setRewName('');
      setRewDesc('');
      setRewImage(null);
      setRewImagePreview(null);
      setRewCost(50);

      // Reset file input element
      const fileInput = document.getElementById('reward-image-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchRewards();
      await showConfirm({ title: 'Berhasil', message: 'Reward berhasil ditambahkan!', confirmText: 'OK', cancelText: '', type: 'success' });
    } catch (err: any) {
      console.error(err);
      await showConfirm({ title: 'Gagal', message: err.response?.data?.error || 'Gagal menambahkan reward.', confirmText: 'OK', cancelText: '', type: 'danger' });
    } finally {
      setIsRewLoading(false);
    }
  };

  // Handle Delete Reward (Soft Delete)
  const handleDeleteReward = async (id: string, name: string) => {
    const confirmDel = await showConfirm({
      title: 'Hapus Reward',
      message: `Apakah Anda yakin ingin menghapus reward "${name}" dari katalog?`,
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'warn',
    });
    if (!confirmDel) return;
    try {
      await api.delete(`/rewards/${id}`);
      fetchRewards();
    } catch (err) {
      console.error(err);
      await showConfirm({
        title: 'Gagal',
        message: 'Gagal menghapus reward. Silakan coba lagi.',
        confirmText: 'OK',
        cancelText: '',
        type: 'danger',
      });
    }
  };

  // Handle Edit Reward
  const handleEditReward = (rew: any) => {
    setEditingReward(rew);
    setRewName(rew.name);
    setRewDesc(rew.description || '');
    setRewCost(rew.cost);
    setRewImage(null);
    setRewImagePreview(null);
    const fileInput = document.getElementById('reward-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleCancelEdit = () => {
    setEditingReward(null);
    setRewName('');
    setRewDesc('');
    setRewCost(50);
    setRewImage(null);
    setRewImagePreview(null);
    const fileInput = document.getElementById('reward-image-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle Update Reward
  const handleUpdateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    if (!rewName || rewCost <= 0) return;

    setIsRewLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', rewName);
      formData.append('description', rewDesc);
      formData.append('cost', String(rewCost));
      if (rewImage) {
        formData.append('image', rewImage);
      }

      await api.patch(`/rewards/${editingReward.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setEditingReward(null);
      setRewName('');
      setRewDesc('');
      setRewCost(50);
      setRewImage(null);
      setRewImagePreview(null);
      const fileInput = document.getElementById('reward-image-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchRewards();
      await showConfirm({ title: 'Berhasil', message: 'Reward berhasil diperbarui!', confirmText: 'OK', cancelText: '', type: 'success' });
    } catch (err: any) {
      console.error(err);
      await showConfirm({ title: 'Gagal', message: err.response?.data?.error || 'Gagal memperbarui reward.', confirmText: 'OK', cancelText: '', type: 'danger' });
    } finally {
      setIsRewLoading(false);
    }
  };

  // 1. LOGIN SCREEN
  if (!isAdmin) {
    return (
      <div className="p-5 pb-28 flex flex-col justify-center h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-primary-50 p-3.5 rounded-2xl text-primary-600 mb-3">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Login Orang Tua</h2>
            <p className="text-xs text-slate-400 mt-1">Hanya Orang Tua / Admin yang dapat mengelola sistem</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orangtua@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {loginError && (
              <span className="text-xs text-rose-500 font-medium text-center">{loginError}</span>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-500/10 active-press transition-colors text-sm mt-2 disabled:opacity-50"
            >
              {isLoggingIn ? 'Memvalidasi...' : 'Masuk Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD SCREEN
  return (
    <div className="p-5 pb-28 flex flex-col gap-5">
      
      {/* Header and Logout */}
      <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-600" />
          <span className="font-bold text-xs text-slate-700">Dashboard Orang Tua</span>
        </div>
        <button
          onClick={logoutAdmin}
          className="flex items-center gap-1 text-xs text-rose-500 font-bold active-press"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="bg-slate-200/50 p-1.5 rounded-2xl flex items-center gap-1">
        <button
          onClick={() => setActiveSubTab('children')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'children' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
          }`}
        >
          <Users size={14} />
          Anak
        </button>
        <button
          onClick={() => setActiveSubTab('activities')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'activities' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
          }`}
        >
          <ListTodo size={14} />
          Aktivitas
        </button>
        <button
          onClick={() => setActiveSubTab('rewards')}
          className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'rewards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
          }`}
        >
          <Gift size={14} />
          Reward
        </button>
      </div>

      {/* SUB TAB: CHILDREN MANAGEMENT */}
      {activeSubTab === 'children' && (
        <div className="flex flex-col gap-5">
          {/* Add Child Form */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-1">
              <Plus size={16} />
              Tambah Profil Anak Baru
            </h3>
            <form onSubmit={handleAddChild} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Anak</label>
                <input
                  type="text"
                  required
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Contoh: Afi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Avatar (Unggah Foto)</label>
                <input
                  id="avatar-input"
                  type="file"
                  required
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {avatarPreview && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Preview:</span>
                    <img src={avatarPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isChildLoading}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs active-press transition-colors disabled:opacity-50 mt-1"
              >
                {isChildLoading ? 'Mengunggah...' : 'Simpan Profil Anak'}
              </button>
            </form>
          </div>

          {/* Children List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-3">Daftar Anak Terdaftar</h3>
            {children.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada anak terdaftar.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {children.map((child) => (
                  <div key={child.id} className="flex flex-col p-2.5 hover:bg-slate-50/50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={child.avatarUrl} alt={child.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-50" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-700">{child.name}</h4>
                          <span className="text-[10px] text-slate-400">{child.totalPoints} ⭐️</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (deductingChildId === child.id) {
                              setDeductingChildId(null);
                            } else {
                              setDeductingChildId(child.id);
                              setDeductReason('');
                              setDeductAmount(5);
                            }
                          }}
                          className={`p-2 rounded-xl active:scale-90 transition-all ${
                            deductingChildId === child.id ? 'text-rose-600 bg-rose-50' : 'text-rose-500 hover:bg-rose-50'
                          }`}
                          title="Kurangi Poin"
                        >
                          <MinusCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id, child.name)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl active:scale-90 transition-transform"
                          title="Hapus Profil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {deductingChildId === child.id && (
                      <form onSubmit={(e) => handleDeductPoints(e, child.id)} className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-2.5">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alasan Pengurangan</label>
                            <input
                              type="text"
                              required
                              value={deductReason}
                              onChange={(e) => setDeductReason(e.target.value)}
                              placeholder="Misal: Terlambat tidur"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500"
                            />
                          </div>
                          <div className="w-20">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah (⭐️)</label>
                            <input
                              type="number"
                              required
                              min={1}
                              max={child.totalPoints}
                              value={deductAmount}
                              onChange={(e) => setDeductAmount(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDeductingChildId(null)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={isDeductLoading}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-50"
                          >
                            {isDeductLoading ? 'Mengurangi...' : 'Kurangi'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: ACTIVITIES MANAGEMENT */}
      {activeSubTab === 'activities' && (
        <div className="flex flex-col gap-5">
          {/* Add / Edit Activity Form */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-1">
              {editingActivity ? <Pencil size={16} /> : <Plus size={16} />}
              {editingActivity ? 'Edit Aktivitas' : 'Buat Aktivitas Baru'}
            </h3>
            <form onSubmit={editingActivity ? handleUpdateActivity : handleAddActivity} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Aktivitas</label>
                <input
                  type="text"
                  required
                  value={actName}
                  onChange={(e) => setActName(e.target.value)}
                  placeholder="Contoh: Merapikan Tempat Tidur"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deskripsi (Opsional)</label>
                <textarea
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  placeholder="Penjelasan tugas agar anak mengerti"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nilai Poin (⭐️)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={actPoints}
                    onChange={(e) => setActPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                {editingActivity && (
                  <button
                    type="button"
                    onClick={handleCancelEditActivity}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs active-press transition-colors"
                  >
                    <X size={14} className="inline mr-1" />
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isActLoading}
                  className={`font-bold py-2.5 rounded-xl text-xs active-press transition-colors disabled:opacity-50 ${
                    editingActivity
                      ? 'flex-1 bg-amber-500 hover:bg-amber-600 text-white'
                      : 'w-full bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isActLoading ? 'Menyimpan...' : editingActivity ? 'Perbarui Aktivitas' : 'Simpan Aktivitas'}
                </button>
              </div>
            </form>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-3">Aktivitas Aktif</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada aktivitas.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <span className="text-primary-600 bg-primary-50 p-2.5 rounded-xl">
                        <ListTodo size={16} />
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-700">{act.name}</h4>
                        <span className="text-[10px] text-emerald-600 font-semibold">+{act.points} ⭐️</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditActivity(act)}
                        className="text-slate-400 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-xl active:scale-90 transition-transform"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(act.id, act.name)}
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl active:scale-90 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: REWARDS MANAGEMENT */}
      {activeSubTab === 'rewards' && (
        <div className="flex flex-col gap-5">
          {/* Add / Edit Reward Form */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-1">
              {editingReward ? <Pencil size={16} /> : <Plus size={16} />}
              {editingReward ? 'Edit Reward' : 'Buat Katalog Reward Baru'}
            </h3>
            <form onSubmit={editingReward ? handleUpdateReward : handleAddReward} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Hadiah / Reward</label>
                <input
                  type="text"
                  required
                  value={rewName}
                  onChange={(e) => setRewName(e.target.value)}
                  placeholder="Contoh: Main Game 30 Menit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deskripsi (Opsional)</label>
                <textarea
                  value={rewDesc}
                  onChange={(e) => setRewDesc(e.target.value)}
                  placeholder="Penjelasan hadiah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Harga Reward (⭐️)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={rewCost}
                    onChange={(e) => setRewCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gambar / Foto Hadiah</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setRewImage(file);
                        setRewImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    id="reward-image-input"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              {(rewImagePreview || (editingReward && editingReward.icon?.startsWith('http'))) && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={rewImagePreview || editingReward.icon}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-2xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}

              <div className="flex gap-2 mt-1">
                {editingReward && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs active-press transition-colors"
                  >
                    <X size={14} className="inline mr-1" />
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isRewLoading}
                  className={`font-bold py-2.5 rounded-xl text-xs active-press transition-colors disabled:opacity-50 ${
                    editingReward
                      ? 'flex-1 bg-amber-500 hover:bg-amber-600 text-white'
                      : 'w-full bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isRewLoading ? 'Menyimpan...' : editingReward ? 'Perbarui Reward' : 'Simpan Reward'}
                </button>
              </div>
            </form>
          </div>

          {/* Rewards List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 mb-3">Reward Aktif</h3>
            {rewards.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada reward.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {rewards.map((rew) => (
                  <div key={rew.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      {rew.icon && rew.icon.startsWith('http') ? (
                        <img
                          src={rew.icon}
                          alt={rew.name}
                          className="w-10 h-10 object-cover rounded-xl border border-slate-100"
                        />
                      ) : (
                        <span className="text-amber-600 bg-amber-50 p-2.5 rounded-xl">
                          <Gift size={16} />
                        </span>
                      )}
                      <div>
                        <h4 className="font-bold text-xs text-slate-700">{rew.name}</h4>
                        <span className="text-[10px] text-amber-600 font-semibold">{rew.cost} ⭐️</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditReward(rew)}
                        className="text-slate-400 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-xl active:scale-90 transition-transform"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteReward(rew.id, rew.name)}
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl active:scale-90 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
