import React, { useEffect, useState } from 'react';
import { useApp, api } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Award, Compass, Heart, ArrowRight, Gift } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
}

export const Beranda: React.FC = () => {
  const { selectedChild, isLoading } = useApp();
  const [nextReward, setNextReward] = useState<Reward | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNextReward = async () => {
      if (!selectedChild) return;
      try {
        const res = await api.get('/rewards');
        const activeRewards = res.data;
        if (activeRewards.length > 0) {
          // Find rewards the child cannot afford yet, sorted by cost
          const lockedRewards = activeRewards
            .filter((r: Reward) => r.cost > selectedChild.totalPoints)
            .sort((a: Reward, b: Reward) => a.cost - b.cost);

          if (lockedRewards.length > 0) {
            setNextReward(lockedRewards[0]); // Cheapest locked reward
          } else {
            // If they can afford all, suggest the most expensive one!
            const sorted = activeRewards.sort((a: Reward, b: Reward) => b.cost - a.cost);
            setNextReward(sorted[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching rewards for progress:', err);
      }
    };

    fetchNextReward();
  }, [selectedChild]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        <span className="text-sm">Memuat data...</span>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-center">
        <div className="bg-primary-50 p-6 rounded-full text-primary-500 mb-4 animate-bounce">
          <Award size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Selamat Datang di Poin Anak!</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Aplikasi papan poin bintang untuk memotivasi kebiasaan baik anak. Silakan tambahkan anak terlebih dahulu di tab Admin.
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all text-sm"
        >
          Masuk ke Menu Admin
        </button>
      </div>
    );
  }

  // Calculate progress percent to next reward
  const progressPercent = nextReward
    ? Math.min(Math.round((selectedChild.totalPoints / nextReward.cost) * 100), 100)
    : 0;

  return (
    <div className="p-5 pb-28 flex flex-col gap-6">
      
      {/* Child Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
        <img
          src={selectedChild.avatarUrl}
          alt={selectedChild.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-primary-100 bg-slate-50 shadow-inner"
        />
        <div>
          <span className="text-xs font-semibold text-slate-400">Selamat pagi/siang,</span>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">{selectedChild.name}! 👋</h2>
        </div>
      </div>

      {/* Hero Points Circle */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="bg-gradient-to-br from-primary-500 via-indigo-500 to-violet-600 rounded-3xl p-6 text-white text-center shadow-xl shadow-primary-500/25 flex flex-col items-center justify-center py-9 relative overflow-hidden"
      >
        {/* Background blobs for premium styling */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full blur-xl -ml-8 -mb-8" />

        <span className="text-[10px] uppercase font-bold tracking-widest text-primary-100/90 mb-1.5 z-10">Total Tabungan Poin</span>
        
        <div className="text-7xl font-black my-1 flex items-center justify-center gap-2 drop-shadow-lg z-10">
          <motion.span
            key={selectedChild.totalPoints}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="inline-block"
          >
            {selectedChild.totalPoints}
          </motion.span>
          <motion.span 
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-3xl text-yellow-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)] select-none"
          >
            ⭐️
          </motion.span>
        </div>
        
        <p className="text-xs text-primary-50/70 max-w-[220px] mt-2.5 leading-relaxed z-10">
          Kumpulkan lebih banyak bintang dengan menyelesaikan tugas harianmu!
        </p>
      </motion.div>

      {/* Next Reward Progress */}
      {nextReward && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100/80 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Reward Berikutnya</span>
              <h3 className="font-extrabold text-slate-800 mt-1 flex items-center gap-2.5 text-sm">
                {nextReward.icon && nextReward.icon.startsWith('http') ? (
                  <img src={nextReward.icon} alt={nextReward.name} className="w-6 h-6 object-cover rounded-md" />
                ) : (
                  <span className="bg-amber-50 text-amber-600 p-1.5 rounded-lg">
                    <Gift size={14} />
                  </span>
                )}
                {nextReward.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Butuh</span>
              <div className="font-extrabold text-base text-primary-600 mt-0.5">{nextReward.cost} ⭐️</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-2 font-semibold">
              <span>Progres Target</span>
              <span>{selectedChild.totalPoints} / {nextReward.cost} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/40 p-[2px] relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 rounded-full relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]"
              >
                {/* Shimmer animation */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] w-[200%] h-full animate-shimmer" style={{ transform: 'translateX(-50%)' }} />
              </motion.div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/reward')}
            className="flex items-center justify-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 mt-1 active-press"
          >
            Lihat Semua Reward
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Motivation Banner */}
      <div className="bg-emerald-50/60 border border-emerald-100/50 rounded-3xl p-4 flex items-center gap-4">
        <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shadow-md shadow-emerald-500/10">
          <Heart size={18} fill="currentColor" />
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          <strong>Ingat ya!</strong> Poin bintang diberikan jika kamu melakukan kebaikan dengan ikhlas dan ceria. Semangat!
        </p>
      </div>

    </div>
  );
};
