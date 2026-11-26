import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Route, MoveHorizontal, ArrowUpDown, Layers } from 'lucide-react';
import { useApp } from '../lib/store';
import { getProduto } from '../data/produtos';
import { PROBLEMAS } from '../data/problemas';
import { departamento, pontoDaPrateleira, NIVEIS } from '../data/layout';
import { moeda } from '../lib/armazenamento';
import { IconeProduto, PlacaCorredor, StatusEstoque, Termo } from '../components/comuns';
import { Gondola } from '../components/Gondola';
import { MapaLoja } from '../components/MapaLoja';

export function Produto() {
  const { id = '' } = useParams();
  const navegar = useNavigate();
  const { estoque, estoqueAtualizadoEm, estoqueEmOutrasLojas, adicionarItens, lista, posicao } = useApp();
  const p = getProduto(id);

  if (!p) {
    return (
      <div className="conteudo">
        <div className="vazio">
          <h1>Produto não encontrado</h1>
          <Link to="/assistente" className="btn btn-primario">
            Perguntar ao assistente
          </Link>
        </div>
      </div>
    );
  }

  const qtd = estoque[p.id] ?? 0;
  const naLista = lista.some((l) => l.produtoId === p.id);
  const dep = departamento(p.corredor);
  const alternativas = (p.alternativas ?? []).map(getProduto).filter(Boolean);
  const outras = estoqueEmOutrasLojas(p.id);
  // produtos que costumam ir junto (aparecem nos mesmos kits)
  const junto = new Map<string, number>();
  for (const pr of PROBLEMAS)
    for (const ks of amostrasDeKit(pr.id))
      if (ks.includes(p.id)) for (const k of ks) if (k !== p.id) junto.set(k, (junto.get(k) ?? 0) + 1);
  const relacionados = [...junto.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => getProduto(k)!);

  return (
    <div className="conteudo">
      <button
        className="voltar"
        onClick={() => {
          // aberto direto por um link (sem página anterior no app): volta para o início em vez de sair do site
          const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
          if (idx > 0) navegar(-1);
          else navegar('/');
        }}
      >
        <ArrowLeft size={18} /> Voltar
      </button>
      <div className="produto-topo">
        <IconeProduto produto={p} tamanho={30} />
        <div>
          <h1>{p.nome}</h1>
          <div className="apelido">Também chamado de: {p.simples}</div>
        </div>
      </div>

      <div className="produto-preco">
        <span className="valor">
          {moeda(p.preco)}
          {p.unidade === 'm' && <small style={{ fontSize: 18 }}> /m</small>}
        </span>
        <span>
          <StatusEstoque qtd={qtd} unidade={p.unidade} />
          <small style={{ display: 'block', color: 'var(--tinta-3)', fontSize: 12.5 }}>
            Estoque atualizado às {new Date(estoqueAtualizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </small>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primario" disabled={naLista || qtd <= 0} onClick={() => adicionarItens([{ produtoId: p.id }])}>
          {naLista ? <Check size={20} /> : <Plus size={20} />}
          {naLista ? 'Está na sua lista' : 'Adicionar à lista'}
        </button>
        {naLista && (
          <Link to="/rota" className="btn btn-secundario">
            <Route size={20} /> Ver a rota
          </Link>
        )}
      </div>

      <section className="bloco">
        <h2>Onde fica</h2>
        <div className="onde-fica">
          <PlacaCorredor corredor={p.corredor} tamanho="g" />
          <ul>
            <li>
              <b>{dep.nome}</b>
            </li>
            <li>
              <MoveHorizontal size={15} /> Lado {p.lado === 'E' ? 'esquerdo' : 'direito'} do corredor
            </li>
            <li>
              <ArrowUpDown size={15} /> Módulo {p.modulo} de 12, contando a partir da entrada
            </li>
            <li>
              <Layers size={15} /> Prateleira {p.nivel}, {NIVEIS[p.nivel]}
            </li>
          </ul>
        </div>
        <div style={{ marginTop: 12 }}>
          <Gondola lado={p.lado} modulo={p.modulo} nivel={p.nivel} claro />
        </div>
        <div className="mapa-moldura" style={{ marginTop: 12 }}>
          <MapaLoja voce={posicao} destaque={pontoDaPrateleira(p.corredor, p.modulo)} />
        </div>
      </section>

      {qtd <= 0 && (
        <section className="bloco" style={{ borderColor: 'var(--laranja)' }}>
          <h2>Esgotado nesta loja</h2>
          {alternativas.length > 0 && (
            <p style={{ marginBottom: 8 }}>
              Equivalente: {alternativas.map((a, i) => (
                <span key={a!.id}>
                  {i > 0 && ' ou '}
                  <Link to={`/produto/${a!.id}`}>{a!.nome}</Link> ({(estoque[a!.id] ?? 0) > 0 ? 'disponível' : 'também esgotado'})
                </span>
              ))}
              .
            </p>
          )}
          <p>
            {outras.filter((o) => o.qtd > 0).length
              ? `Disponível na ${outras.filter((o) => o.qtd > 0).map((o) => `${o.nome} (${o.qtd} un.)`).join(' e na ')}.`
              : 'Também está em falta nas outras lojas da região.'}
          </p>
        </section>
      )}

      <section className="bloco">
        <h2>Em palavras simples</h2>
        <p>{p.explica}</p>
      </section>

      <section className="bloco">
        <h2>Ficha técnica</h2>
        <p style={{ fontSize: 14, color: 'var(--tinta-2)', marginBottom: 6 }}>Toque nos termos sublinhados para ver o que significam.</p>
        <table className="ficha">
          <tbody>
            {p.specs.map((s) => (
              <tr key={s.rotulo}>
                <th>{s.rotulo}</th>
                <td>{s.termo ? <Termo chave={s.termo}>{s.valor}</Termo> : s.valor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {relacionados.length > 0 && (
        <section className="bloco">
          <h2>Costuma ir junto</h2>
          {relacionados.map((r) => (
            <Link key={r.id} to={`/produto/${r.id}`} className="item" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <IconeProduto produto={r} />
              <div>
                <div className="item-nome">{r.nome}</div>
                <div className="item-apelido">{r.simples}</div>
              </div>
              <div className="item-lado">
                <span className="preco">{moeda(r.preco)}</span>
                <PlacaCorredor corredor={r.corredor} />
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

/** Gera combinações de respostas para descobrir quais produtos aparecem juntos nos kits */
function amostrasDeKit(problemaId: string): string[][] {
  const p = PROBLEMAS.find((x) => x.id === problemaId)!;
  let combos: Record<string, string>[] = [{}];
  for (const q of p.perguntas) combos = combos.flatMap((c) => q.opcoes.map((o) => ({ ...c, [q.id]: o.valor })));
  return combos.slice(0, 24).map((c) => p.kit(c).map((k) => k.produtoId));
}
