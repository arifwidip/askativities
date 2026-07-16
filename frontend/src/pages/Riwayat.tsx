import React, { useEffect, useState } from 'react';
import { useApp, api, PointLog } from '../context/AppContext';
import { Info, PlusCircle, MinusCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const Riwayat: React.FC = () => {
  const { selectedChild, isLoading: isAppLoading } = useApp();
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      const res = await api.get(`/children/${selectedChild.id}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedChild]);

  if (loading || isAppLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        <span className="text-sm">Memuat riwayat transaksi...</span>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-center">
        <Info size={40} className="text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm">Pilih anak terlebih dahulu di bagian atas untuk melihat riwayat.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-5 pb-28 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Riwayat Aktivitas & Hadiah</h2>
        <p className="text-xs text-slate-500 mt-1">
          Catatan lengkap penambahan bintang dan penukaran hadiah **{selectedChild.name}**.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-400">
          Belum ada riwayat transaksi poin. Mulailah dengan menyelesaikan aktivitas baik!
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {logs.map((log, idx) => {
            const isEarn = log.type === 'EARN';
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.5) }} // limit initial delays for long lists
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator Icon */}
                  <div className={`p-2 rounded-xl shrink-0 ${isEarn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isEarn ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-700 leading-snug">{log.title}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <Calendar size={10} />
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`font-extrabold text-sm ${isEarn ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isEarn ? '+' : '-'}{log.amount} ⭐️
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
