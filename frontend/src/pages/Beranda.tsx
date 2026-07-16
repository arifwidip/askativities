import React, { useEffect, useState } from 'react';
import { useApp, api } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Award, Compass, Heart, ArrowRight } from 'lucide-react';
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl p-6 text-white text-center shadow-xl shadow-primary-500/20 flex flex-col items-center justify-center py-8 relative overflow-hidden"
      >
        {/* Background blobs for premium styling */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-lg -ml-8 -mb-8" />

        <span className="text-xs uppercase font-bold tracking-widest text-primary-100 mb-1 z-10">Total Tabungan Poin</span>
        
        <div className="text-7xl font-black my-2 flex items-center justify-center gap-2 drop-shadow-md z-10">
          <span>{selectedChild.totalPoints}</span>
          <span className="text-3xl text-yellow-300 animate-pulse">⭐️</span>
        </div>
        
        <p className="text-xs text-primary-50/80 max-w-[200px] mt-2 leading-relaxed z-10">
          Kumpulkan lebih banyak bintang dengan menyelesaikan tugas harianmu!
        </p>
      </motion.div>

      {/* Next Reward Progress */}
      {nextReward && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Reward Berikutnya</span>
              <h3 className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <span className="text-lg">{nextReward.icon || '🎁'}</span>
                {nextReward.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Butuh</span>
              <div className="font-extrabold text-sm text-primary-600">{nextReward.cost} ⭐️</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Progress</span>
              <span>{selectedChild.totalPoints} / {nextReward.cost} ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
              />
            </div>
          </div>
          
          <button
            onClick={() => navigate('/reward')}
            className="flex items-center justify-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 mt-1"
          >
            Lihat Semua Reward
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Motivation Banner */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 flex items-center gap-4">
        <div className="bg-emerald-500 text-white p-2.5 rounded-2xl">
          <Heart size={20} fill="currentColor" />
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          <strong>Ingat ya!</strong> Poin bintang diberikan jika kamu melakukan kebaikan dengan ikhlas dan ceria. Semangat!
        </p>
      </div>

    </div>
  );
};
