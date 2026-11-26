import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Play, Check, Users } from 'lucide-react';
import { useApp } from '../lib/store';
import { LOJAS, lojaPorId } from '../data/lojas';
import { SETORES, type Setor } from '../data/layout';
import { getProduto } from '../data/produtos';
import { CHAVES, gravar, minutosDesde } from '../lib/armazenamento';
import { VENDEDORES, eventosSimulados, tituloProblema, type Evento, type Ticket } from '../lib/simulacao';
import { ResumoDoCaso, posicaoNaFila } from './Atendimento';

const ROTULO_STATUS: Record<Ticket['status'], string> = {
  aguardando: 'Aguardando',
  a_caminho: 'A caminho',
  em_atendimento: 'Em atendimento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

function Barras({ dados, total }: { dados: [string, number][]; total?: number }) {
  const max = Math.max(1, ...dados.map(([, v]) => v));
  if (!dados.length) return <p className="sub">Sem dados ainda.</p>;
  return (
    <div className="barras">
      {dados.map(([rot, v]) => (
        <div key={rot} className="barra" title={`${rot}: ${v}${total ? ` (${Math.round((v / total) * 100)}%)` : ''}`}>
          <span className="rot">{rot}</span>
          <span className="trilho">
            <span className="preench" style={{ width: `${(v / max) * 100}%`, display: 'block' }} />
          </span>
          <span className="num">{v}</span>
        </div>
      ))}
    </div>
  );
}

const contar = <T,>(itens: T[], chave: (x: T) => string | undefined) => {
  const m = new Map<string, number>();
  for (const i of itens) {
    const k = chave(i);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

function Indicadores({ lojaId }: { lojaId: string }) {
  const { eventos } = useApp();
  const [comSimulados, setComSimulados] = useState(true);
  const ev: Evento[] = useMemo(
    () => [...(comSimulados ? eventosSimulados(lojaId) : []), ...eventos.filter((e) => e.lojaId === lojaId)],
    [comSimulados, eventos, lojaId],
  );
  const buscas = ev.filter((e) => e.tipo === 'busca');
  const entendidas = buscas.filter((e) => e.resultado !== 'nao_entendi');
  const chamados = ev.filter((e) => e.tipo === 'chamado');
  const esperas = ev.filter((e) => e.espera != null && (e.tipo === 'chamado' || e.tipo === 'atendido')).map((e) => e.espera!);
  const rotas = ev.filter((e) => e.tipo === 'rota');
  const economiaMedia = rotas.length ? rotas.reduce((a, e) => a + (e.economia ?? 0), 0) / rotas.length : 0;
  const autoatendimento = buscas.length ? 1 - chamados.length / buscas.length : 0;

  const problemas = contar(buscas.filter((e) => e.resultado === 'problema'), (e) => tituloProblema(e.problemaId)).slice(0, 8);
  const naoEncontrados = contar(buscas.filter((e) => e.resultado === 'nao_entendi'), (e) => e.texto?.toLowerCase()).slice(0, 6);
  const rupturas = contar(ev.filter((e) => e.tipo === 'esgotado'), (e) => getProduto(e.produtoId ?? '')?.nome).slice(0, 5);
  const porSetor = contar(chamados, (e) => e.setor);
  const porHora = Array.from({ length: 14 }, (_, i) => i + 8).map((h) => [h, buscas.filter((e) => new Date(e.t).getHours() === h).length] as const);
  const maxHora = Math.max(1, ...porHora.map(([, v]) => v));
  const pico = porHora.reduce((a, b) => (b[1] > a[1] ? b : a), porHora[0]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <p style={{ color: 'var(--tinta-2)', maxWidth: '60ch' }}>Tudo o que os clientes perguntam, procuram e não encontram vira dado para a loja decidir reposição, sinalização e escala da equipe.</p>
        <label className="alternador">
          <input type="checkbox" checked={comSimulados} onChange={(e) => setComSimulados(e.target.checked)} />
          Incluir movimento simulado de um dia típico
        </label>
      </div>
      <div className="kpis">
        <div className="kpi">
          <div className="v">{buscas.length}</div>
          <div className="l">perguntas ao assistente</div>
        </div>
        <div className="kpi">
          <div className="v">{buscas.length ? Math.round((entendidas.length / buscas.length) * 100) : 0}%</div>
          <div className="l">entendidas pela IA, sem ajuda humana</div>
        </div>
        <div className="kpi">
          <div className="v">{Math.round(autoatendimento * 100)}%</div>
          <div className="l">resolvidas sem chamar especialista</div>
        </div>
        <div className="kpi">
          <div className="v">{Math.round(economiaMedia)} m</div>
          <div className="l">de caminhada poupada por rota otimizada</div>
        </div>
      </div>

      <div className="graficos">
        <section className="grafico">
          <h2>Problemas que os clientes trazem</h2>
          <p className="sub">Pedidos entendidos pelo assistente, por tipo de problema</p>
          <Barras dados={problemas} total={buscas.length} />
        </section>

        <section className="grafico">
          <h2>Procuraram e não encontraram</h2>
          <p className="sub">Termos sem produto correspondente no catálogo</p>
          <Barras dados={naoEncontrados} />
          {naoEncontrados[0] && (
            <p className="oportunidade">
              Oportunidade: "{naoEncontrados[0][0]}" foi procurado {naoEncontrados[0][1]} vezes. Vale avaliar incluir no sortimento ou sinalizar onde fica.
            </p>
          )}
        </section>

        <section className="grafico">
          <h2>Ruptura percebida pelo cliente</h2>
          <p className="sub">Produtos da lista que estavam esgotados na hora</p>
          <Barras dados={rupturas} />
          {rupturas[0] && <p className="oportunidade">Prioridade de reposição: {rupturas[0][0]}.</p>}
        </section>

        <section className="grafico">
          <h2>Movimento por hora</h2>
          <p className="sub">Perguntas ao assistente ao longo do dia</p>
          <div className="colunas" role="img" aria-label={`Pico às ${pico[0]}h com ${pico[1]} perguntas`}>
            {porHora.map(([h, v]) => (
              <div key={h} className={`coluna${h === pico[0] ? ' pico' : ''}`} title={`${h}h: ${v} perguntas`}>
                <span className="c" style={{ height: `${(v / maxHora) * 110}px` }} />
                <small>{h}h</small>
              </div>
            ))}
          </div>
          <p className="oportunidade">
            Pico às {pico[0]}h. {porSetor[0] ? `Os setores mais chamados são ${porSetor.slice(0, 2).map(([s]) => s).join(' e ')}: reforce a escala nesse horário.` : ''}
          </p>
        </section>

        <section className="grafico">
          <h2>Chamados por setor</h2>
          <p className="sub">
            Onde os clientes mais precisam de um especialista{esperas.length ? `. Espera média: ${(esperas.reduce((a, b) => a + b, 0) / esperas.length).toFixed(1).replace('.', ',')} min` : ''}
          </p>
          <Barras dados={porSetor} />
        </section>
      </div>
    </>
  );
}

export function Painel() {
  const { tickets, atualizarTicket, registrar } = useApp();
  const [lojaId, setLojaId] = useState(LOJAS[0].id);
  const [eu, setEu] = useState(VENDEDORES[0].nome);
  const [soMeuSetor, setSoMeuSetor] = useState(false);
  const [aba, setAba] = useState<'fila' | 'dados'>('fila');
  const [, tique] = useState(0);

  const meuSetor: Setor = VENDEDORES.find((v) => v.nome === eu)!.setor;

  // avisa às outras abas que há um vendedor real olhando a fila
  useEffect(() => {
    const bater = () => gravar(CHAVES.painel, Date.now());
    bater();
    const id = setInterval(() => {
      bater();
      tique((n) => n + 1);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const ativos = tickets
    .filter((t) => t.lojaId === lojaId && ['aguardando', 'a_caminho', 'em_atendimento'].includes(t.status))
    .filter((t) => !soMeuSetor || t.setor === meuSetor)
    .sort((a, b) => {
      const ordem = { aguardando: 0, a_caminho: 1, em_atendimento: 2, concluido: 3, cancelado: 4 };
      return ordem[a.status] - ordem[b.status] || a.criadoEm - b.criadoEm;
    });
  const concluidos = tickets.filter((t) => t.lojaId === lojaId && t.status === 'concluido' && Date.now() - t.atualizadoEm < 3600000).length;

  return (
    <div style={{ minHeight: '100dvh' }}>
      <header className="painel-topo">
        <span className="marca">
          <MapPin size={22} strokeWidth={2.6} /> Achei para a loja
        </span>
        <label>
          <span className="sr">Loja</span>
          <select value={lojaId} onChange={(e) => setLojaId(e.target.value)}>
            {LOJAS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr">Você é</span>
          <select value={eu} onChange={(e) => setEu(e.target.value)}>
            {VENDEDORES.map((v) => (
              <option key={v.nome} value={v.nome}>
                {v.nome}, {v.setor}
              </option>
            ))}
          </select>
        </label>
        <Link to="/">Voltar ao app do cliente</Link>
      </header>

      <main className="conteudo largo">
        <h1 className="sr">Painel da loja</h1>
        <div className="abas" role="tablist">
          <button role="tab" aria-selected={aba === 'fila'} className={aba === 'fila' ? 'ativa' : ''} onClick={() => setAba('fila')}>
            Fila de atendimento ({ativos.length})
          </button>
          <button role="tab" aria-selected={aba === 'dados'} className={aba === 'dados' ? 'ativa' : ''} onClick={() => setAba('dados')}>
            Indicadores da loja
          </button>
        </div>

        {aba === 'fila' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <p style={{ color: 'var(--tinta-2)' }}>
                {lojaPorId(lojaId).nome}: cada chamado chega com o caso resumido pelo assistente. {concluidos > 0 && `${concluidos} concluídos na última hora.`}
              </p>
              <label className="alternador">
                <input type="checkbox" checked={soMeuSetor} onChange={(e) => setSoMeuSetor(e.target.checked)} />
                Só {meuSetor}
              </label>
            </div>
            {ativos.length === 0 ? (
              <div className="vazio">
                <Users size={30} color="var(--tinta-3)" />
                <h2>Fila vazia</h2>
                <p>Quando um cliente chamar um especialista pelo app, o caso aparece aqui na hora.</p>
              </div>
            ) : (
              <div className="fila">
                {ativos.map((t) => {
                  const cor = SETORES.find((s) => s.nome === t.setor)?.cor;
                  return (
                    <article key={t.id} className={`ticket${t.doCliente && t.status === 'aguardando' ? ' novo' : ''}`}>
                      <div className="ticket-topo" style={{ borderTop: `5px solid ${cor}` }}>
                        <span className="ticket-senha">{t.senha}</span>
                        <span className="info">
                          {t.setor}
                          <br />
                          há {minutosDesde(t.criadoEm)} min{t.status === 'aguardando' ? `, ${posicaoNaFila(t, tickets)}º na fila` : ''}
                          {t.vendedor && t.status !== 'aguardando' ? `, com ${t.vendedor}` : ''}
                        </span>
                        <span className={`status-tag ${t.status}`}>{ROTULO_STATUS[t.status]}</span>
                      </div>
                      <div className="ticket-corpo">
                        <ResumoDoCaso resumo={t.resumo} />
                      </div>
                      <div className="ticket-acoes">
                        {t.status === 'aguardando' && (
                          <button className="btn btn-primario btn-pequeno" onClick={() => atualizarTicket(t.id, { status: 'a_caminho', vendedor: eu })}>
                            <Navigation size={16} /> Aceitar e ir até o cliente
                          </button>
                        )}
                        {t.status === 'a_caminho' && (
                          <button className="btn btn-primario btn-pequeno" onClick={() => atualizarTicket(t.id, { status: 'em_atendimento' })}>
                            <Play size={16} /> Cheguei: iniciar atendimento
                          </button>
                        )}
                        {t.status === 'em_atendimento' && (
                          <button
                            className="btn btn-primario btn-pequeno"
                            onClick={() => {
                              atualizarTicket(t.id, { status: 'concluido' });
                              registrar({ tipo: 'atendido', setor: t.setor, espera: (Date.now() - t.criadoEm) / 60000 });
                            }}
                          >
                            <Check size={16} /> Concluir atendimento
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <Indicadores lojaId={lojaId} />
        )}
      </main>
    </div>
  );
}
