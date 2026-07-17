import React, { useEffect, useState, useRef } from 'react';
import { useApp, api, API_URL } from '../context/AppContext';
import { Info, Gift, ChevronLeft, ChevronRight, LayoutGrid, Sliders } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import confetti from 'canvas-confetti';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  cost: number;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 250 : -250,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 10,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 250 : -250,
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.22,
      ease: 'easeInOut',
    },
  }),
};

// Helper function to render CSS floating badge (CORS-safe)
const renderCSSFloatingBadge = (reward: Reward, isSmall: boolean, flat = false) => {
  const isUrl = reward.icon && (reward.icon.startsWith('http') || reward.icon.startsWith('/'));
  const transformClass = flat ? '' : 'transform rotateY(-15deg) rotateX(10deg)';
  
  // Larger size for active slide 3D card, smaller for peek/grid cards
  const sizeClass = isSmall ? 'w-20 h-20' : 'w-28 h-28';
  const imgSizeClass = isSmall ? 'rounded-2xl' : 'rounded-[22px]';
  const roundedClass = isSmall ? 'rounded-[24px]' : 'rounded-[28px]';

  if (isUrl) {
    const imgUrl = reward.icon.startsWith('/') ? `${API_URL}${reward.icon}` : reward.icon;
    return (
      <div className={`bg-white border border-slate-100 shadow-xl overflow-hidden p-1.5 flex items-center justify-center ${transformClass} ${sizeClass} ${roundedClass}`}>
        <img 
          src={imgUrl} 
          alt={reward.name} 
          className={`w-full h-full object-cover ${imgSizeClass}`} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }
  
  // Emoji or fallback
  const emoji = reward.icon || '🎁';
  const fontSizeClass = isSmall ? 'text-3xl' : 'text-5xl';
  const insetRoundedClass = isSmall ? 'rounded-[22px]' : 'rounded-[26px]';
  return (
    <div className={`bg-gradient-to-tr from-amber-50/70 via-white to-amber-100/30 border border-amber-200/50 shadow-md flex items-center justify-center relative ${transformClass} ${sizeClass} ${roundedClass} ${fontSizeClass}`}>
      <div className={`absolute inset-0.5 ${insetRoundedClass} bg-gradient-to-tr from-amber-400/10 to-yellow-300/5 blur-[1px]`} />
      <span className="z-10 drop-shadow-[0_2px_4px_rgba(217,119,6,0.15)] select-none">{emoji}</span>
    </div>
  );
};

// WebGL Floating 3D HTML Group component (CORS-safe)
const FloatingHTMLTile3D: React.FC<{ reward: Reward }> = ({ reward }) => {
  const groupRef = useRef<any>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Levitating float on Y axis (slow sinusoidal)
      groupRef.current.position.y = Math.sin(t * 1.6) * 0.16;
      // Continuous rotation on Y axis
      groupRef.current.rotation.y = t * 0.45;
      // Slight pitch tilt (X axis)
      groupRef.current.rotation.x = Math.sin(t * 0.8) * 0.04 + 0.12;
      // Slowly float on Z-axis (pulsating depth)
      groupRef.current.position.z = Math.sin(t * 1.2) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <Html 
        transform 
        distanceFactor={6}
        style={{ pointerEvents: 'none' }}
      >
        <div className="select-none pointer-events-none">
          {renderCSSFloatingBadge(reward, false, true)}
        </div>
      </Html>
    </group>
  );
};

// WebGL Stage Canvas Container
const WebGLStage: React.FC<{ reward: Reward }> = ({ reward }) => {
  return (
    <div className="h-40 relative w-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/80 to-slate-100/40 rounded-2xl border border-slate-100/60 overflow-visible mt-2 pointer-events-none">
      {/* 3D WebGL Canvas for Pedestal & Floating Group */}
      <Canvas 
        shadows 
        camera={{ position: [0, 0.25, 3.2], fov: 42 }}
        style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[3, 5, 2]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize-width={256} 
          shadow-mapSize-height={256} 
        />
        
        {/* 3D Cylinder Pedestal Base */}
        <mesh position={[0, -1.05, 0]} receiveShadow>
          <cylinderGeometry args={[1.05, 1.15, 0.16, 32]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.75} />
        </mesh>
        
        {/* Blue Neon Glow Strip in Pedestal */}
        <mesh position={[0, -0.96, 0]}>
          <cylinderGeometry args={[1.06, 1.06, 0.03, 32]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Floating 3D HTML Tile */}
        <FloatingHTMLTile3D reward={reward} />
      </Canvas>

      {/* Dynamic shadow projected on pedestal top */}
      <div className="absolute bottom-[20px] w-16 h-4 bg-slate-900/10 rounded-full animate-shadow-scale pointer-events-none" />
    </div>
  );
};

export const Reward: React.FC = () => {
  const { selectedChild, redeemPoints, showConfirm, isLoading: isAppLoading } = useApp();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'slide'>('grid'); // Default is grid
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(0);
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

  const handleNext = () => {
    if (rewards.length <= 1) return;
    setDirection(1);
    setActiveIdx((prev) => (prev + 1) % rewards.length);
  };

  const handlePrev = () => {
    if (rewards.length <= 1) return;
    setDirection(-1);
    setActiveIdx((prev) => (prev - 1 + rewards.length) % rewards.length);
  };

  const dragEndHandler = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!selectedChild) return;

    if (selectedChild.totalPoints < reward.cost) {
      await showConfirm({
        title: 'Poin Tidak Cukup',
        message: `Bintang ${selectedChild.name} saat ini (${selectedChild.totalPoints} ⭐️) belum cukup untuk menukarkan "${reward.name}" (${reward.cost} ⭐️).`,
        confirmText: 'Mengerti',
        cancelText: '',
        type: 'warn',
      });
      return;
    }

    const confirmRedeem = await showConfirm({
      title: 'Tukarkan Reward',
      message: `Apakah ${selectedChild.name} ingin menukarkan ${reward.cost} ⭐️ dengan "${reward.name}"?`,
      confirmText: 'Ya, Tukar!',
      cancelText: 'Batal',
      type: 'success',
    });
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
      await showConfirm({
        title: 'Berhasil!',
        message: `Selamat! "${reward.name}" berhasil ditukarkan. Silakan ambil hadiahmu!`,
        confirmText: 'Yay!',
        cancelText: '',
        type: 'success',
      });
    } else {
      await showConfirm({
        title: 'Gagal',
        message: result.message || 'Gagal menukarkan reward. Silakan coba lagi.',
        confirmText: 'OK',
        cancelText: '',
        type: 'danger',
      });
    }
  };

  const renderCardContent = (reward: Reward, isPeek: boolean, side?: 'left' | 'right') => {
    const pointsProgress = selectedChild ? selectedChild.totalPoints : 0;
    const progressPercent = Math.min(Math.round((pointsProgress / reward.cost) * 100), 100);
    const canAffordItem = pointsProgress >= reward.cost;
    const isItemLoading = loadingMap[reward.id] || false;

    if (isPeek) {
      const peekPositionClass = side === 'left'
        ? 'absolute w-[240px] h-[320px] opacity-25 scale-[0.74] -translate-x-[200px] z-0 blur-[1px]'
        : 'absolute w-[240px] h-[320px] opacity-25 scale-[0.74] translate-x-[200px] z-0 blur-[1px]';

      return (
        <div 
          key={`${reward.id}-peek-${side}`}
          className={`${peekPositionClass} bg-white border border-slate-100 rounded-[32px] p-4 flex flex-col justify-between pointer-events-none select-none transition-all duration-500 shadow-sm`}
        >
          {/* Cost Tag */}
          <div className="absolute top-4 right-4 bg-slate-50 text-slate-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-slate-150 z-20">
            {reward.cost} ⭐️
          </div>

          {/* Static CSS Pedestal Stage for better performance on peek cards */}
          <div className="h-32 relative w-full flex flex-col items-center justify-center perspective-3d bg-slate-50/50 rounded-2xl border border-slate-100 mt-2">
            <div className="absolute bottom-3 w-24 h-6 bg-slate-200/60 rounded-full border border-slate-350 transform rotateX(65deg)" />
            <div className="absolute bottom-5 z-10">
              {renderCSSFloatingBadge(reward, true)}
            </div>
          </div>

          <div className="text-center px-1">
            <h3 className="font-bold text-sm text-slate-400 truncate">{reward.name}</h3>
          </div>

          {/* Mock Button */}
          <div className="w-full py-2 bg-slate-50 text-slate-400 rounded-2xl text-center font-bold text-[10px] border border-slate-100">
            Lihat Detail
          </div>
        </div>
      );
    }

    return (
      <motion.div
        key={reward.id}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={dragEndHandler}
        className="absolute w-[275px] bg-white rounded-[32px] p-5 border border-slate-100 shadow-[0_12px_32px_rgba(0,0,0,0.05)] flex flex-col justify-between h-[360px] cursor-grab active:cursor-grabbing origin-center select-none z-10"
      >
        {/* Active Cost Tag */}
        <div className="absolute top-4 right-4 bg-amber-50 text-amber-700 font-black text-xs px-2.5 py-1 rounded-full border border-amber-100 z-20">
          {reward.cost} ⭐️
        </div>

        {/* Real 3D WebGL Pedestal Canvas Stage */}
        <WebGLStage reward={reward} />

        {/* Title & Description */}
        <div className="text-center px-1">
          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight leading-snug truncate">
            {reward.name}
          </h3>
          {reward.description ? (
            <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2 min-h-[2rem]">
              {reward.description}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1 leading-normal min-h-[2rem]">
              Kumpulkan {reward.cost} bintang untuk hadiah ini!
            </p>
          )}
        </div>

        {/* Progress & Action button */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50 p-[1px] relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full relative overflow-hidden shadow-inner"
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.45)_50%,transparent_100%)] w-[200%] h-full animate-shimmer" style={{ transform: 'translateX(-50%)' }} />
            </motion.div>
          </div>

          <button
            disabled={!canAffordItem || isItemLoading}
            onClick={() => handleRedeem(reward)}
            className={`w-full py-2.5 rounded-2xl font-black text-xs transition-colors active-press shadow-sm ${
              canAffordItem
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-amber-500/10'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-none'
            }`}
          >
            {isItemLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent mx-auto" />
            ) : canAffordItem ? (
              'Tukarkan Poin Bintang ⭐️'
            ) : (
              `Butuh ${reward.cost - pointsProgress} ⭐️ Lagi (${progressPercent}%)`
            )}
          </button>
        </div>
      </motion.div>
    );
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

  const prevIdx = rewards.length > 1 ? (activeIdx - 1 + rewards.length) % rewards.length : null;
  const nextIdx = rewards.length > 1 ? (activeIdx + 1) % rewards.length : null;

  return (
    <div className="p-5 pb-28 flex flex-col justify-between min-h-[calc(100vh-64px)] gap-4 overflow-x-hidden bg-transparent text-slate-800">
      {/* Title Header */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Katalog Reward</h2>
          <p className="text-xs text-slate-500 mt-1">
            Tukarkan poin bintangmu dengan hadiah seru!
          </p>
        </div>
        
        {/* Toggle Layout & Point Balance */}
        <div className="flex items-center gap-2">
          {/* Layout Toggle Buttons */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/20 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-primary-600 shadow-sm scale-105 font-bold' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Grid"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('slide')}
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                viewMode === 'slide' 
                  ? 'bg-white text-primary-600 shadow-sm scale-105 font-bold' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tampilan Slide 3D"
            >
              <Sliders size={16} />
            </button>
          </div>
          
          {/* Balance Badge */}
          <div className="bg-white border border-slate-100 rounded-2xl px-3 py-1.5 flex items-center gap-1.5 shrink-0 shadow-sm">
            <span className="text-xs font-bold text-slate-500">Saldo:</span>
            <span className="font-extrabold text-sm text-primary-600">{selectedChild.totalPoints} ⭐️</span>
          </div>
        </div>
      </div>

      {rewards.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400 flex-1 flex items-center justify-center">
          Belum ada reward. Silakan buat reward baru di tab Admin.
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW LAYOUT (2 Columns) */
        <div className="flex-1 overflow-y-auto mt-2 pr-1">
          <div className="grid grid-cols-2 gap-4">
            {rewards.map((reward, idx) => {
              const pointsProgress = selectedChild.totalPoints;
              const progressPercent = Math.min(Math.round((pointsProgress / reward.cost) * 100), 100);
              const canAffordItem = pointsProgress >= reward.cost;
              const isItemLoading = loadingMap[reward.id] || false;

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22, delay: Math.min(idx * 0.04, 0.4) }}
                  className="bg-white rounded-[28px] p-4 border border-slate-100/90 shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Grid Cost Tag */}
                  <div className="absolute top-3 right-3 bg-amber-50 text-amber-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-100 z-10">
                    {reward.cost} ⭐️
                  </div>

                  {/* Simple flat icon display for grid mode */}
                  <div className="h-24 w-full flex items-center justify-center mt-1 pointer-events-none">
                    {reward.icon && (reward.icon.startsWith('http') || reward.icon.startsWith('/')) ? (
                      <img
                        src={reward.icon.startsWith('/') ? `${API_URL}${reward.icon}` : reward.icon}
                        alt={reward.name}
                        className="w-20 h-20 object-cover rounded-2xl shadow-sm border border-slate-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-5xl select-none leading-none">
                        {reward.icon || '🎁'}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-800 leading-snug truncate">
                      {reward.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 leading-normal">
                      {reward.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>

                  {/* Progress & Redeem Button */}
                  <div className="flex flex-col gap-2">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50 p-[0.5px]">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full relative overflow-hidden shadow-inner"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <button
                      disabled={!canAffordItem || isItemLoading}
                      onClick={() => handleRedeem(reward)}
                      className={`w-full py-2 rounded-2xl font-bold text-[11px] shadow-sm transition-colors active-press ${
                        canAffordItem
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-amber-500/10'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-none'
                      }`}
                    >
                      {isItemLoading ? (
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent mx-auto" />
                      ) : canAffordItem ? (
                        'Tukarkan ⭐️'
                      ) : (
                        `Kurang ${reward.cost - pointsProgress} ⭐️`
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* SLIDE VIEW LAYOUT (3D Carousel) */
        <div className="flex-1 flex flex-col justify-center my-auto">
          {/* Horizontal Slider Stage with Peeking Cards */}
          <div className="relative h-[370px] w-full flex items-center justify-center overflow-visible">
            {/* Left Card Peek */}
            {prevIdx !== null && prevIdx !== activeIdx && (
              renderCardContent(rewards[prevIdx], true, 'left')
            )}

            {/* Active Center Card */}
            <AnimatePresence initial={false} custom={direction}>
              {rewards[activeIdx] && renderCardContent(rewards[activeIdx], false)}
            </AnimatePresence>

            {/* Right Card Peek */}
            {nextIdx !== null && nextIdx !== activeIdx && nextIdx !== prevIdx && (
              renderCardContent(rewards[nextIdx], true, 'right')
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center px-6 mt-4 shrink-0">
            <button
              onClick={handlePrev}
              disabled={rewards.length <= 1}
              className="bg-white border border-slate-100 shadow-sm p-2.5 rounded-full text-slate-400 hover:text-slate-600 disabled:opacity-30 active-press transition-colors"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            
            {/* Indicator dots */}
            <div className="flex gap-2">
              {rewards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (rewards.length <= 1) return;
                    setDirection(idx > activeIdx ? 1 : -1);
                    setActiveIdx(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIdx === idx ? 'w-5 bg-primary-500' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={rewards.length <= 1}
              className="bg-white border border-slate-100 shadow-sm p-2.5 rounded-full text-slate-400 hover:text-slate-600 disabled:opacity-30 active-press transition-colors"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
