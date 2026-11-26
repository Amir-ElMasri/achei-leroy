import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, Footprints, Headset, ListChecks, MessagesSquare, ArrowUpDown, MoveHorizontal, Flag, PackageX } from 'lucide-react';
import { useApp, type ItemLista } from '../lib/store';
import { getProduto } from '../data/produtos';
import { departamento, pontoDaPrateleira, ENTRADA, ATENDIMENTO, xCorredor, NIVEIS, GONDOLA_FUNDO, GONDOLA_FRENTE, NUM_CORREDORES, type Ponto } from '../data/layout';
import { calcularRota } from '../lib/rota';
import { MapaLoja, type MarcadorParada } from '../components/MapaLoja';
import { PlacaCorredor } from '../components/comuns';
import { Gondola } from '../components/Gondola';

interface Parada {
  chave: string;
  ponto: Ponto;
  corredor: number;
  modulo: number;
  itens: ItemLista[];
}

function agrupar(itens: ItemLista[]): Parada[] {
  const mapa = new Map<string, Parada>();
  for (const i of itens) {
    const p = getProduto(i.produtoId)!;
    const chave = `c${p.corredor}-m${p.modulo}`;
    if (!mapa.has(chave)) mapa.set(chave, { chave, ponto: pontoDaPrateleira(p.corredor, p.modulo), corredor: p.corredor, modulo: p.modulo, itens: [] });
    mapa.get(chave)!.itens.push(i);
  }
  return [...mapa.values()];
}

/** se a pessoa tocar em cima de uma gôndola, a posição vai para o corredor mais próximo */
function ajustarPosicao(p: Ponto): Ponto {
  const naGondola = p.y >= GONDOLA_FUNDO.y0 && p.y < GONDOLA_FRENTE.y1;
  if (!naGondola) return { x: Math.min(96, Math.max(4, p.x)), y: Math.min(96, Math.max(4, p.y)) };
  let k = Math.round((p.x - 7.5) / 5);
  k = Math.min(NUM_CORREDORES, Math.max(1, k));
  return { x: xCorredor(k), y: p.y };
}

const opcoesPosicao = [
  { valor: 'entrada', rotulo: 'Entrada da loja', ponto: ENTRADA },
  ...Array.from({ length: NUM_CORREDORES }, (_, i) => ({ valor: `c${i + 1}`, rotulo: `Corredor ${i + 1}: ${departamento(i + 1).nome}`, ponto: { x: xCorredor(i + 1), y: 62 } })),
  { valor: 'atendimento', rotulo: 'Balcão de atendimento', ponto: ATENDIMENTO },
];

export function Rota() {
  const { lista, posicao, posicaoDefinida, definirPosicao, alternarColetado, registrar, estoque } = useApp();
  const registradas = useRef(new Set<string>());

  // itens esgotados ficam fora da rota (a lista mostra o equivalente ou outra loja)
  const esgotados = lista.filter((i) => !i.coletado && !i.jaTenho && (estoque[i.produtoId] ?? 0) <= 0);
  const pendentes = lista.filter((i) => !i.coletado && !i.jaTenho && (estoque[i.produtoId] ?? 0) > 0);
  const pegos = lista.filter((i) => i.coletado && !i.jaTenho);
  const chavePendentes = pendentes.map((i) => i.produtoId).sort().join(',');

  const rota = useMemo(() => {
    const paradas = agrupar(pendentes);
    return calcularRota(posicao, paradas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chavePendentes, posicao.x, posicao.y]);

  const paradasFeitas = useMemo(() => agrupar(pegos), [pegos.map((i) => i.produtoId).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // registra a rota otimizada (distância e economia) para os indicadores da loja
  useEffect(() => {
    if (!rota.ordem.length || posicaoDefinida) return;
    const chave = chavePendentes;
    if (registradas.current.has(chave)) return;
    registradas.current.add(chave);
    registrar({ tipo: 'rota', metros: rota.distancia, economia: Math.max(0, rota.distanciaNaOrdemDaLista - rota.distancia) });
  }, [rota, chavePendentes, posicaoDefinida, registrar]);

  if (!lista.length) {
    return (
      <div className="conteudo">
        <div className="vazio">
          <h1>Ainda não há rota</h1>
          <p>Quando você montar uma lista, eu traço o caminho mais curto passando por todos os itens até os caixas.</p>
          <Link to="/assistente" className="btn btn-primario">
            <MessagesSquare size={20} /> Falar com o assistente
          </Link>
        </div>
      </div>
    );
  }

  const proxima = rota.ordem[0] as Parada | undefined;
  const marcadores: MarcadorParada[] = [
    ...paradasFeitas.filter((f) => !rota.ordem.some((o) => o.chave === f.chave)).map((f) => ({ chave: `f-${f.chave}`, ponto: f.ponto, numero: 0, feita: true, atual: false })),
    ...rota.ordem.map((p, i) => ({ chave: p.chave, ponto: p.ponto, numero: i + 1, feita: false, atual: i === 0 })),
  ];
  const economia = rota.distanciaNaOrdemDaLista - rota.distancia;
  const valorPosicao = !posicaoDefinida
    ? 'entrada'
    : (opcoesPosicao.find((o) => Math.abs(o.ponto.x - posicao.x) < 0.01 && Math.abs(o.ponto.y - posicao.y) < 0.01)?.valor ?? 'mapa');

  const peguei = (item: ItemLista, parada: Parada) => {
    alternarColetado(item.produtoId);
    const restantes = parada.itens.filter((i) => i.produtoId !== item.produtoId && !i.coletado);
    if (!restantes.length) definirPosicao(parada.ponto);
  };

  return (
    <div className="conteudo largo">
      <div className="cabecalho-pagina">
        <div>
          <h1>Sua rota</h1>
          <p>{pendentes.length ? 'O caminho mais curto passando por todos os itens até os caixas.' : 'Tudo pego. Agora é só seguir para os caixas.'}</p>
        </div>
      </div>

      <div className="rota-grade">
        <div className="mapa-moldura">
          <MapaLoja paradas={marcadores} trechos={rota.trechos} trechoAtual={0} voce={posicao} aoTocar={(p) => definirPosicao(ajustarPosicao(p))} />
          <div className="mapa-legenda">
            <span>
              <i className="leg-voce" /> Você
            </span>
            <span>
              <i className="leg-parada" /> Paradas em ordem
            </span>
            <span>
              <i className="leg-rota" /> Caminho
            </span>
            <span>Toque no mapa para ajustar onde você está</span>
          </div>
        </div>

        <div>
          <div className="resumo-rota">
            <span className="grande">
              {Math.round(rota.distancia)} <small>m</small>
            </span>
            <span className="grande">
              {Math.max(1, Math.round(rota.minutos))} <small>min</small>
            </span>
            {economia > 5 && pendentes.length > 1 && <span className="economia">{Math.round(economia)} m a menos do que seguir a lista na ordem em que foi montada</span>}
          </div>

          {esgotados.length > 0 && (
            <div className="alerta" style={{ margin: '0 0 12px' }}>
              <PackageX size={18} />
              <span>
                {esgotados.length === 1 ? `${getProduto(esgotados[0].produtoId)!.nome} acabou nesta loja e ficou fora da rota.` : `${esgotados.length} itens acabaram nesta loja e ficaram fora da rota.`}{' '}
                <Link to="/lista">Ver equivalentes na lista</Link>
              </span>
            </div>
          )}

          <div className="posicao-barra">
            <label htmlFor="pos">Você está em:</label>
            <select
              id="pos"
              value={valorPosicao}
              onChange={(e) => {
                const o = opcoesPosicao.find((x) => x.valor === e.target.value);
                if (o) definirPosicao(o.valor === 'entrada' ? null : o.ponto);
              }}
            >
              {valorPosicao === 'mapa' && <option value="mapa">Ponto marcado no mapa</option>}
              {opcoesPosicao.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </div>

          {proxima ? (
            <section className="proxima" aria-live="polite">
              <div className="proxima-topo">
                <PlacaCorredor corredor={proxima.corredor} tamanho="g" />
                <div>
                  <h2>Próxima parada</h2>
                  <div className="depto">{departamento(proxima.corredor).nome}</div>
                  <div className="onde-exato">
                    <span>
                      <MoveHorizontal size={16} /> Lado {getProduto(proxima.itens[0].produtoId)!.lado === 'E' ? 'esquerdo' : 'direito'} do corredor
                    </span>
                    <span>
                      <ArrowUpDown size={16} /> Módulo {proxima.modulo} de 12, contando a partir da entrada
                    </span>
                  </div>
                </div>
              </div>
              {(() => {
                const p0 = getProduto(proxima.itens[0].produtoId)!;
                return <Gondola lado={p0.lado} modulo={p0.modulo} nivel={p0.nivel} />;
              })()}
              <div className="proxima-itens">
                {proxima.itens.map((i) => {
                  const p = getProduto(i.produtoId)!;
                  return (
                    <div key={i.produtoId} className="linha">
                      <span className="nome">
                        {i.qtd > 1 && `${i.qtd}× `}
                        {p.nome}
                        <small style={{ display: 'block', color: 'var(--tinta-2)', fontWeight: 500 }}>
                          Lado {p.lado === 'E' ? 'esquerdo' : 'direito'}, prateleira {p.nivel}, {NIVEIS[p.nivel]}
                        </small>
                      </span>
                      <button className="btn btn-primario btn-pequeno" onClick={() => peguei(i, proxima)}>
                        <Check size={16} /> Peguei
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="proxima">
              <div className="proxima-topo">
                <span className="placa g" style={{ ['--placa-cor' as string]: '#17201b' }}>
                  <span className="placa-rotulo">Siga para</span>
                  <span className="placa-num" style={{ fontSize: 40, paddingTop: 10 }}>
                    <Flag size={44} />
                  </span>
                </span>
                <div>
                  <h2>Tudo pego</h2>
                  <div className="depto">Caixas</div>
                  <div className="onde-exato">
                    <span>
                      <Footprints size={16} /> {Math.round(rota.distancia)} m até os caixas, perto da entrada
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link to="/lista" className="btn btn-amarelo">
                  <ListChecks size={18} /> Conferir a lista
                </Link>
              </div>
            </section>
          )}

          {rota.ordem.length > 1 && (
            <section className="secao">
              <h2>Depois</h2>
              <ol className="paradas">
                {rota.ordem.slice(1).map((p, i) => (
                  <li key={p.chave}>
                    <span className="n">{i + 2}</span>
                    <PlacaCorredor corredor={p.corredor} />
                    <span>
                      <b>{departamento(p.corredor).nome}</b>
                      <small>{p.itens.map((it) => getProduto(it.produtoId)!.nome).join('; ')}</small>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="secao">
            <Link to="/atendimento" className="status-link">
              <span className="ico">
                <Headset size={22} />
              </span>
              <span>
                <b>Ficou com dúvida no corredor?</b>
                <small>Chame um especialista: ele vem até você já sabendo o seu caso.</small>
              </span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
