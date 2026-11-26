import { Link, useNavigate } from 'react-router-dom';
import { TriangleAlert, Headset, Route, Check } from 'lucide-react';
import { problemaPorId, type Respostas } from '../data/problemas';
import { getProduto } from '../data/produtos';
import { useApp } from '../lib/store';
import { moeda } from '../lib/armazenamento';
import { IconeProduto, PlacaCorredor, StatusEstoque } from './comuns';

export function Kit({ problemaId, respostas }: { problemaId: string; respostas: Respostas }) {
  const { estoque, adicionarItens, lista } = useApp();
  const navegar = useNavigate();
  const p = problemaPorId[problemaId];
  // se algum item do kit acabou nesta loja, troca automaticamente por um equivalente com estoque
  const itens = p.kit(respostas).map((i) => {
    if ((estoque[i.produtoId] ?? 0) > 0) return { ...i, substituiu: undefined as string | undefined };
    const alt = (getProduto(i.produtoId)?.alternativas ?? []).find((a) => (estoque[a] ?? 0) > 0);
    return alt ? { ...i, produtoId: alt, substituiu: i.produtoId } : { ...i, substituiu: undefined };
  });
  const nota = p.nota?.(respostas);
  const alerta = p.alerta?.(respostas);
  const especialista = p.especialista?.(respostas);
  const passos = p.passos(respostas);
  const total = itens.reduce((acc, i) => acc + (getProduto(i.produtoId)?.preco ?? 0) * i.qtd, 0);
  const jaNaLista = itens.length > 0 && itens.every((i) => lista.some((l) => l.produtoId === i.produtoId));

  return (
    <div className="kit">
      <div className="kit-topo">
        <h2>{itens.length ? 'Seu kit completo' : 'Melhor falar com um especialista'}</h2>
        <p>{itens.length ? `Para: ${p.titulo.toLowerCase()}. ${itens.length} ${itens.length === 1 ? 'item' : 'itens'}, tudo nesta loja.` : p.titulo}</p>
      </div>
      {especialista && (
        <div className="alerta" style={{ background: '#e3eefa', color: '#1f4f80' }}>
          <Headset size={18} />
          <span>{especialista}</span>
        </div>
      )}
      {alerta && (
        <div className="alerta">
          <TriangleAlert size={18} />
          <span>{alerta}</span>
        </div>
      )}
      {nota && <div className="nota">{nota}</div>}
      <div style={{ marginTop: nota || alerta || especialista ? 10 : 0 }}>
        {itens.map((i) => {
          const pr = getProduto(i.produtoId)!;
          return (
            <Link key={i.produtoId} to={`/produto/${pr.id}`} className="item">
              <IconeProduto produto={pr} />
              <div>
                <div className="item-nome">
                  {i.qtd > 1 && `${i.qtd}× `}
                  {pr.nome}
                </div>
                <div className="item-motivo">{i.motivo}</div>
                <div className="tags">
                  {i.substituiu && <span className="tag troca">Troca: {getProduto(i.substituiu)!.simples} acabou nesta loja</span>}
                  {i.esquecido && <span className="tag esquecido">Muita gente esquece</span>}
                  {i.ferramenta && <span className="tag">Talvez você já tenha</span>}
                  <StatusEstoque qtd={estoque[pr.id] ?? 0} unidade={pr.unidade} />
                </div>
              </div>
              <div className="item-lado">
                <span className="preco">{moeda(pr.preco * i.qtd)}</span>
                <PlacaCorredor corredor={pr.corredor} />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="kit-rodape">
        {itens.length > 0 && (
          <div className="kit-total">
            <span>Total estimado</span>
            <b>{moeda(total)}</b>
          </div>
        )}
        <div className="kit-acoes">
          {itens.length > 0 ? (
            <button
              className="btn btn-primario"
              onClick={() => {
                if (!jaNaLista) adicionarItens(itens, problemaId);
                navegar('/rota');
              }}
            >
              {jaNaLista ? <Check size={20} /> : <Route size={20} />}
              {jaNaLista ? 'Já está na lista: ver a rota' : 'Adicionar à lista e ver a rota'}
            </button>
          ) : null}
          <Link to="/atendimento" className={`btn ${itens.length ? 'btn-secundario' : 'btn-primario'}`}>
            <Headset size={20} />
            Falar com especialista
          </Link>
        </div>
      </div>
      {passos.length > 0 && (
        <details className="passo-a-passo">
          <summary>Como fazer em casa ({passos.length} passos)</summary>
          <ol>
            {passos.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
