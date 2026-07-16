import React, { useEffect, useState } from 'react';
import { useApp, api } from '../context/AppContext';
import { Info, Gift, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  cost: number;
}

export const Reward: React.FC = () => {
  const { selectedChild, redeemPoints, isLoading: isAppLoading } = useApp();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchRewards = async () => {
    try {
      const res = await api.get('/rewards');
      setRewards(res.data);
    } catch (err) {
      console.error('Error fetching rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!selectedChild) return;

    if (selectedChild.totalPoints < reward.cost) {
      alert('Poin bintang tidak cukup!');
      return;
    }

    const confirmRedeem = window.confirm(
      `Apakah ${selectedChild.name} ingin menukarkan ${reward.cost} ⭐️ dengan "${reward.name}"?`
    );
    if (!confirmRedeem) return;

    setLoadingMap((prev) => ({ ...prev, [reward.id]: true }));
    const result = await redeemPoints(reward.id);
    setLoadingMap((prev) => ({ ...prev, [reward.id]: false }));

    if (result.success) {
      // Trigger a special reward confetti!
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#fb7185', '#60a5fa', '#a78bfa'],
      });
      alert(`Selamat! "${reward.name}" berhasil ditukarkan.`);
    } else {
      alert(result.message || 'Gagal menukarkan reward.');
    }
  };

  if (loading || isAppLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        <span className="text-sm">Memuat daftar reward...</span>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-center">
        <Info size={40} className="text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm">Pilih anak terlebih dahulu di bagian atas untuk menukarkan reward.</p>
      </div>
    );
  }

  return (
    <div className="p-5 pb-28 flex flex-col gap-5">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Katalog Reward</h2>
          <p className="text-xs text-slate-500 mt-1">
            Tukarkan akumulasi poin bintangmu dengan hadiah seru!
          </p>
        </div>
        <div className="bg-primary-50 border border-primary-100 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-500">Saldo:</span>
          <span className="font-extrabold text-sm text-primary-600">{selectedChild.totalPoints} ⭐️</span>
        </div>
      </div>

      {rewards.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
          Belum ada reward. Silakan buat reward baru di tab Admin.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {rewards.map((reward, idx) => {
            const isItemLoading = loadingMap[reward.id] || false;
            const canAfford = selectedChild.totalPoints >= reward.cost;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                {/* Points cost tag */}
                <div className="absolute top-3 right-3 bg-amber-50 text-amber-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-100">
                  {reward.cost} ⭐️
                </div>

                {/* Reward detail */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-2xl text-2xl flex items-center justify-center font-bold">
                    <span role="img" aria-label="reward-icon">
                      {reward.icon.length <= 2 ? reward.icon : '🎁'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 leading-snug line-clamp-2">{reward.name}</h3>
                    {reward.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{reward.description}</p>
                    )}
                  </div>
                </div>

                {/* Redeem Action */}
                <button
                  disabled={!canAfford || isItemLoading}
                  onClick={() => handleRedeem(reward)}
                  className={`w-full py-2.5 rounded-2xl font-bold text-xs shadow-sm transition-all duration-150 active:scale-95 ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-amber-500/10'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-none'
                  }`}
                >
                  {isItemLoading ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent mx-auto" />
                  ) : canAfford ? (
                    'Tukarkan ⭐️'
                  ) : (
                    `Kurang ${reward.cost - selectedChild.totalPoints} ⭐️`
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
