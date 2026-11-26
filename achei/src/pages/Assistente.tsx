import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Gauge, Info, RotateCcw, Sparkles, Plus, Check, Headset } from 'lucide-react';
import { useApp, type Mensagem } from '../lib/store';
import { problemaPorId } from '../data/problemas';
import { getProduto } from '../data/produtos';
import { corSetor } from '../data/layout';
import { moeda } from '../lib/armazenamento';
import { EntradaPergunta } from '../components/EntradaPergunta';
import { Kit } from '../components/Kit';
import { IconeProduto, PlacaCorredor, StatusEstoque } from '../components/comuns';
import type { Fonte } from '../lib/nlp';

const SUGESTOES = ['Torneira pingando', 'Chuveiro não esquenta', 'Pintar um quarto', 'Pia entupida', 'Onde fica a fita veda-rosca?'];

function FonteIA({ fonte }: { fonte: Fonte }) {
  return (
    <span className="fonte-ia">
      <Sparkles size={12} />
      {fonte === 'gemini' ? 'Interpretado pela IA Gemini' : 'Interpretado pelo motor local de linguagem'}
    </span>
  );
}

function Produtos({ ids }: { ids: string[] }) {
  const { estoque, adicionarItens, lista } = useApp();
  return (
    <div className="kit" style={{ maxWidth: 620 }}>
      {ids.map((id) => {
        const p = getProduto(id)!;
        const naLista = lista.some((l) => l.produtoId === id);
        return (
          <div key={id} className="item">
            <IconeProduto produto={p} />
            <div>
              <Link to={`/produto/${id}`} className="item-nome" style={{ color: 'inherit' }}>
                {p.nome}
              </Link>
              <div className="item-apelido">{p.simples}</div>
              <div className="tags">
                <StatusEstoque qtd={estoque[id] ?? 0} unidade={p.unidade} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <Link to={`/produto/${id}`} className="btn btn-secundario btn-pequeno">
                  Ver onde fica
                </Link>
                <button className="btn btn-pequeno btn-primario" disabled={naLista} onClick={() => adicionarItens([{ produtoId: id }])}>
                  {naLista ? <Check size={16} /> : <Plus size={16} />}
                  {naLista ? 'Na lista' : 'Adicionar à lista'}
                </button>
              </div>
            </div>
            <div className="item-lado">
              <span className="preco">
                {moeda(p.preco)}
                {p.unidade === 'm' && <small>/m</small>}
              </span>
              <PlacaCorredor corredor={p.corredor} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Balao({ m }: { m: Mensagem }) {
  const { responder, perguntar } = useApp();
  const b = m.bloco;

  if (m.de === 'cliente') {
    return (
      <div className="msg cliente">
        {m.imagem && <img className="foto" src={m.imagem} alt="Foto enviada" />}
        {m.texto && <div className="balao">{m.texto}</div>}
      </div>
    );
  }

  if (b.tipo === 'pensando') {
    return (
      <div className="msg assistente" aria-live="polite">
        <div className="balao pensando" aria-label="Pensando">
          <i />
          <i />
          <i />
        </div>
      </div>
    );
  }

  if (b.tipo === 'diagnostico') {
    const p = problemaPorId[b.problemaId];
    return (
      <div className="msg assistente">
        <div className="diag" style={{ ['--placa-cor' as string]: corSetor(p.setor) }}>
          <h2>{p.titulo}</h2>
          <div className="diag-meta">
            <span>
              <Gauge size={15} /> {p.dificuldade}
            </span>
            <span>
              <Clock size={15} /> {p.tempo}
            </span>
            <span>Setor: {p.setor}</span>
          </div>
          <p>{m.texto}</p>
        </div>
        <FonteIA fonte={b.fonte} />
      </div>
    );
  }

  if (b.tipo === 'pergunta') {
    const p = problemaPorId[b.problemaId];
    const q = p.perguntas.find((x) => x.id === b.perguntaId)!;
    return (
      <div className="msg assistente">
        <div className="balao">{q.texto}</div>
        {q.ajuda && !b.respondida && (
          <div className="ajuda">
            <Info size={16} />
            <span>{q.ajuda}</span>
          </div>
        )}
        <div className="opcoes" role="group" aria-label={q.texto}>
          {q.opcoes.map((o) => (
            <button
              key={o.valor}
              className={`opcao${b.respondida === o.valor ? ' escolhida' : ''}`}
              disabled={!!b.respondida}
              onClick={() => responder(m.id, o.valor)}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (b.tipo === 'kit') {
    return (
      <div className="msg assistente">
        <Kit problemaId={b.problemaId} respostas={b.respostas} />
      </div>
    );
  }

  if (b.tipo === 'produtos') {
    return (
      <div className="msg assistente">
        <div className="balao">{m.texto}</div>
        <Produtos ids={b.ids} />
        <FonteIA fonte={b.fonte} />
      </div>
    );
  }

  return (
    <div className="msg assistente">
      {m.texto && <div className="balao">{m.texto}</div>}
      {b.tipo === 'sugestoes' && (
        <div className="chips">
          {SUGESTOES.map((s) => (
            <button key={s} className="chip" onClick={() => perguntar(s)}>
              {s}
            </button>
          ))}
          <Link to="/atendimento" className="chip">
            <Headset size={16} /> Falar com um especialista
          </Link>
        </div>
      )}
    </div>
  );
}

export function Assistente() {
  const { mensagens, perguntar, enviarFoto, ocupado, novaConversa } = useApp();
  const chat = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const [folga, setFolga] = useState(140);

  // a conversa sempre deixa espaço para a caixa de digitação fixa (que muda de altura conforme a tela)
  useEffect(() => {
    const el = barra.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setFolga(Math.ceil(el.getBoundingClientRect().height) + 16));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // mostra a resposta nova inteira, acima da caixa de digitação e da barra de navegação
    const msgs = chat.current?.querySelectorAll<HTMLElement>('.msg');
    const ultima = msgs?.[msgs.length - 1];
    const comportamento: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const nav = document.querySelector('.nav')?.getBoundingClientRect();
    const navEmbaixo = nav && nav.top > window.innerHeight / 2 ? nav.height : 0;
    const espaco = window.innerHeight - 72 - folga - navEmbaixo;
    if (ultima && ultima.getBoundingClientRect().height > espaco) ultima.scrollIntoView({ behavior: comportamento, block: 'start' });
    else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: comportamento });
  }, [mensagens.length, ocupado, folga]);

  return (
    <div className="conteudo">
      {mensagens.length > 0 && <h1 className="sr">Assistente</h1>}
      {mensagens.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button className="btn-texto btn" onClick={novaConversa}>
            <RotateCcw size={16} /> Nova conversa
          </button>
        </div>
      )}
      <div className="chat" ref={chat} style={{ '--folga-chat': `${folga}px` } as CSSProperties}>
        {mensagens.length === 0 && (
          <div className="chat-vazio">
            <h1>Conte o que aconteceu</h1>
            <p>Pode ser do seu jeito: "a descarga não para de correr água", "quero pintar o quarto", "onde fica a bucha 6".</p>
            <div className="chips" style={{ justifyContent: 'center', marginTop: 16 }}>
              {SUGESTOES.map((s) => (
                <button key={s} className="chip" onClick={() => perguntar(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {mensagens.map((m) => (
          <Balao key={m.id} m={m} />
        ))}
      </div>
      <div className="barra-chat" ref={barra}>
        <EntradaPergunta aoEnviar={perguntar} aoFoto={enviarFoto} desativado={ocupado} placeholder="Escreva, fale ou mande uma foto" placeholderCurto="Escreva aqui" autoFoco />
      </div>
    </div>
  );
}
