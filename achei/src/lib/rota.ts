// Cálculo da rota dentro da loja.
// 1) A planta vira uma grade de 1 m x 1 m (gôndolas e balcões bloqueiam a passagem).
// 2) Dijkstra a partir de cada parada dá a distância real andando entre todos os pontos.
// 3) A ordem de visita é otimizada (Held-Karp exato até 10 paradas; vizinho mais próximo + 2-opt acima disso),
//    saindo da posição do cliente e terminando nos caixas.

import { LOJA_W, LOJA_H, bloqueado, CAIXAS, type Ponto } from '../data/layout';

const N = LOJA_W * LOJA_H;
const GRADE = new Uint8Array(N);
for (let y = 0; y < LOJA_H; y++) for (let x = 0; x < LOJA_W; x++) GRADE[y * LOJA_W + x] = bloqueado(x, y) ? 1 : 0;

const idx = (x: number, y: number) => y * LOJA_W + x;

function celula(p: Ponto): number {
  let cx = Math.max(0, Math.min(LOJA_W - 1, Math.floor(p.x)));
  let cy = Math.max(0, Math.min(LOJA_H - 1, Math.floor(p.y)));
  if (!GRADE[idx(cx, cy)]) return idx(cx, cy);
  // procura a célula livre mais próxima
  for (let r = 1; r < 6; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && ny >= 0 && nx < LOJA_W && ny < LOJA_H && !GRADE[idx(nx, ny)]) return idx(nx, ny);
      }
  return idx(cx, cy);
}

class Heap {
  private a: number[] = [];
  private p: number[] = [];
  get size() {
    return this.a.length;
  }
  push(v: number, prio: number) {
    this.a.push(v);
    this.p.push(prio);
    let i = this.a.length - 1;
    while (i > 0) {
      const pai = (i - 1) >> 1;
      if (this.p[pai] <= this.p[i]) break;
      [this.a[pai], this.a[i]] = [this.a[i], this.a[pai]];
      [this.p[pai], this.p[i]] = [this.p[i], this.p[pai]];
      i = pai;
    }
  }
  pop(): [number, number] {
    const topo: [number, number] = [this.a[0], this.p[0]];
    const ua = this.a.pop()!;
    const up = this.p.pop()!;
    if (this.a.length) {
      this.a[0] = ua;
      this.p[0] = up;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < this.a.length && this.p[l] < this.p[m]) m = l;
        if (r < this.a.length && this.p[r] < this.p[m]) m = r;
        if (m === i) break;
        [this.a[m], this.a[i]] = [this.a[i], this.a[m]];
        [this.p[m], this.p[i]] = [this.p[i], this.p[m]];
        i = m;
      }
    }
    return topo;
  }
}

const VIZ: [number, number, number][] = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

const cacheDijkstra = new Map<number, { dist: Float64Array; prev: Int32Array }>();

function dijkstra(origem: number) {
  const c = cacheDijkstra.get(origem);
  if (c) return c;
  const dist = new Float64Array(N).fill(Infinity);
  const prev = new Int32Array(N).fill(-1);
  const h = new Heap();
  dist[origem] = 0;
  h.push(origem, 0);
  while (h.size) {
    const [u, d] = h.pop();
    if (d > dist[u]) continue;
    const ux = u % LOJA_W;
    const uy = (u / LOJA_W) | 0;
    for (const [dx, dy, custo] of VIZ) {
      const nx = ux + dx;
      const ny = uy + dy;
      if (nx < 0 || ny < 0 || nx >= LOJA_W || ny >= LOJA_H) continue;
      const v = idx(nx, ny);
      if (GRADE[v]) continue;
      if (dx && dy && (GRADE[idx(ux + dx, uy)] || GRADE[idx(ux, uy + dy)])) continue; // sem cortar quina
      const nd = d + custo;
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
        h.push(v, nd);
      }
    }
  }
  const r = { dist, prev };
  if (cacheDijkstra.size > 40) cacheDijkstra.clear();
  cacheDijkstra.set(origem, r);
  return r;
}

const centro = (c: number): Ponto => ({ x: (c % LOJA_W) + 0.5, y: ((c / LOJA_W) | 0) + 0.5 });

function linhaLivre(a: Ponto, b: Ponto): boolean {
  const passos = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 3);
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    // margem de meio metro para o traço não encostar na gôndola
    for (const [ox, oy] of [[0, 0], [0.45, 0], [-0.45, 0], [0, 0.45], [0, -0.45]]) {
      if (GRADE[idx(Math.floor(x + ox), Math.floor(y + oy))]) return false;
    }
  }
  return true;
}

/** Caminho em pontos (já suavizado) entre duas células */
function caminho(de: number, para: number): Ponto[] {
  const { prev } = dijkstra(de);
  const cel: number[] = [];
  for (let c = para; c !== -1; c = prev[c]) {
    cel.push(c);
    if (c === de) break;
  }
  cel.reverse();
  const pts = cel.map(centro);
  if (pts.length < 3) return pts;
  // "puxar o barbante": mantém só os pontos necessários para contornar obstáculos
  const out: Ponto[] = [pts[0]];
  let ancora = 0;
  while (ancora < pts.length - 1) {
    let prox = ancora + 1;
    for (let j = pts.length - 1; j > ancora + 1; j--) {
      if (linhaLivre(pts[ancora], pts[j])) {
        prox = j;
        break;
      }
    }
    out.push(pts[prox]);
    ancora = prox;
  }
  return out;
}

export interface ParadaEntrada {
  chave: string;
  ponto: Ponto;
}

export interface Rota<T extends ParadaEntrada> {
  ordem: T[];
  trechos: Ponto[][];
  /** distância em metros, da posição atual até os caixas */
  distancia: number;
  /** distância se o cliente seguisse a lista na ordem em que foi montada */
  distanciaNaOrdemDaLista: number;
  minutos: number;
}

export function distanciaEntre(a: Ponto, b: Ponto): number {
  return dijkstra(celula(a)).dist[celula(b)];
}

export function calcularRota<T extends ParadaEntrada>(inicio: Ponto, paradas: T[], fim: Ponto = CAIXAS): Rota<T> {
  const pontos = [inicio, ...paradas.map((p) => p.ponto), fim];
  const cels = pontos.map(celula);
  const n = paradas.length;
  const D = cels.map((a) => {
    const { dist } = dijkstra(a);
    return cels.map((b) => dist[b]);
  });
  // índices: 0 = início, 1..n = paradas, n+1 = fim
  let ordem: number[];
  if (n === 0) ordem = [];
  else if (n <= 10) ordem = heldKarp(D, n);
  else ordem = doisOpt(D, vizinhoMaisProximo(D, n));

  const seq = [0, ...ordem, n + 1];
  const custo = (s: number[]) => s.slice(1).reduce((acc, v, i) => acc + D[s[i]][v], 0);
  const distancia = custo(seq);
  const distanciaNaOrdemDaLista = custo([0, ...paradas.map((_, i) => i + 1), n + 1]);
  const trechos: Ponto[][] = [];
  for (let i = 0; i < seq.length - 1; i++) trechos.push(caminho(cels[seq[i]], cels[seq[i + 1]]));
  const minutos = distancia / 0.9 / 60 + n * 0.5;
  return { ordem: ordem.map((i) => paradas[i - 1]), trechos, distancia, distanciaNaOrdemDaLista, minutos };
}

function heldKarp(D: number[][], n: number): number[] {
  const FULL = 1 << n;
  const dp = new Float64Array(FULL * n).fill(Infinity);
  const pai = new Int8Array(FULL * n).fill(-1);
  for (let j = 0; j < n; j++) dp[(1 << j) * n + j] = D[0][j + 1];
  for (let mask = 1; mask < FULL; mask++) {
    for (let j = 0; j < n; j++) {
      if (!(mask & (1 << j))) continue;
      const atual = dp[mask * n + j];
      if (atual === Infinity) continue;
      for (let k = 0; k < n; k++) {
        if (mask & (1 << k)) continue;
        const nm = mask | (1 << k);
        const v = atual + D[j + 1][k + 1];
        if (v < dp[nm * n + k]) {
          dp[nm * n + k] = v;
          pai[nm * n + k] = j;
        }
      }
    }
  }
  let melhor = Infinity;
  let ult = 0;
  for (let j = 0; j < n; j++) {
    const v = dp[(FULL - 1) * n + j] + D[j + 1][n + 1];
    if (v < melhor) {
      melhor = v;
      ult = j;
    }
  }
  const ordem: number[] = [];
  let mask = FULL - 1;
  let j = ult;
  while (j !== -1) {
    ordem.push(j + 1);
    const pj = pai[mask * n + j];
    mask &= ~(1 << j);
    j = pj;
  }
  return ordem.reverse();
}

function vizinhoMaisProximo(D: number[][], n: number): number[] {
  const restantes = new Set(Array.from({ length: n }, (_, i) => i + 1));
  const ordem: number[] = [];
  let atual = 0;
  while (restantes.size) {
    let melhor = -1;
    let d = Infinity;
    for (const r of restantes)
      if (D[atual][r] < d) {
        d = D[atual][r];
        melhor = r;
      }
    ordem.push(melhor);
    restantes.delete(melhor);
    atual = melhor;
  }
  return ordem;
}

function doisOpt(D: number[][], ordem: number[]): number[] {
  const n = ordem.length;
  const seq = [0, ...ordem, n + 1];
  let melhorou = true;
  while (melhorou) {
    melhorou = false;
    for (let i = 1; i < seq.length - 2; i++)
      for (let k = i + 1; k < seq.length - 1; k++) {
        const antes = D[seq[i - 1]][seq[i]] + D[seq[k]][seq[k + 1]];
        const depois = D[seq[i - 1]][seq[k]] + D[seq[i]][seq[k + 1]];
        if (depois + 1e-6 < antes) {
          seq.splice(i, k - i + 1, ...seq.slice(i, k + 1).reverse());
          melhorou = true;
        }
      }
  }
  return seq.slice(1, -1);
}
