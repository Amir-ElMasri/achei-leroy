// Rota dentro da loja: todo produto alcançável, caminho sem atravessar gôndola, ordem ótima.
import { describe, it, expect } from 'vitest';
import { calcularRota, distanciaEntre } from '../src/lib/rota';
import { PRODUTOS } from '../src/data/produtos';
import { ENTRADA, CAIXAS, ATENDIMENTO, bloqueado, pontoDaPrateleira, corredorMaisProximo, xCorredor, type Ponto } from '../src/data/layout';

const pontos = [...new Map(PRODUTOS.map((p) => [`${p.corredor}-${p.modulo}`, { chave: `${p.corredor}-${p.modulo}`, ponto: pontoDaPrateleira(p.corredor, p.modulo) }])).values()];

function cruzaGondola(a: Ponto, b: Ponto) {
  const passos = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) * 4);
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    if (bloqueado(Math.floor(a.x + (b.x - a.x) * t), Math.floor(a.y + (b.y - a.y) * t))) return true;
  }
  return false;
}

describe('planta da loja', () => {
  it('entrada, caixas e atendimento ficam em área livre', () => {
    for (const p of [ENTRADA, CAIXAS, ATENDIMENTO]) expect(bloqueado(Math.floor(p.x), Math.floor(p.y))).toBe(false);
  });

  it('todo ponto de prateleira é alcançável da entrada e leva aos caixas', () => {
    for (const p of pontos) {
      expect(bloqueado(Math.floor(p.ponto.x), Math.floor(p.ponto.y)), p.chave).toBe(false);
      expect(Number.isFinite(distanciaEntre(ENTRADA, p.ponto)), p.chave).toBe(true);
      expect(Number.isFinite(distanciaEntre(p.ponto, CAIXAS)), p.chave).toBe(true);
    }
  });

  it('identifica o corredor em que a pessoa está', () => {
    for (let k = 1; k <= 16; k++) expect(corredorMaisProximo({ x: xCorredor(k), y: 60 })).toBe(k);
    expect(corredorMaisProximo(ENTRADA)).toBeNull();
  });
});

describe('cálculo da rota', () => {
  it('sem paradas vai direto aos caixas', () => {
    const r = calcularRota(ENTRADA, []);
    expect(r.ordem).toEqual([]);
    expect(r.trechos).toHaveLength(1);
    expect(r.distancia).toBeGreaterThan(0);
  });

  it('visita cada parada uma vez e nunca atravessa gôndola', () => {
    const amostra = pontos.filter((_, i) => i % 3 === 0).slice(0, 9);
    const r = calcularRota(ENTRADA, amostra);
    expect(r.ordem.map((p) => p.chave).sort()).toEqual(amostra.map((p) => p.chave).sort());
    for (const t of r.trechos) for (let i = 1; i < t.length; i++) expect(cruzaGondola(t[i - 1], t[i])).toBe(false);
    expect(r.distancia).toBeLessThanOrEqual(r.distanciaNaOrdemDaLista + 1e-6);
    expect(r.minutos).toBeGreaterThan(0);
  });

  it('ordem é a melhor possível em listas pequenas (comparada com força bruta)', () => {
    const amostra = [pontos[2], pontos[17], pontos[30], pontos[8], pontos[41], pontos[25]].filter(Boolean);
    const r = calcularRota(ENTRADA, amostra);
    const perm = (a: typeof amostra): (typeof amostra)[] => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
    const custo = (seq: typeof amostra) => {
      const pts = [ENTRADA, ...seq.map((s) => s.ponto), CAIXAS];
      return pts.slice(1).reduce((acc, p, i) => acc + distanciaEntre(pts[i], p), 0);
    };
    const melhor = Math.min(...perm(amostra).map(custo));
    expect(r.distancia).toBeCloseTo(melhor, 3);
  });

  it('lista grande (todas as prateleiras) termina rápido e visita tudo', () => {
    const t0 = performance.now();
    const r = calcularRota(ENTRADA, pontos);
    expect(performance.now() - t0).toBeLessThan(3000);
    expect(new Set(r.ordem.map((p) => p.chave)).size).toBe(pontos.length);
    expect(Number.isFinite(r.distancia)).toBe(true);
  });

  it('funciona mesmo se a pessoa marcar a posição em cima de uma gôndola', () => {
    const r = calcularRota({ x: 10, y: 60 }, pontos.slice(0, 3));
    expect(Number.isFinite(r.distancia)).toBe(true);
  });
});
