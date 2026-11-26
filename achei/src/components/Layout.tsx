import { NavLink, Link, Outlet } from 'react-router-dom';
import { House, MessagesSquare, ListChecks, Map, Headset, MapPin, Store } from 'lucide-react';
import { useApp } from '../lib/store';
import { LOJAS } from '../data/lojas';
import { SeloIA } from './comuns';

export function Layout() {
  const { lista, lojaId, trocarLoja, statusIA, meuTicket } = useApp();
  const pendentes = lista.filter((i) => !i.coletado && !i.jaTenho).length;
  const chamadoAtivo = meuTicket && meuTicket.status !== 'concluido';

  return (
    <div className="app">
      <header className="topo">
        <Link to="/" className="marca" aria-label="Achei, página inicial">
          <MapPin size={24} strokeWidth={2.6} />
          Achei
        </Link>
        <SeloIA status={statusIA} />
        <label className="topo-loja" title="Loja em que você está">
          <Store size={16} />
          <span className="sr">Loja</span>
          <select value={lojaId} onChange={(e) => trocarLoja(e.target.value)}>
            {LOJAS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome.replace('Loja ', '')}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main>
        <Outlet />
      </main>
      <nav className="nav" aria-label="Navegação principal">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'ativo' : '')}>
          <House size={22} />
          Início
        </NavLink>
        <NavLink to="/assistente" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          <MessagesSquare size={22} />
          Assistente
        </NavLink>
        <NavLink to="/lista" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          <ListChecks size={22} />
          Lista
          {pendentes > 0 && <span className="contador">{pendentes}</span>}
        </NavLink>
        <NavLink to="/rota" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          <Map size={22} />
          Rota
        </NavLink>
        <NavLink to="/atendimento" className={({ isActive }) => (isActive ? 'ativo' : '')}>
          <Headset size={22} />
          Especialista
          {chamadoAtivo && <span className="contador">1</span>}
        </NavLink>
      </nav>
    </div>
  );
}
