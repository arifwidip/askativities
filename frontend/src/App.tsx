import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Beranda } from './pages/Beranda';
import { Aktivitas } from './pages/Aktivitas';
import { Reward } from './pages/Reward';
import { Riwayat } from './pages/Riwayat';
import { Admin } from './pages/Admin';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Beranda />} />
            <Route path="aktivitas" element={<Aktivitas />} />
            <Route path="reward" element={<Reward />} />
            <Route path="riwayat" element={<Riwayat />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
