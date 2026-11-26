// Integridade dos dados: catálogo, lojas, problemas e kits.
import { describe, it, expect } from 'vitest';
import { PRODUTOS, produtoPorId, GLOSSARIO } from '../src/data/produtos';
import { PROBLEMAS, perguntasPendentes, calcularTinta, type Problema, type Respostas } from '../src/data/problemas';
import { LOJAS } from '../src/data/lojas';
import { DEPARTAMENTOS, NUM_CORREDORES, SETORES } from '../src/data/layout';

/** Todas as combinações de respostas que o cliente consegue dar (respeitando perguntas condicionais) */
export function combinacoes(p: Problema): Respostas[] {
  let parciais: Respostas[] = [{}];
  for (const q of p.perguntas) {
    const prox: Respostas[] = [];
    for (const r of parciais) {
      if (q.quando && !q.quando(r)) prox.push(r);
      else for (const o of q.opcoes) prox.push({ ...r, [q.id]: o.valor });
    }
    parciais = prox;
  }
  return parciais;
}

describe('catálogo de produtos', () => {
  it('ids são únicos', () => {
    const ids = PRODUTOS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(PRODUTOS.map((p) => [p.id, p] as const))('%s tem posição, preço e textos válidos', (_id, p) => {
    expect(p.corredor).toBeGreaterThanOrEqual(1);
    expect(p.corredor).toBeLessThanOrEqual(NUM_CORREDORES);
    expect(p.modulo).toBeGreaterThanOrEqual(1);
    expect(p.modulo).toBeLessThanOrEqual(12);
    expect([1, 2, 3, 4, 5]).toContain(p.nivel);
    expect(['E', 'D']).toContain(p.lado);
    expect(p.preco).toBeGreaterThan(0);
    expect(p.estoque).toBeGreaterThanOrEqual(0);
    expect(p.nome.trim().length).toBeGreaterThan(2);
    expect(p.simples.trim().length).toBeGreaterThan(2);
    expect(p.explica.trim().length).toBeGreaterThan(10);
    expect(p.termos.length).toBeGreaterThan(0);
    expect(p.specs.length).toBeGreaterThan(0);
  });

  it('todo termo técnico da ficha tem explicação no glossário', () => {
    const faltando = PRODUTOS.flatMap((p) => p.specs.filter((s) => s.termo && !GLOSSARIO[s.termo]).map((s) => `${p.id}:${s.termo}`));
    expect(faltando).toEqual([]);
  });

  it('alternativas apontam para produtos que existem', () => {
    const ruins = PRODUTOS.flatMap((p) => (p.alternativas ?? []).filter((a) => !produtoPorId[a] || a === p.id).map((a) => `${p.id}→${a}`));
    expect(ruins).toEqual([]);
  });

  it('dois produtos não ocupam o mesmo lugar da prateleira', () => {
    const vistos = new Map<string, string>();
    const repetidos: string[] = [];
    for (const p of PRODUTOS) {
      const k = `${p.corredor}-${p.lado}-${p.modulo}-${p.nivel}`;
      if (vistos.has(k)) repetidos.push(`${vistos.get(k)} e ${p.id}`);
      vistos.set(k, p.id);
    }
    expect(repetidos).toEqual([]);
  });

  it('todo corredor tem departamento e setor com cor', () => {
    expect(DEPARTAMENTOS).toHaveLength(NUM_CORREDORES);
    for (const d of DEPARTAMENTOS) expect(SETORES.some((s) => s.nome === d.setor)).toBe(true);
  });
});

describe('lojas', () => {
  it('ajustes de estoque usam produtos que existem', () => {
    for (const l of LOJAS) for (const id of Object.keys(l.ajustes)) expect(produtoPorId[id], `${l.id}: ${id}`).toBeDefined();
  });
  it('ids únicos', () => {
    expect(new Set(LOJAS.map((l) => l.id)).size).toBe(LOJAS.length);
  });
});

describe('problemas e kits', () => {
  it('ids únicos e perguntas bem formadas', () => {
    expect(new Set(PROBLEMAS.map((p) => p.id)).size).toBe(PROBLEMAS.length);
    for (const p of PROBLEMAS) {
      expect(new Set(p.perguntas.map((q) => q.id)).size).toBe(p.perguntas.length);
      for (const q of p.perguntas) {
        expect(q.opcoes.length, `${p.id}.${q.id}`).toBeGreaterThanOrEqual(2);
        expect(new Set(q.opcoes.map((o) => o.valor)).size).toBe(q.opcoes.length);
      }
    }
  });

  for (const p of PROBLEMAS) {
    it(`${p.id}: toda combinação de respostas gera um resultado válido`, () => {
      const combos = combinacoes(p);
      expect(combos.length).toBeGreaterThan(0);
      for (const r of combos) {
        const ctx = `${p.id} ${JSON.stringify(r)}`;
        expect(perguntasPendentes(p, r), ctx).toEqual([]);
        const kit = p.kit(r);
        const ids = kit.map((i) => i.produtoId);
        expect(new Set(ids).size, `${ctx} tem item repetido`).toBe(ids.length);
        for (const i of kit) {
          expect(produtoPorId[i.produtoId], `${ctx} produto ${i.produtoId}`).toBeDefined();
          expect(Number.isInteger(i.qtd) && i.qtd >= 1, `${ctx} qtd`).toBe(true);
          expect(i.motivo.trim().length, `${ctx} motivo`).toBeGreaterThan(5);
        }
        // sem nenhum produto para comprar, o cliente precisa ser levado a um especialista
        const temProdutoPrincipal = kit.some((i) => !i.ferramenta && !i.esquecido);
        if (!temProdutoPrincipal) expect(p.especialista?.(r), `${ctx} sem produto e sem especialista`).toBeTruthy();
        const passos = p.passos(r);
        expect(Array.isArray(passos)).toBe(true);
        if (temProdutoPrincipal) expect(passos.length, `${ctx} sem passo a passo`).toBeGreaterThan(0);
        for (const s of passos) expect(s.trim().length).toBeGreaterThan(5);
        for (const f of [p.alerta, p.nota, p.especialista]) {
          const v = f?.(r);
          if (v !== undefined) expect(typeof v).toBe('string');
        }
      }
    });
  }

  it('cálculo de tinta cobre duas demãos', () => {
    for (const tamanho of ['P', 'M', 'G'])
      for (const umido of ['sim', 'nao']) {
        const t = calcularTinta({ tamanho, umido });
        const litrosComprados = t.qtd * (t.tinta === 'tinta-lata-branco' ? 18 : 3.6);
        expect(litrosComprados, `${tamanho}/${umido}`).toBeGreaterThanOrEqual(t.litros);
        expect(t.qtd).toBeGreaterThanOrEqual(1);
      }
  });
});
