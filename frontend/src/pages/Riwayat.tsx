import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useApp, api, PointLog } from '../context/AppContext';
import { Info, PlusCircle, MinusCircle, Calendar, RotateCcw, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PAGE_LIMIT = 15;

interface LogGroup {
  dateKey: string;
  dateLabel: string;
  logs: PointLog[];
}

export const Riwayat: React.FC = () => {
  const { selectedChild, isLoading: isAppLoading, isAdmin, revokePoints, showConfirm } = useApp();
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [totalLogs, setTotalLogs] = useState<number>(0);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const handleRevoke = async (log: PointLog) => {
    const isEarn = log.type === 'EARN';
    const confirmMessage = isEarn
      ? `Apakah Anda yakin ingin membatalkan aktivitas "${log.title}"? Poin anak akan dikurangi sebanyak ${log.amount} ⭐️.`
      : `Apakah Anda yakin ingin membatalkan penukaran "${log.title}"? Poin anak akan dikembalikan sebanyak ${log.amount} ⭐️.`;

    const confirm = await showConfirm({
      title: 'Batalkan Transaksi',
      message: confirmMessage,
      confirmText: 'Ya, Batalkan',
      cancelText: 'Kembali',
      type: 'warn',
    });

    if (!confirm) return;

    try {
      const res = await revokePoints(log.id);
      if (res.success) {
        setLogs((prev) => prev.filter((item) => item.id !== log.id));
        setTotalLogs((prev) => Math.max(0, prev - 1));
        await showConfirm({
          title: 'Berhasil',
          message: 'Transaksi berhasil dibatalkan.',
          confirmText: 'OK',
          cancelText: '',
          type: 'success',
        });
      } else {
        await showConfirm({
          title: 'Gagal',
          message: res.message || 'Gagal membatalkan transaksi.',
          confirmText: 'OK',
          cancelText: '',
          type: 'danger',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = useCallback(
    async (pageToFetch: number, resetList = false) => {
      if (!selectedChild) return;

      if (resetList) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await api.get(`/children/${selectedChild.id}/logs`, {
          params: { page: pageToFetch, limit: PAGE_LIMIT },
        });

        const newLogs: PointLog[] = res.data.logs || [];
        const serverHasMore: boolean = Boolean(res.data.hasMore);
        const total: number = res.data.total || 0;

        if (resetList) {
          setLogs(newLogs);
        } else {
          setLogs((prev) => [...prev, ...newLogs]);
        }

        setHasMore(serverHasMore);
        setTotalLogs(total);
        setPage(pageToFetch);
      } catch (err) {
        console.error('Error fetching child logs:', err);
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [selectedChild]
  );

  // Reset and fetch initial page when selected child changes
  useEffect(() => {
    if (selectedChild) {
      setPage(1);
      setHasMore(true);
      fetchLogs(1, true);
    }
  }, [selectedChild?.id, fetchLogs]);

  // Set up IntersectionObserver for infinite scroll trigger
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || loadingInitial || loadingMore || !selectedChild) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingInitial && !loadingMore) {
          fetchLogs(page + 1, false);
        }
      },
      {
        root: null, // Viewport / nearest scrollable container
        rootMargin: '120px', // Fetch slightly before user reaches exact bottom
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingInitial, loadingMore, page, selectedChild, fetchLogs]);

  // Group logs by date
  const groupedLogs = useMemo<LogGroup[]>(() => {
    const groups: LogGroup[] = [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = `${yesterdayObj.getFullYear()}-${String(yesterdayObj.getMonth() + 1).padStart(2, '0')}-${String(yesterdayObj.getDate()).padStart(2, '0')}`;

    logs.forEach((log) => {
      const dateObj = new Date(log.createdAt);
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

      let formattedDate = dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (dateKey === todayStr) {
        formattedDate = `Hari Ini (${formattedDate})`;
      } else if (dateKey === yesterdayStr) {
        formattedDate = `Kemarin (${formattedDate})`;
      }

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.dateKey === dateKey) {
        lastGroup.logs.push(log);
      } else {
        groups.push({
          dateKey,
          dateLabel: formattedDate,
          logs: [log],
        });
      }
    });

    return groups;
  }, [logs]);

  if (!selectedChild && !isAppLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-center">
        <Info size={40} className="text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm">Pilih anak terlebih dahulu di bagian atas untuk melihat riwayat.</p>
      </div>
    );
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-5 pb-28 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Riwayat Aktivitas & Hadiah</h2>
          <p className="text-xs text-slate-500 mt-1">
            Catatan lengkap penambahan bintang dan penukaran hadiah <strong className="text-slate-700">{selectedChild?.name}</strong>.
          </p>
        </div>
        {totalLogs > 0 && (
          <span className="shrink-0 bg-primary-50 text-primary-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-primary-100/80">
            {totalLogs} Transaksi
          </span>
        )}
      </div>

      {loadingInitial || isAppLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-4 w-32 bg-slate-200/60 rounded animate-pulse" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="w-12 h-4 bg-slate-100 rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
          Belum ada riwayat transaksi poin. Mulailah dengan menyelesaikan aktivitas baik!
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedLogs.map((group) => (
            <div key={group.dateKey} className="flex flex-col gap-2.5">
              {/* Section List Header */}
              <div className="sticky top-0 bg-slate-50/90 backdrop-blur-md py-1.5 px-0.5 z-[5] flex items-center gap-2">
                <div className="p-1 rounded-lg bg-primary-50 text-primary-600">
                  <Calendar size={13} />
                </div>
                <span className="text-xs font-extrabold text-slate-700 tracking-tight">{group.dateLabel}</span>
                <div className="h-px bg-slate-200/80 flex-1 ml-1" />
              </div>

              {/* Group Items */}
              <div className="flex flex-col gap-2.5">
                {group.logs.map((log, idx) => {
                  const isEarn = log.type === 'EARN';
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: Math.min((idx % PAGE_LIMIT) * 0.02, 0.2) }}
                      className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between gap-3 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Status Indicator Icon */}
                        <div className={`p-2 rounded-xl shrink-0 ${isEarn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isEarn ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-xs text-slate-700 leading-snug truncate">{log.title}</h3>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Clock size={10} />
                            <span>Pukul {formatTime(log.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <div className="text-right">
                          <span className={`font-extrabold text-sm ${isEarn ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isEarn ? '+' : '-'}{log.amount} ⭐️
                          </span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleRevoke(log)}
                            className="p-2 rounded-xl text-slate-400 [@media(hover:hover)_and_(pointer:fine)]:hover:text-rose-600 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-rose-50 active:scale-95 transition-[color,background-color,transform] shrink-0"
                            title={isEarn ? "Batalkan penambahan poin" : "Batalkan penukaran reward"}
                          >
                            <RotateCcw size={15} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sentinel element for IntersectionObserver */}
          <div ref={observerTarget} className="h-4 w-full" />

          {/* Infinite scroll loading indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 py-3 text-slate-400 text-xs">
              <Loader2 size={16} className="animate-spin text-primary-500" />
              <span>Memuat transaksi lainnya...</span>
            </div>
          )}

          {/* End of list state */}
          {!hasMore && logs.length > 0 && (
            <div className="flex items-center justify-center gap-1.5 py-4 text-slate-400 text-xs font-medium border-t border-slate-100 mt-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Semua riwayat telah ditampilkan</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
