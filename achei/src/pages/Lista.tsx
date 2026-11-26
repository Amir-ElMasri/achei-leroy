import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, Plus, Route, Trash2, House, PackageX, MessagesSquare } from 'lucide-react';
import { useApp } from '../lib/store';
import { getProduto } from '../data/produtos';
import { moeda } from '../lib/armazenamento';
import { IconeProduto, PlacaCorredor, StatusEstoque } from '../components/comuns';

export function Lista() {
  const { lista, estoque, alternarColetado, alternarJaTenho, alterarQtd, remover, trocarItem, limparLista, estoqueEmOutrasLojas, registrar } = useApp();
  const avisados = useRef(new Set<string>());

  const ordenada = [...lista].sort((a, b) => getProduto(a.produtoId)!.corredor - getProduto(b.produtoId)!.corredor);
  const ativos = lista.filter((i) => !i.jaTenho);
  const total = ativos.reduce((acc, i) => acc + getProduto(i.produtoId)!.preco * i.qtd, 0);
  const faltam = ativos.filter((i) => !i.coletado).length;

  // registra rupturas vistas pelo cliente (vira dado para a loja repor)
  useEffect(() => {
    for (const i of lista) {
      if ((estoque[i.produtoId] ?? 0) <= 0 && !avisados.current.has(i.produtoId)) {
        avisados.current.add(i.produtoId);
        registrar({ tipo: 'esgotado', produtoId: i.produtoId });
      }
    }
  }, [lista, estoque, registrar]);

  if (!lista.length) {
    return (
      <div className="conteudo">
        <div className="vazio">
          <h1>Sua lista está vazia</h1>
          <p>Conte ao assistente o que você quer resolver e ele monta a lista completa, com o lugar de cada item na loja.</p>
          <Link to="/assistente" className="btn btn-primario">
            <MessagesSquare size={20} /> Falar com o assistente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="conteudo">
      <div className="cabecalho-pagina">
        <div>
          <h1>Minha lista</h1>
          <p>
            {faltam === 0 ? 'Tudo pego. Pode seguir para os caixas.' : `${faltam} ${faltam === 1 ? 'item para pegar' : 'itens para pegar'}`}, total de {moeda(total)}
          </p>
        </div>
      </div>

      <div className="kit">
        {ordenada.map((i) => {
          const p = getProduto(i.produtoId)!;
          const qtd = estoque[p.id] ?? 0;
          const alternativa = qtd <= 0 ? (p.alternativas ?? []).map(getProduto).find((a) => a && (estoque[a.id] ?? 0) > 0) : undefined;
          const outras = qtd <= 0 ? estoqueEmOutrasLojas(p.id).filter((o) => o.qtd > 0) : [];
          return (
            <div key={i.produtoId} className={`lista-item${i.coletado ? ' feito' : ''}${i.jaTenho ? ' tenho' : ''}`}>
              <button
                className={`check${i.coletado ? ' marcado' : ''}`}
                aria-label={i.coletado ? `Desmarcar ${p.nome}` : `Marcar ${p.nome} como pego`}
                aria-pressed={i.coletado}
                disabled={i.jaTenho}
                onClick={() => alternarColetado(p.id)}
              >
                {i.coletado && <Check size={18} strokeWidth={3} />}
              </button>
              <IconeProduto produto={p} />
              <div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                  <Link to={`/produto/${p.id}`} className="item-nome" style={{ color: 'inherit', textDecoration: 'none' }}>
                    {p.nome}
                  </Link>
                  <PlacaCorredor corredor={p.corredor} />
                </div>
                {i.motivo && <div className="item-motivo">{i.motivo}</div>}
                <div className="tags">
                  {i.jaTenho ? <span className="tag">Você já tem em casa</span> : <StatusEstoque qtd={qtd} unidade={p.unidade} />}
                  {i.esquecido && !i.jaTenho && <span className="tag esquecido">Muita gente esquece</span>}
                  <span className="preco" style={{ fontSize: 14 }}>
                    {moeda(p.preco * i.qtd)}
                  </span>
                </div>
              </div>
              <div className="lista-acoes">
                <div className="qtd" aria-label="Quantidade">
                  <button aria-label="Diminuir" onClick={() => alterarQtd(p.id, -1)}>
                    <Minus size={16} />
                  </button>
                  <span>{i.qtd}</span>
                  <button aria-label="Aumentar" onClick={() => alterarQtd(p.id, 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <button className="btn btn-texto" onClick={() => alternarJaTenho(p.id)}>
                  <House size={16} /> {i.jaTenho ? 'Vou levar' : 'Já tenho'}
                </button>
                <button className="btn btn-texto" style={{ color: 'var(--tinta-3)' }} onClick={() => remover(p.id)}>
                  <Trash2 size={16} /> Remover
                </button>
              </div>
              {qtd <= 0 && !i.jaTenho && (
                <div className="substituto">
                  <PackageX size={18} color="var(--laranja)" />
                  <span style={{ flex: 1, minWidth: 180 }}>
                    {alternativa ? (
                      <>
                        Equivalente disponível: <b>{alternativa.nome}</b>, corredor {alternativa.corredor}, {moeda(alternativa.preco)}.
                      </>
                    ) : (
                      'Sem equivalente nesta loja agora.'
                    )}
                    {outras.length > 0 && <> Também tem na {outras.map((o) => `${o.nome} (${o.qtd} un.)`).join(' e na ')}.</>}
                  </span>
                  {alternativa && (
                    <button className="btn btn-pequeno btn-secundario" onClick={() => trocarItem(p.id, alternativa.id)}>
                      Trocar
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div className="kit-rodape">
          <div className="kit-total">
            <span>Total estimado</span>
            <b>{moeda(total)}</b>
          </div>
          <div className="kit-acoes">
            <Link to="/rota" className="btn btn-primario">
              <Route size={20} /> Ver a rota na loja
            </Link>
            <button className="btn btn-secundario" onClick={limparLista}>
              <Trash2 size={18} /> Limpar lista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
