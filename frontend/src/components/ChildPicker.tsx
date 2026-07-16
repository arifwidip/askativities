import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChildPicker: React.FC = () => {
  const { children, selectedChild, setSelectedChildId, isAdmin } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (children.length === 0) {
    return (
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full font-medium active:scale-95 transition-transform"
      >
        <Plus size={14} />
        Tambah Anak
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 rounded-full py-1 pl-1 pr-3 shadow-sm active:scale-95 transition-all"
      >
        <img
          src={selectedChild?.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'}
          alt={selectedChild?.name || 'Anak'}
          className="w-7 h-7 rounded-full object-cover border border-slate-100 bg-slate-50"
        />
        <span className="font-semibold text-sm text-slate-700">{selectedChild?.name || 'Pilih Anak'}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ganti Anak
            </div>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChildId(child.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                  selectedChild?.id === child.id ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-slate-600'
                }`}
              >
                <img
                  src={child.avatarUrl}
                  alt={child.name}
                  className="w-6 h-6 rounded-full border border-slate-100 bg-slate-50"
                />
                <span className="text-sm truncate">{child.name}</span>
              </button>
            ))}
            
            {isAdmin && (
              <div className="border-t border-slate-100 mt-2 pt-2 px-2">
                <button
                  onClick={() => {
                    navigate('/admin');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-center font-medium bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                >
                  <Plus size={12} />
                  Kelola Anak
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
