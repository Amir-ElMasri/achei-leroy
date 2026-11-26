// Ponte entre o app e a IA.
// Se a IA generativa (Gemini, via função serverless) estiver configurada, ela interpreta o texto e as fotos.
// Se não estiver, ou se falhar, o motor local (nlp.ts) responde — o app nunca fica sem resposta.

import { interpretarLocal, type Interpretacao } from './nlp';
import { PROBLEMAS, problemaPorId } from '../data/problemas';
import { PRODUTOS, produtoPorId } from '../data/produtos';

export type StatusIA = 'verificando' | 'gemini' | 'local';

let status: StatusIA = 'verificando';
let verificacao: Promise<StatusIA> | null = null;

async function comTempo(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

const ehJSON = (r: Response) => (r.headers.get('content-type') ?? '').includes('application/json');

export function verificarIA(): Promise<StatusIA> {
  if (!verificacao) {
    verificacao = comTempo('/api/status', {}, 4000)
      .then(async (r) => {
        if (!r.ok || !ehJSON(r)) return 'local' as const;
        const j = await r.json();
        return j?.gemini ? ('gemini' as const) : ('local' as const);
      })
      .catch(() => 'local' as const)
      .then((s) => (status = s));
  }
  return verificacao;
}

export const statusIA = () => status;

let catalogoCache: unknown = null;
export function catalogoCompacto() {
  if (!catalogoCache)
    catalogoCache = {
      problemas: PROBLEMAS.map((p) => ({
        id: p.id,
        titulo: p.titulo,
        perguntas: p.perguntas.map((q) => ({ id: q.id, texto: q.texto, opcoes: q.opcoes.map((o) => ({ valor: o.valor, rotulo: o.rotulo })) })),
      })),
      produtos: PRODUTOS.map((p) => ({ id: p.id, nome: p.nome, apelido: p.simples })),
    };
  return catalogoCache;
}

interface RespostaIA {
  tipo?: string;
  problema_id?: string;
  produto_ids?: string[];
  respostas?: { pergunta: string; opcao: string }[];
  mensagem?: string;
  descricao?: string;
}

function validar(j: RespostaIA): Interpretacao | null {
  if (j.tipo === 'problema' && j.problema_id && problemaPorId[j.problema_id]) {
    const p = problemaPorId[j.problema_id];
    const respostas: Record<string, string> = {};
    for (const r of j.respostas ?? []) {
      const q = p.perguntas.find((x) => x.id === r.pergunta);
      if (q && q.opcoes.some((o) => o.valor === r.opcao)) respostas[q.id] = r.opcao;
    }
    return { tipo: 'problema', problemaId: p.id, respostas, mensagem: j.mensagem, fonte: 'gemini' };
  }
  if (j.tipo === 'produtos') {
    const ids = (j.produto_ids ?? []).filter((id) => produtoPorId[id]).slice(0, 4);
    if (ids.length) return { tipo: 'produtos', ids, mensagem: j.mensagem, fonte: 'gemini' };
  }
  if (j.tipo === 'nao_entendi') return { tipo: 'nao_entendi', mensagem: j.mensagem, fonte: 'gemini' };
  return null;
}

export async function interpretar(texto: string, historico: string[] = []): Promise<Interpretacao> {
  const local = interpretarLocal(texto);
  if ((await verificarIA()) === 'gemini') {
    try {
      const r = await comTempo(
        '/api/assistente',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texto, historico, catalogo: catalogoCompacto() }) },
        14000,
      );
      if (r.ok && ehJSON(r)) {
        const v = validar(await r.json());
        // se a IA generativa não reconheceu, mas o motor local tem certeza, o local vale
        if (v && !(v.tipo === 'nao_entendi' && local.tipo !== 'nao_entendi')) return v;
      }
    } catch {
      /* cai para o modo local */
    }
  }
  return local;
}

export type ResultadoFoto =
  | { ok: true; interpretacao: Interpretacao; descricao?: string }
  | { ok: false; motivo: 'sem_ia' | 'falha' };

export async function identificarFoto(arquivo: File): Promise<ResultadoFoto> {
  if ((await verificarIA()) !== 'gemini') return { ok: false, motivo: 'sem_ia' };
  try {
    const { base64, mime } = await comprimirImagem(arquivo);
    const r = await comTempo(
      '/api/identificar',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imagem: base64, mime, catalogo: catalogoCompacto() }) },
      20000,
    );
    if (!r.ok || !ehJSON(r)) return { ok: false, motivo: 'falha' };
    const j: RespostaIA = await r.json();
    const v = validar(j);
    if (!v) return { ok: false, motivo: 'falha' };
    return { ok: true, interpretacao: v, descricao: j.descricao };
  } catch {
    return { ok: false, motivo: 'falha' };
  }
}

/** Reduz a foto para no máximo 1024 px antes de enviar (mais rápido e dentro do limite da função) */
export function comprimirImagem(arquivo: File): Promise<{ base64: string; mime: string; url: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(arquivo);
    img.onload = () => {
      const escala = Math.min(1, 1024 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * escala);
      c.height = Math.round(img.height * escala);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL('image/jpeg', 0.82);
      resolve({ base64: dataUrl.split(',')[1], mime: 'image/jpeg', url: dataUrl });
    };
    img.onerror = reject;
    img.src = url;
  });
}
