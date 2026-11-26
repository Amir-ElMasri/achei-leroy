// Motor local de linguagem natural.
// Entende frases do jeito que o cliente fala ("minha pia entupiu", "onde fica veda rosca"),
// tolera erros de digitação e devolve um problema conhecido ou uma lista de produtos.
// É o "modo local" da IA: funciona sem internet e sem chave de API. Quando a IA generativa
// (Gemini) está conectada, ela assume a interpretação e este motor vira a rede de segurança.

import { PRODUTOS } from '../data/produtos';
import { PROBLEMAS, type Problema, type Pergunta, type Respostas, type Opcao } from '../data/problemas';

export type Fonte = 'gemini' | 'local';

export type Interpretacao =
  | { tipo: 'problema'; problemaId: string; respostas: Respostas; mensagem?: string; fonte: Fonte }
  | { tipo: 'produtos'; ids: string[]; mensagem?: string; fonte: Fonte }
  | { tipo: 'nao_entendi'; mensagem?: string; fonte: Fonte };

export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set(
  'a o as os um uma uns umas de da do das dos em na no nas nos para pra pro por pelo pela com e ou que eu meu minha meus minhas me mim voce vc ele ela isso isto esse essa este esta aquele aquela ta tah estou estao tem tenho ter ser foi era muito mais ja so tambem aqui ali la quero queria preciso precisava precisando gostaria qual quais quando oi ola bom boa dia tarde noite favor obrigado obrigada ajuda ajudar consigo posso pode algum alguma alguem coisa casa vou vai fazer to tou deu dar ai entao tipo hoje agora acho sei'.split(
    ' ',
  ),
);

const SINONIMOS: Record<string, string> = {};
const grupos: [string, string[]][] = [
  ['vazando', ['vaza', 'vazou', 'vazar', 'vazamento', 'vazamentos', 'vazam']],
  ['pingando', ['pinga', 'pingou', 'pingar', 'goteja', 'gotejando', 'gotejar', 'goteira', 'pingam']],
  ['entupido', ['entupiu', 'entupida', 'entupidas', 'entupidos', 'entupimento', 'entupir', 'entope', 'entupindo', 'entopiu', 'tapado', 'tapada']],
  ['queimado', ['queimou', 'queimada', 'queimadas', 'queimando', 'queimaram']],
  ['quebrado', ['quebrou', 'quebrada', 'quebrando', 'estragou', 'estragada', 'estragado', 'pifou']],
  ['rangendo', ['range', 'rangido', 'rangeu', 'rangindo', 'chiando', 'chiado', 'rangem']],
  ['mofo', ['mofado', 'mofada', 'bolor', 'embolorado', 'embolorada', 'mofos']],
  ['esquenta', ['esquentando', 'esquentar', 'aquece', 'aquecendo', 'esquentou']],
  ['derretida', ['derreteu', 'derretido', 'derretendo']],
  ['solta', ['soltou', 'soltando', 'solto', 'soltas']],
  ['frio', ['fria', 'gelada', 'gelado']],
  ['vaso', ['privada', 'sanitario']],
  ['micro ondas', ['microondas']],
  ['air fryer', ['airfryer', 'fritadeira']],
  ['lampada', ['lampadas', 'lampda', 'lampa']],
  ['chuveiro', ['xuveiro', 'chuvero']],
];
for (const [canon, lista] of grupos) for (const w of lista) SINONIMOS[w] = canon;

const SUFIXOS = ['amentos', 'amento', 'imentos', 'imento', 'ando', 'endo', 'indo', 'adas', 'ados', 'idas', 'idos', 'ada', 'ado', 'ida', 'ido', 'aram', 'eram', 'iram', 'ou', 'eu', 'iu', 'ar', 'er', 'ir'];

export function stem(t: string): string {
  if (/\d/.test(t) || t.length <= 4) return t;
  for (const s of SUFIXOS) if (t.endsWith(s) && t.length - s.length >= 4) return t.slice(0, -s.length);
  if (t.endsWith('oes') && t.length > 5) return t.slice(0, -3) + 'ao';
  if (t.endsWith('s') && t.length > 4) return t.slice(0, -1);
  return t;
}

/** Texto → lista de radicais significativos */
export function tokens(texto: string, manterStop = false): string[] {
  const brutos = normalizar(texto).split(' ').filter(Boolean);
  const saida: string[] = [];
  for (const b of brutos) {
    const exp = SINONIMOS[b] ?? b;
    for (const t of exp.split(' ')) {
      if (!manterStop && STOP.has(t)) continue;
      saida.push(stem(t));
    }
  }
  return saida;
}

function levenshtein(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const v = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = v[0];
    v[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = v[j];
      v[j] = Math.min(v[j] + 1, v[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return v[b.length];
}

/** Semelhança entre duas palavras (0 a 1) */
export function similaridade(q: string, t: string): number {
  if (q === t) return 1;
  const [curta, longa] = q.length <= t.length ? [q, t] : [t, q];
  if (curta.length >= 4 && longa.startsWith(curta) && longa.length - curta.length <= 4) return 0.8;
  if (curta.length >= 5) {
    const d = levenshtein(q, t);
    if (d === 1) return 0.75;
    if (d === 2 && curta.length >= 7) return 0.6;
  }
  return 0;
}

interface Campo {
  tokens: string[];
  peso: number;
}
interface Doc {
  tipo: 'problema' | 'produto';
  id: string;
  campos: Campo[];
  frases: string[][];
}

const DOCS: Doc[] = [
  ...PROBLEMAS.map<Doc>((p) => ({
    tipo: 'problema',
    id: p.id,
    campos: [{ tokens: tokens(p.titulo), peso: 1.5 }, ...p.gatilhos.map((g) => ({ tokens: tokens(g), peso: 3 }))],
    frases: p.gatilhos.map((g) => tokens(g)).filter((f) => f.length > 1),
  })),
  ...PRODUTOS.map<Doc>((p) => ({
    tipo: 'produto',
    id: p.id,
    campos: [{ tokens: tokens(p.nome), peso: 2 }, { tokens: tokens(p.simples), peso: 2 }, ...p.termos.map((t) => ({ tokens: tokens(t), peso: 3 }))],
    frases: [...p.termos, p.simples].map((t) => tokens(t)).filter((f) => f.length > 1),
  })),
];

const DF = new Map<string, number>();
for (const d of DOCS) {
  const vistos = new Set(d.campos.flatMap((c) => c.tokens));
  for (const t of vistos) DF.set(t, (DF.get(t) ?? 0) + 1);
}
const idf = (t: string) => Math.log(1 + DOCS.length / (DF.get(t) ?? 1));

function pontuar(doc: Doc, q: string[]): number {
  let total = 0;
  for (const qt of q) {
    let melhor = 0;
    for (const c of doc.campos)
      for (const t of c.tokens) {
        const s = similaridade(qt, t);
        if (s > 0) melhor = Math.max(melhor, s * c.peso * idf(t));
      }
    total += melhor;
  }
  for (const f of doc.frases) {
    if (f.every((ft) => q.some((qt) => similaridade(qt, ft) >= 0.75))) total += 2 * f.length;
  }
  return total;
}

const INTENCAO_PRODUTO = new Set(
  ['onde', 'acha', 'achar', 'encontrar', 'encontro', 'procuro', 'procurando', 'comprar', 'preco', 'quanto', 'custa', 'vende', 'vendem', 'corredor', 'localiza'].map(stem),
);
const INTENCAO_PROBLEMA = new Set(
  [
    'consertar', 'arrumar', 'resolver', 'trocar', 'instalar', 'pintar', 'pendurar', 'plantar', 'fixar', 'furar', 'desentupir', 'limpar', 'montar', 'reformar', 'colocar',
    'pingando', 'vazando', 'entupido', 'quebrado', 'queimado', 'derretida', 'solta', 'rangendo', 'mofo', 'esquenta', 'frio', 'nao', 'problema', 'como',
    'desarmando', 'caindo', 'cai', 'escorrendo', 'emperrada', 'emperrado', 'travou', 'travada', 'encardido', 'rachado', 'molhado', 'arrastando', 'desce', 'parou', 'caida', 'raspando', 'sujo',
  ].map(stem),
);

export interface Ranking {
  problemas: { id: string; score: number }[];
  produtos: { id: string; score: number }[];
}

export function ranquear(texto: string): Ranking & { q: string[]; querProduto: boolean; querResolver: boolean } {
  const todos = tokens(texto, true);
  const q = tokens(texto);
  const querProduto = todos.some((t) => INTENCAO_PRODUTO.has(t));
  const querResolver = todos.some((t) => INTENCAO_PROBLEMA.has(t));
  const problemas: { id: string; score: number }[] = [];
  const produtos: { id: string; score: number }[] = [];
  for (const d of DOCS) {
    let s = pontuar(d, q);
    if (s <= 0) continue;
    if (d.tipo === 'problema') {
      if (querProduto && !querResolver) s *= 0.55;
      problemas.push({ id: d.id, score: s });
    } else {
      if (querResolver && !querProduto) s *= 0.7;
      produtos.push({ id: d.id, score: s });
    }
  }
  problemas.sort((a, b) => b.score - a.score);
  produtos.sort((a, b) => b.score - a.score);
  return { problemas, produtos, q, querProduto, querResolver };
}

/** Respostas que o próprio texto do cliente já dá (ex.: "chuveiro 220" → voltagem 220) */
export function extrairRespostas(p: Problema, texto: string): Respostas {
  const n = ` ${normalizar(texto)} `;
  const r: Respostas = {};
  for (const perg of p.perguntas) {
    const achadas = perg.opcoes.filter((o) => (o.sinais ?? []).some((s) => n.includes(` ${normalizar(s)}`)));
    if (achadas.length === 1) r[perg.id] = achadas[0].valor;
  }
  return r;
}

/** Tenta casar uma resposta digitada com uma das opções da pergunta */
export function casarOpcao(texto: string, perg: Pergunta): Opcao | null {
  const n = ` ${normalizar(texto)} `;
  const porSinal = perg.opcoes.filter((o) => (o.sinais ?? []).some((s) => n.includes(` ${normalizar(s)}`)));
  if (porSinal.length === 1) return porSinal[0];
  const q = tokens(texto);
  if (!q.length) return null;
  let melhor: Opcao | null = null;
  let melhorScore = 0;
  let empate = false;
  for (const o of perg.opcoes) {
    const t = tokens(o.rotulo);
    const s = q.reduce((acc, qt) => acc + Math.max(0, ...t.map((x) => similaridade(qt, x))), 0);
    if (s > melhorScore) {
      melhor = o;
      melhorScore = s;
      empate = false;
    } else if (s === melhorScore && s > 0) empate = true;
  }
  return melhorScore >= 0.75 && !empate ? melhor : null;
}

const LIMIAR = 4.5;

export function interpretarLocal(texto: string): Interpretacao {
  const { problemas, produtos, q, querProduto, querResolver } = ranquear(texto);
  if (!q.length) {
    return { tipo: 'nao_entendi', fonte: 'local', mensagem: 'Oi! Me conte o que você quer resolver ou o produto que está procurando.' };
  }
  const p0 = problemas[0];
  const d0 = produtos[0];
  const ps = p0?.score ?? 0;
  const ds = d0?.score ?? 0;

  const escolherProdutos = () => {
    const ids = produtos.filter((p) => p.score >= Math.max(LIMIAR * 0.8, ds * 0.55)).slice(0, 4).map((p) => p.id);
    return { tipo: 'produtos' as const, ids, fonte: 'local' as const };
  };

  if (querProduto && ds >= LIMIAR && ds >= ps * 0.6) return escolherProdutos();
  // o cliente descreveu algo acontecendo ("está esquentando", "fica desarmando"): o problema vem antes do produto
  const descreveProblema = querResolver && !querProduto && ps >= LIMIAR && ps >= ds * 0.6;
  // só o nome de algo ("sifão", "tomada"): empate favorece o produto
  const soUmNome = !querResolver && !querProduto && q.length <= 1;
  if (descreveProblema || (ps >= LIMIAR && ps >= ds * (soUmNome ? 1.15 : 0.85))) {
    const p = PROBLEMAS.find((x) => x.id === p0.id)!;
    return { tipo: 'problema', problemaId: p.id, respostas: extrairRespostas(p, texto), fonte: 'local' };
  }
  if (ds >= LIMIAR) return escolherProdutos();
  return {
    tipo: 'nao_entendi',
    fonte: 'local',
    mensagem: 'Não entendi bem. Pode me dizer em que cômodo está o problema e o que aconteceu? Por exemplo: "a pia da cozinha está entupida".',
  };
}
