// Dados de demonstração: outros clientes na fila e o movimento do dia na loja.
// No mundo real, isso viria do sistema de atendimento e do histórico de uso do app.

import type { Setor } from '../data/layout';
import { PROBLEMAS } from '../data/problemas';
import { PRODUTOS } from '../data/produtos';
import { LOJAS } from '../data/lojas';

export type StatusTicket = 'aguardando' | 'a_caminho' | 'em_atendimento' | 'concluido' | 'cancelado';

export interface ResumoCaso {
  problema?: string;
  problemaId?: string;
  respostas: { pergunta: string; resposta: string }[];
  itens: { nome: string; corredor: number; coletado: boolean; esgotado: boolean }[];
  corredor: number | null;
  onde: string;
  observacao?: string;
  ultimaMensagem?: string;
}

export interface Ticket {
  id: string;
  senha: string;
  lojaId: string;
  setor: Setor;
  criadoEm: number;
  atualizadoEm: number;
  status: StatusTicket;
  vendedor?: string;
  resumo: ResumoCaso;
  /** chamado de outro cliente, criado para a demonstração */
  simulado?: boolean;
  /** chamado deste aparelho */
  doCliente?: boolean;
}

export interface Evento {
  t: number;
  lojaId: string;
  tipo: 'busca' | 'rota' | 'coleta' | 'esgotado' | 'chamado' | 'atendido';
  texto?: string;
  resultado?: 'problema' | 'produtos' | 'nao_entendi';
  problemaId?: string;
  produtoId?: string;
  setor?: Setor;
  metros?: number;
  economia?: number;
  espera?: number;
  simulado?: boolean;
}

export const VENDEDORES: { nome: string; setor: Setor }[] = [
  { nome: 'Ana', setor: 'Hidráulica' },
  { nome: 'Bruno', setor: 'Elétrica' },
  { nome: 'Carla', setor: 'Pintura e acabamento' },
  { nome: 'Diego', setor: 'Ferragens' },
  { nome: 'Eduarda', setor: 'Banheiro e cozinha' },
  { nome: 'Fábio', setor: 'Ferramentas' },
  { nome: 'Gisele', setor: 'Iluminação' },
  { nome: 'Heitor', setor: 'Jardim e limpeza' },
];

export const vendedorDoSetor = (s: Setor) => VENDEDORES.find((v) => v.setor === s)?.nome ?? 'Especialista';

export function ticketsIniciais(agora = Date.now()): Ticket[] {
  const t: Ticket[] = [];
  for (const loja of LOJAS) {
    t.push({
      id: `sim-h-${loja.id}`,
      senha: 'H-012',
      lojaId: loja.id,
      setor: 'Hidráulica',
      criadoEm: agora - 4 * 60000,
      atualizadoEm: agora - 4 * 60000,
      status: 'aguardando',
      simulado: true,
      resumo: {
        problema: 'Torneira pingando ou vazando',
        problemaId: 'torneira-pingando',
        respostas: [
          { pergunta: 'Como a sua torneira abre?', resposta: 'Gira várias voltas' },
          { pergunta: 'Por onde sai a água?', resposta: 'Pinga pela bica, mesmo fechada' },
        ],
        itens: [
          { nome: 'Reparo de vedação para torneira 1/2" e 3/4"', corredor: 10, coletado: true, esgotado: false },
          { nome: 'Fita veda-rosca 18 mm x 25 m', corredor: 9, coletado: false, esgotado: false },
        ],
        corredor: 10,
        onde: 'Corredor 10, Reparos e desentupimento',
        observacao: 'A torneira é bem antiga, de parede. Não sei se o reparo serve nela.',
      },
    });
    t.push({
      id: `sim-e-${loja.id}`,
      senha: 'E-007',
      lojaId: loja.id,
      setor: 'Elétrica',
      criadoEm: agora - 9 * 60000,
      atualizadoEm: agora - 2 * 60000,
      status: 'em_atendimento',
      vendedor: 'Bruno',
      simulado: true,
      resumo: {
        problema: 'Trocar tomada',
        problemaId: 'trocar-tomada',
        respostas: [
          { pergunta: 'Para que é a tomada?', resposta: 'Aparelho forte (micro-ondas, air fryer, máquina de lavar)' },
          { pergunta: 'A tomada antiga está derretida ou escurecida?', resposta: 'Sim' },
        ],
        itens: [{ nome: 'Tomada 2P+T 20 A com placa 4x2', corredor: 5, coletado: true, esgotado: false }],
        corredor: 5,
        onde: 'Corredor 5, Tomadas e interruptores',
      },
    });
  }
  return t;
}

// Gerador pseudoaleatório com semente, para o "movimento do dia" ser sempre o mesmo por loja
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PESO_PROBLEMAS: Record<string, number> = {
  'torneira-pingando': 14, 'trocar-chuveiro': 12, 'pintar-comodo': 11, 'fixar-parede': 9, 'pia-entupida': 8, 'trocar-tomada': 7,
  'vazamento-pia': 6, iluminacao: 6, 'descarga-vazando': 5, mofo: 4, rejunte: 4, porta: 3, horta: 2, disjuntor: 2,
};

const NAO_ENCONTRADOS: [string, number][] = [
  ['torneira gourmet preta', 9], ['piso vinílico', 7], ['aquecedor a gás', 6], ['cortina blackout', 5], ['ventilador de teto', 5],
  ['porcelanato 60x60', 4], ['fechadura digital', 4], ['tomada usb', 3], ['caixa d’água 500 litros', 2],
];

const PESO_SETOR: [Setor, number][] = [
  ['Hidráulica', 9], ['Elétrica', 8], ['Pintura e acabamento', 6], ['Banheiro e cozinha', 5], ['Ferragens', 3], ['Ferramentas', 2], ['Iluminação', 2], ['Jardim e limpeza', 1],
];

function sorteio<T>(r: () => number, itens: [T, number][]): T {
  const total = itens.reduce((a, [, p]) => a + p, 0);
  let x = r() * total;
  for (const [v, p] of itens) {
    x -= p;
    if (x <= 0) return v;
  }
  return itens[itens.length - 1][0];
}

const PESO_HORA: [number, number][] = [
  [8, 3], [9, 5], [10, 9], [11, 10], [12, 7], [13, 5], [14, 5], [15, 6], [16, 7], [17, 10], [18, 11], [19, 9], [20, 5], [21, 2],
];

/** Movimento simulado de um dia típico da loja */
export function eventosSimulados(lojaId: string, agora = new Date()): Evento[] {
  const semente = [...lojaId].reduce((a, c) => a + c.charCodeAt(0), 0) + agora.getDate() * 31;
  const r = mulberry32(semente);
  const fator = LOJAS.find((l) => l.id === lojaId)?.fator ?? 1;
  const base = new Date(agora);
  base.setHours(0, 0, 0, 0);
  const hoje = base.getTime();
  const ev: Evento[] = [];
  const total = Math.round(230 * fator);
  for (let i = 0; i < total; i++) {
    const hora = sorteio(r, PESO_HORA) + r();
    const t = hoje + hora * 3600000;
    const tipoR = r();
    if (tipoR < 0.62) {
      ev.push({ t, lojaId, tipo: 'busca', resultado: 'problema', problemaId: sorteio(r, Object.entries(PESO_PROBLEMAS)), simulado: true });
    } else if (tipoR < 0.86) {
      const p = PRODUTOS[Math.floor(r() * PRODUTOS.length)];
      ev.push({ t, lojaId, tipo: 'busca', resultado: 'produtos', produtoId: p.id, simulado: true });
    } else {
      ev.push({ t, lojaId, tipo: 'busca', resultado: 'nao_entendi', texto: sorteio(r, NAO_ENCONTRADOS), simulado: true });
    }
    if (r() < 0.55) {
      const metros = 90 + r() * 260;
      ev.push({ t: t + 60000, lojaId, tipo: 'rota', metros, economia: metros * (0.15 + r() * 0.35), simulado: true });
    }
    if (r() < 0.16) ev.push({ t: t + 120000, lojaId, tipo: 'chamado', setor: sorteio(r, PESO_SETOR), espera: 1 + r() * 9, simulado: true });
  }
  const esgotados: [string, number][] = [['tinta-galao-branco', 9], ['chuveiro-220', 4], ['mecanismo-ceramico', 4], ['bucha-drywall', 2], ['furadeira', 1]];
  const loja = LOJAS.find((l) => l.id === lojaId);
  const validos = esgotados.filter(([id]) => (loja?.ajustes[id] ?? 99) <= 4);
  for (let i = 0; i < 26 && validos.length; i++) {
    const hora = sorteio(r, PESO_HORA) + r();
    ev.push({ t: hoje + hora * 3600000, lojaId, tipo: 'esgotado', produtoId: sorteio(r, validos), simulado: true });
  }
  return ev.sort((a, b) => a.t - b.t);
}

export const tituloProblema = (id?: string) => PROBLEMAS.find((p) => p.id === id)?.titulo ?? id ?? '';
