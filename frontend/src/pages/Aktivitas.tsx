import React, { useEffect, useState } from 'react';
import { useApp, api } from '../context/AppContext';
import { Check, CheckCircle2, Award, Info, ListTodo, Search } from 'lucide-react';

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Activity {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  points: number;
}

export const Aktivitas: React.FC = () => {
  const { selectedChild, earnPoints, showConfirm, isLoading: isAppLoading } = useApp();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (activity.description && activity.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities');
      setActivities(res.data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleComplete = async (activity: Activity) => {
    if (!selectedChild) return;
    
    // Custom premium confirmation modal
    const confirmDone = await showConfirm({
      title: 'Konfirmasi Aktivitas',
      message: `Apakah ${selectedChild.name} sudah selesai melakukan "${activity.name}"?`,
      confirmText: 'Ya, Sudah!',
      cancelText: 'Belum',
      type: 'success'
    });
    if (!confirmDone) return;

    setLoadingMap((prev) => ({ ...prev, [activity.id]: true }));
    const success = await earnPoints(activity.id);
    setLoadingMap((prev) => ({ ...prev, [activity.id]: false }));

    if (success) {
      // Trigger confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#818cf8', '#fbbf24', '#34d399', '#f87171'],
      });
    } else {
      await showConfirm({
        title: 'Ups, Gagal',
        message: 'Gagal mencatat poin bintang anak. Silakan coba lagi.',
        confirmText: 'Mengerti',
        type: 'danger'
      });
    }
  };

  if (loading || isAppLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        <span className="text-sm">Memuat daftar aktivitas...</span>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-center">
        <Info size={40} className="text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm">Pilih anak terlebih dahulu di bagian atas untuk mencatat aktivitas.</p>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28 flex flex-col gap-4">
      <div className="shrink-0">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Daftar Aktivitas Baik</h2>
        <p className="text-xs text-slate-500 mt-1">
          Pilih aktivitas yang diselesaikan **{selectedChild.name}** untuk memberikan poin bintang!
        </p>
      </div>

      {activities.length > 0 && (
        <div className="relative shrink-0">
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-400"
          />
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
        </div>
      )}

      {activities.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
          Belum ada aktivitas. Silakan buat aktivitas baru di tab Admin.
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
          Tidak ada aktivitas yang cocok dengan pencarian "{searchQuery}".
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto">
          {filteredActivities.map((activity, idx) => {
            const isItemLoading = loadingMap[activity.id] || false;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22, delay: Math.min(idx * 0.04, 0.4) }}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-3 group hover:border-primary-100 transition-colors"
              >
                {/* Icon & Details */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="bg-primary-50 text-primary-600 p-3 rounded-2xl flex items-center justify-center shrink-0">
                    <ListTodo size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-800 leading-snug">{activity.name}</h3>
                    {activity.description && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">{activity.description}</p>
                    )}
                  </div>
                </div>

                {/* Point Button */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                    +{activity.points} ⭐️
                  </span>
                  
                  <button
                    disabled={isItemLoading}
                    onClick={() => handleComplete(activity)}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl shadow-md shadow-primary-500/10 active-press disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
                  >
                    {isItemLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Check size={16} strokeWidth={3} />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
