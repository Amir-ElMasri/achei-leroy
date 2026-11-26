import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './lib/store';
import { Layout } from './components/Layout';
import { Inicio } from './pages/Inicio';
import { Assistente } from './pages/Assistente';
import { Lista } from './pages/Lista';
import { Rota } from './pages/Rota';
import { Produto } from './pages/Produto';
import { Atendimento } from './pages/Atendimento';
import { Painel } from './pages/Painel';

function RolarParaTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/assistente') window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <RolarParaTopo />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/assistente" element={<Assistente />} />
            <Route path="/lista" element={<Lista />} />
            <Route path="/rota" element={<Rota />} />
            <Route path="/produto/:id" element={<Produto />} />
            <Route path="/atendimento" element={<Atendimento />} />
          </Route>
          <Route path="/painel" element={<Painel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </HashRouter>
  );
}
