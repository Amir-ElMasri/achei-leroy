// Estado do app: loja, conversa com o assistente, lista de compras, posição na loja,
// estoque (simulando uma API em tempo real), chamados de atendimento e registro de uso.
// Tudo fica no localStorage, e as abas abertas no mesmo navegador conversam entre si
// (o painel do vendedor numa aba enxerga o chamado feito na outra).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PRODUTOS, getProduto } from '../data/produtos';
import { LOJAS, lojaPorId } from '../data/lojas';
import { problemaPorId, perguntasPendentes, type ItemKit, type Respostas } from '../data/problemas';
import { corredorMaisProximo, departamento, ENTRADA, type Ponto, type Setor } from '../data/layout';
import { CHAVES, gravar, ler, uid } from './armazenamento';
import { interpretar, identificarFoto, comprimirImagem, verificarIA, type StatusIA } from './ia';
import { casarOpcao, type Interpretacao, type Fonte } from './nlp';
import { ticketsIniciais, vendedorDoSetor, type Evento, type Ticket, type ResumoCaso } from './simulacao';

export interface ItemLista {
  produtoId: string;
  qtd: number;
  motivo?: string;
  origem?: string;
  esquecido?: boolean;
  ferramenta?: boolean;
  coletado: boolean;
  jaTenho: boolean;
}

export type Bloco =
  | { tipo: 'texto' }
  | { tipo: 'pensando' }
  | { tipo: 'diagnostico'; problemaId: string; fonte: Fonte }
  | { tipo: 'pergunta'; problemaId: string; perguntaId: string; respondida?: string }
  | { tipo: 'kit'; problemaId: string; respostas: Respostas }
  | { tipo: 'produtos'; ids: string[]; fonte: Fonte }
  | { tipo: 'sugestoes' };

export interface Mensagem {
  id: string;
  de: 'cliente' | 'assistente';
  texto?: string;
  imagem?: string;
  bloco: Bloco;
}

interface Missao {
  problemaId: string;
  respostas: Respostas;
}

interface EstadoCliente {
  lojaId: string;
  lista: ItemLista[];
  posicao: Ponto | null;
  missao: Missao | null;
  mensagens: Mensagem[];
  ticketId: string | null;
}

const inicial: EstadoCliente = { lojaId: LOJAS[0].id, lista: [], posicao: null, missao: null, mensagens: [], ticketId: null };

function carregarCliente(): EstadoCliente {
  const salvo = ler<Partial<EstadoCliente>>(CHAVES.cliente, {});
  const e: EstadoCliente = { ...inicial, ...salvo, mensagens: (salvo.mensagens ?? []).filter((m) => m.bloco?.tipo !== 'pensando') };
  // QR code na entrada da loja: ?loja=zona-sul   |   QR code no corredor: ?corredor=9
  try {
    const params = new URLSearchParams(window.location.search);
    const loja = params.get('loja');
    if (loja && LOJAS.some((l) => l.id === loja)) e.lojaId = loja;
    const corr = Number(params.get('corredor'));
    if (corr >= 1 && corr <= 16) e.posicao = { x: 7.5 + 5 * corr, y: 62 };
  } catch {
    /* sem window */
  }
  return e;
}

function estoqueInicial(lojaId: string): Record<string, number> {
  const l = lojaPorId(lojaId);
  return Object.fromEntries(PRODUTOS.map((p) => [p.id, p.id in l.ajustes ? l.ajustes[p.id] : Math.round(p.estoque * l.fator)]));
}

interface Ctx {
  // loja
  lojaId: string;
  trocarLoja: (id: string) => void;
  // estoque
  estoque: Record<string, number>;
  estoqueAtualizadoEm: number;
  estoqueEmOutrasLojas: (produtoId: string) => { lojaId: string; nome: string; qtd: number }[];
  // posição
  posicao: Ponto;
  posicaoDefinida: boolean;
  definirPosicao: (p: Ponto | null) => void;
  // lista
  lista: ItemLista[];
  adicionarItens: (itens: ItemKit[] | { produtoId: string; qtd?: number; motivo?: string }[], origem?: string) => void;
  alternarColetado: (produtoId: string) => void;
  alternarJaTenho: (produtoId: string) => void;
  alterarQtd: (produtoId: string, delta: number) => void;
  remover: (produtoId: string) => void;
  trocarItem: (antigo: string, novo: string) => void;
  limparLista: () => void;
  // conversa
  mensagens: Mensagem[];
  missao: Missao | null;
  ocupado: boolean;
  perguntar: (texto: string) => Promise<void>;
  enviarFoto: (arquivo: File) => Promise<void>;
  responder: (msgId: string, valor: string) => void;
  novaConversa: () => void;
  statusIA: StatusIA;
  // atendimento
  tickets: Ticket[];
  meuTicket: Ticket | null;
  chamarEspecialista: (setor: Setor, observacao?: string) => Ticket;
  cancelarChamado: () => void;
  encerrarChamado: () => void;
  atualizarTicket: (id: string, patch: Partial<Ticket>) => void;
  setorSugerido: Setor;
  resumoAtual: (observacao?: string) => ResumoCaso;
  // dados
  eventos: Evento[];
  registrar: (e: Omit<Evento, 't' | 'lojaId'>) => void;
}

const Contexto = createContext<Ctx | null>(null);

export function useApp() {
  const c = useContext(Contexto);
  if (!c) throw new Error('useApp fora do AppProvider');
  return c;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cli, setCli] = useState<EstadoCliente>(carregarCliente);
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const t = ler<Ticket[] | null>(CHAVES.tickets, null);
    if (t) return t;
    const novos = ticketsIniciais();
    gravar(CHAVES.tickets, novos);
    return novos;
  });
  const [eventos, setEventos] = useState<Evento[]>(() => ler<Evento[]>(CHAVES.eventos, []));
  const [estoque, setEstoque] = useState<Record<string, number>>(() => estoqueInicial(cli.lojaId));
  const [estoqueAtualizadoEm, setEstoqueAtualizadoEm] = useState(Date.now());
  const [ocupado, setOcupado] = useState(false);
  const [statusIA, setStatusIA] = useState<StatusIA>('verificando');

  const cliRef = useRef(cli);
  cliRef.current = cli;

  useEffect(() => {
    verificarIA().then(setStatusIA);
  }, []);

  // persistência
  useEffect(() => gravar(CHAVES.cliente, { ...cli, mensagens: cli.mensagens.slice(-60) }), [cli]);

  // sincronização entre abas
  useEffect(() => {
    const ouvir = (e: StorageEvent) => {
      if (e.key === CHAVES.tickets) setTickets(ler<Ticket[]>(CHAVES.tickets, []));
      if (e.key === CHAVES.eventos) setEventos(ler<Evento[]>(CHAVES.eventos, []));
    };
    window.addEventListener('storage', ouvir);
    return () => window.removeEventListener('storage', ouvir);
  }, []);

  const salvarTickets = useCallback((fn: (t: Ticket[]) => Ticket[]) => {
    const novo = fn(ler<Ticket[]>(CHAVES.tickets, []));
    gravar(CHAVES.tickets, novo);
    setTickets(novo);
  }, []);

  const registrar = useCallback((e: Omit<Evento, 't' | 'lojaId'>) => {
    const ev: Evento = { ...e, t: Date.now(), lojaId: cliRef.current.lojaId };
    const atual = ler<Evento[]>(CHAVES.eventos, []);
    const novo = [...atual, ev].slice(-1500);
    gravar(CHAVES.eventos, novo);
    setEventos(novo);
  }, []);

  // ── Estoque "em tempo real": nesta demonstração, vendas acontecem aleatoriamente a cada 15 s
  useEffect(() => {
    setEstoque(estoqueInicial(cli.lojaId));
    setEstoqueAtualizadoEm(Date.now());
    const ajustes = lojaPorId(cli.lojaId).ajustes;
    const id = window.setInterval(() => {
      setEstoque((e) => {
        const n = { ...e };
        for (let i = 0; i < 2; i++) {
          const p = PRODUTOS[Math.floor(Math.random() * PRODUTOS.length)];
          if (p.id in ajustes) continue;
          if (n[p.id] > 4) n[p.id] -= 1;
          else if (Math.random() < 0.3) n[p.id] += 12; // reposição
        }
        return n;
      });
      setEstoqueAtualizadoEm(Date.now());
    }, 15000);
    return () => window.clearInterval(id);
  }, [cli.lojaId]);

  const estoqueEmOutrasLojas = useCallback(
    (produtoId: string) =>
      LOJAS.filter((l) => l.id !== cliRef.current.lojaId).map((l) => ({ lojaId: l.id, nome: l.nome, qtd: estoqueInicial(l.id)[produtoId] ?? 0 })),
    [],
  );

  // ── Lista
  const adicionarItens: Ctx['adicionarItens'] = useCallback((itens, origem) => {
    setCli((c) => {
      const lista = [...c.lista];
      for (const it of itens) {
        const i = lista.findIndex((x) => x.produtoId === it.produtoId);
        const extra = it as Partial<ItemKit>;
        if (i >= 0) lista[i] = { ...lista[i], jaTenho: false };
        else
          lista.push({
            produtoId: it.produtoId,
            qtd: it.qtd ?? 1,
            motivo: it.motivo,
            origem,
            esquecido: extra.esquecido,
            ferramenta: extra.ferramenta,
            coletado: false,
            jaTenho: false,
          });
      }
      return { ...c, lista };
    });
  }, []);

  const mudarItem = (produtoId: string, fn: (i: ItemLista) => ItemLista | null) =>
    setCli((c) => ({ ...c, lista: c.lista.map((i) => (i.produtoId === produtoId ? fn(i) : i)).filter(Boolean) as ItemLista[] }));

  const alternarColetado = useCallback(
    (produtoId: string) => {
      const item = cliRef.current.lista.find((i) => i.produtoId === produtoId);
      if (item && !item.coletado) registrar({ tipo: 'coleta', produtoId });
      mudarItem(produtoId, (i) => ({ ...i, coletado: !i.coletado }));
    },
    [registrar],
  );
  const alternarJaTenho = useCallback((produtoId: string) => mudarItem(produtoId, (i) => ({ ...i, jaTenho: !i.jaTenho, coletado: false })), []);
  const alterarQtd = useCallback((produtoId: string, d: number) => mudarItem(produtoId, (i) => ({ ...i, qtd: Math.max(1, i.qtd + d) })), []);
  const remover = useCallback((produtoId: string) => mudarItem(produtoId, () => null), []);
  const trocarItem = useCallback(
    (antigo: string, novo: string) =>
      setCli((c) => {
        if (c.lista.some((i) => i.produtoId === novo)) return { ...c, lista: c.lista.filter((i) => i.produtoId !== antigo) };
        return { ...c, lista: c.lista.map((i) => (i.produtoId === antigo ? { ...i, produtoId: novo, coletado: false } : i)) };
      }),
    [],
  );
  const limparLista = useCallback(() => setCli((c) => ({ ...c, lista: [] })), []);

  // ── Conversa com o assistente
  const pushMsg = (m: Omit<Mensagem, 'id'>) => {
    const id = uid();
    setCli((c) => ({ ...c, mensagens: [...c.mensagens, { ...m, id }] }));
    return id;
  };
  const trocarMsg = (id: string, novas: Omit<Mensagem, 'id'>[]) =>
    setCli((c) => {
      const i = c.mensagens.findIndex((m) => m.id === id);
      const lista = novas.map((n) => ({ ...n, id: uid() }));
      if (i < 0) return { ...c, mensagens: [...c.mensagens, ...lista] };
      const ms = [...c.mensagens];
      ms.splice(i, 1, ...lista);
      return { ...c, mensagens: ms };
    });

  /** depois de cada resposta: próxima pergunta ou o kit pronto */
  const proximoPasso = (problemaId: string, respostas: Respostas): Omit<Mensagem, 'id'>[] => {
    const p = problemaPorId[problemaId];
    const pend = perguntasPendentes(p, respostas);
    if (pend.length) return [{ de: 'assistente', texto: pend[0].texto, bloco: { tipo: 'pergunta', problemaId, perguntaId: pend[0].id } }];
    return [{ de: 'assistente', bloco: { tipo: 'kit', problemaId, respostas } }];
  };

  const aplicarInterpretacao = (placeholder: string, r: Interpretacao, prefixo?: string) => {
    const pre = prefixo ? `${prefixo} ` : '';
    if (r.tipo === 'problema') {
      const p = problemaPorId[r.problemaId];
      setCli((c) => ({ ...c, missao: { problemaId: p.id, respostas: r.respostas } }));
      trocarMsg(placeholder, [
        { de: 'assistente', texto: pre + (r.mensagem || p.resumo), bloco: { tipo: 'diagnostico', problemaId: p.id, fonte: r.fonte } },
        ...proximoPasso(p.id, r.respostas),
      ]);
      registrar({ tipo: 'busca', resultado: 'problema', problemaId: p.id });
    } else if (r.tipo === 'produtos') {
      const textoPadrao = r.ids.length > 1 ? 'Encontrei estes produtos. Toque em um para ver exatamente onde ele está.' : 'Achei! Veja onde ele fica na loja.';
      trocarMsg(placeholder, [{ de: 'assistente', texto: pre + (r.mensagem || textoPadrao), bloco: { tipo: 'produtos', ids: r.ids, fonte: r.fonte } }]);
      registrar({ tipo: 'busca', resultado: 'produtos', produtoId: r.ids[0] });
    } else {
      trocarMsg(placeholder, [{ de: 'assistente', texto: pre + (r.mensagem || 'Não entendi bem. Pode me contar de outro jeito?'), bloco: { tipo: 'sugestoes' } }]);
    }
  };

  const responder = useCallback((msgId: string, valor: string) => {
    const c = cliRef.current;
    const msg = c.mensagens.find((m) => m.id === msgId);
    if (!msg || msg.bloco.tipo !== 'pergunta' || msg.bloco.respondida) return;
    const { problemaId, perguntaId } = msg.bloco;
    const p = problemaPorId[problemaId];
    const perg = p.perguntas.find((q) => q.id === perguntaId)!;
    const opcao = perg.opcoes.find((o) => o.valor === valor)!;
    const respostas = { ...(c.missao?.problemaId === problemaId ? c.missao.respostas : {}), [perguntaId]: valor };
    setCli((s) => ({
      ...s,
      missao: { problemaId, respostas },
      mensagens: [
        ...s.mensagens.map((m) => (m.id === msgId && m.bloco.tipo === 'pergunta' ? { ...m, bloco: { ...m.bloco, respondida: valor } } : m)),
        { id: uid(), de: 'cliente' as const, texto: opcao.rotulo, bloco: { tipo: 'texto' as const } },
        ...proximoPasso(problemaId, respostas).map((n) => ({ ...n, id: uid() })),
      ],
    }));
  }, []);

  const perguntar = useCallback(
    async (texto: string) => {
      const t = texto.trim();
      if (!t) return;
      // se há uma pergunta em aberto e o texto responde a ela, segue o fluxo
      const aberta = [...cliRef.current.mensagens].reverse().find((m) => m.bloco.tipo === 'pergunta' && !m.bloco.respondida);
      if (aberta && aberta.bloco.tipo === 'pergunta') {
        const { problemaId, perguntaId } = aberta.bloco;
        const perg = problemaPorId[problemaId].perguntas.find((q) => q.id === perguntaId)!;
        const op = casarOpcao(t, perg);
        if (op) {
          responder(aberta.id, op.valor);
          return;
        }
      }
      // fecha perguntas em aberto (o cliente mudou de assunto)
      setCli((c) => ({
        ...c,
        mensagens: c.mensagens.map((m) => (m.bloco.tipo === 'pergunta' && !m.bloco.respondida ? { ...m, bloco: { ...m.bloco, respondida: '__pulada' } } : m)),
      }));
      pushMsg({ de: 'cliente', texto: t, bloco: { tipo: 'texto' } });
      const ph = pushMsg({ de: 'assistente', bloco: { tipo: 'pensando' } });
      setOcupado(true);
      try {
        const hist = cliRef.current.mensagens
          .filter((m) => m.texto)
          .slice(-6)
          .map((m) => `${m.de === 'cliente' ? 'Cliente' : 'Assistente'}: ${m.texto}`);
        const r = await interpretar(t, hist);
        if (r.tipo === 'nao_entendi') registrar({ tipo: 'busca', resultado: 'nao_entendi', texto: t });
        aplicarInterpretacao(ph, r);
      } finally {
        setOcupado(false);
      }
    },
    [responder, registrar],
  );

  const enviarFoto = useCallback(
    async (arquivo: File) => {
      setOcupado(true);
      try {
        let url: string | undefined;
        try {
          url = (await comprimirImagem(arquivo)).url;
        } catch {
          url = undefined;
        }
        pushMsg({ de: 'cliente', imagem: url, texto: url ? undefined : 'Foto enviada', bloco: { tipo: 'texto' } });
        const ph = pushMsg({ de: 'assistente', bloco: { tipo: 'pensando' } });
        const r = await identificarFoto(arquivo);
        if (r.ok) {
          aplicarInterpretacao(ph, r.interpretacao, r.descricao ? `Na foto vejo: ${r.descricao.replace(/\.$/, '')}.` : undefined);
          if (r.interpretacao.tipo === 'nao_entendi') registrar({ tipo: 'busca', resultado: 'nao_entendi', texto: '(foto)' });
        } else {
          trocarMsg(ph, [
            {
              de: 'assistente',
              texto:
                r.motivo === 'sem_ia'
                  ? 'Para reconhecer fotos eu preciso da IA de visão conectada, e ela não está ativa nesta loja agora. Me conte com suas palavras o que é a peça ou o problema.'
                  : 'Não consegui analisar essa foto. Tente de novo com mais luz e a peça mais perto, ou me conte com suas palavras.',
              bloco: { tipo: 'sugestoes' },
            },
          ]);
        }
      } finally {
        setOcupado(false);
      }
    },
    [registrar],
  );

  const novaConversa = useCallback(() => setCli((c) => ({ ...c, mensagens: [], missao: null })), []);

  // ── Atendimento
  const posicao = cli.posicao ?? ENTRADA;
  const meuTicket = useMemo(() => tickets.find((t) => t.id === cli.ticketId && t.status !== 'cancelado') ?? null, [tickets, cli.ticketId]);

  const setorSugerido: Setor = useMemo(() => {
    if (cli.missao) return problemaPorId[cli.missao.problemaId].setor;
    const pend = cli.lista.find((i) => !i.coletado && !i.jaTenho);
    if (pend) return departamento(getProduto(pend.produtoId)!.corredor).setor;
    const corr = corredorMaisProximo(posicao);
    return corr ? departamento(corr).setor : 'Hidráulica';
  }, [cli.missao, cli.lista, posicao]);

  const resumoAtual = useCallback(
    (observacao?: string): ResumoCaso => {
      const c = cliRef.current;
      const p = c.missao ? problemaPorId[c.missao.problemaId] : undefined;
      const corr = corredorMaisProximo(c.posicao ?? ENTRADA);
      const ultima = [...c.mensagens].reverse().find((m) => m.de === 'cliente' && m.texto);
      return {
        problema: p?.titulo,
        problemaId: p?.id,
        respostas: p
          ? Object.entries(c.missao!.respostas).flatMap(([k, v]) => {
              const q = p.perguntas.find((x) => x.id === k);
              const o = q?.opcoes.find((x) => x.valor === v);
              return q && o ? [{ pergunta: q.texto, resposta: o.rotulo }] : [];
            })
          : [],
        itens: c.lista
          .filter((i) => !i.jaTenho)
          .map((i) => {
            const pr = getProduto(i.produtoId)!;
            return { nome: pr.nome, corredor: pr.corredor, coletado: i.coletado, esgotado: (estoqueRef.current[i.produtoId] ?? 0) <= 0 };
          }),
        corredor: corr,
        onde: c.posicao ? (corr ? `Corredor ${corr}, ${departamento(corr).nome}` : 'Perto dos caixas e do atendimento') : 'Entrada da loja',
        observacao: observacao?.trim() || undefined,
        ultimaMensagem: ultima?.texto,
      };
    },
    [],
  );
  const estoqueRef = useRef(estoque);
  estoqueRef.current = estoque;

  const chamarEspecialista = useCallback(
    (setor: Setor, observacao?: string) => {
      const letra = { Ferramentas: 'T', Ferragens: 'F', Elétrica: 'E', Iluminação: 'I', Hidráulica: 'H', 'Banheiro e cozinha': 'B', 'Pintura e acabamento': 'P', 'Jardim e limpeza': 'J' }[setor];
      let criado!: Ticket;
      salvarTickets((ts) => {
        const nums = ts.filter((t) => t.senha.startsWith(letra)).map((t) => Number(t.senha.split('-')[1]) || 0);
        const prox = Math.max(0, ...nums) + 1;
        criado = {
          id: uid(),
          senha: `${letra}-${String(prox).padStart(3, '0')}`,
          lojaId: cliRef.current.lojaId,
          setor,
          criadoEm: Date.now(),
          atualizadoEm: Date.now(),
          status: 'aguardando',
          doCliente: true,
          resumo: resumoAtual(observacao),
        };
        return [...ts, criado];
      });
      setCli((c) => ({ ...c, ticketId: criado.id }));
      registrar({ tipo: 'chamado', setor });
      return criado;
    },
    [salvarTickets, resumoAtual, registrar],
  );

  const atualizarTicket = useCallback(
    (id: string, patch: Partial<Ticket>) => {
      salvarTickets((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch, atualizadoEm: Date.now() } : t)));
    },
    [salvarTickets],
  );

  const cancelarChamado = useCallback(() => {
    if (cliRef.current.ticketId) atualizarTicket(cliRef.current.ticketId, { status: 'cancelado' });
    setCli((c) => ({ ...c, ticketId: null }));
  }, [atualizarTicket]);

  const encerrarChamado = useCallback(() => {
    const id = cliRef.current.ticketId;
    if (id) {
      const t = ler<Ticket[]>(CHAVES.tickets, []).find((x) => x.id === id);
      if (t && t.status !== 'concluido') {
        atualizarTicket(id, { status: 'concluido' });
        registrar({ tipo: 'atendido', setor: t.setor, espera: (Date.now() - t.criadoEm) / 60000 });
      }
    }
    setCli((c) => ({ ...c, ticketId: null }));
  }, [atualizarTicket, registrar]);

  // mantém o resumo do chamado atualizado enquanto o cliente segue pegando os itens
  useEffect(() => {
    if (!meuTicket || meuTicket.status === 'concluido') return;
    const r = resumoAtual(meuTicket.resumo.observacao);
    if (JSON.stringify(r.itens) !== JSON.stringify(meuTicket.resumo.itens) || r.onde !== meuTicket.resumo.onde) {
      atualizarTicket(meuTicket.id, { resumo: r });
    }
  }, [cli.lista, cli.posicao]); // eslint-disable-line react-hooks/exhaustive-deps

  // sem painel do vendedor aberto, um "especialista virtual" atende para a demonstração seguir sozinha
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = ler<Ticket[]>(CHAVES.tickets, []).find((x) => x.id === cliRef.current.ticketId);
      if (!t) return;
      const painelAtivo = Date.now() - ler<number>(CHAVES.painel, 0) < 12000;
      if (painelAtivo) return;
      const desde = Date.now() - t.atualizadoEm;
      if (t.status === 'aguardando' && desde > 30000) atualizarTicket(t.id, { status: 'a_caminho', vendedor: vendedorDoSetor(t.setor) });
      else if (t.status === 'a_caminho' && desde > 35000) atualizarTicket(t.id, { status: 'em_atendimento' });
    }, 4000);
    return () => window.clearInterval(id);
  }, [atualizarTicket]);

  const trocarLoja = useCallback((id: string) => setCli((c) => ({ ...c, lojaId: id })), []);
  const definirPosicao = useCallback((p: Ponto | null) => setCli((c) => ({ ...c, posicao: p })), []);

  const valor: Ctx = {
    lojaId: cli.lojaId,
    trocarLoja,
    estoque,
    estoqueAtualizadoEm,
    estoqueEmOutrasLojas,
    posicao,
    posicaoDefinida: !!cli.posicao,
    definirPosicao,
    lista: cli.lista,
    adicionarItens,
    alternarColetado,
    alternarJaTenho,
    alterarQtd,
    remover,
    trocarItem,
    limparLista,
    mensagens: cli.mensagens,
    missao: cli.missao,
    ocupado,
    perguntar,
    enviarFoto,
    responder,
    novaConversa,
    statusIA,
    tickets,
    meuTicket,
    chamarEspecialista,
    cancelarChamado,
    encerrarChamado,
    atualizarTicket,
    setorSugerido,
    resumoAtual,
    eventos,
    registrar,
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
