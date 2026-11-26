// Planta baixa simplificada de uma loja de ~10.000 m² (100 m x 100 m).
// 1 unidade = 1 metro. Origem (0,0) no canto superior esquerdo; a entrada fica embaixo.
//
// Gôndolas (prateleiras) correm de frente para o fundo. Entre cada par de gôndolas há
// um corredor numerado de 1 a 16. Um corredor transversal no meio (y 44–48) corta a loja,
// e há corredores largos na frente (perto dos caixas) e no fundo.

export const LOJA_W = 100;
export const LOJA_H = 100;
export const NUM_CORREDORES = 16;

export interface Ponto {
  x: number;
  y: number;
}

export const ENTRADA: Ponto = { x: 50, y: 95 };
export const CAIXAS: Ponto = { x: 24, y: 86 };
export const ATENDIMENTO: Ponto = { x: 78, y: 88 };

/** Faixa vertical das gôndolas: segmento da frente e do fundo */
export const GONDOLA_FRENTE = { y0: 48, y1: 78 };
export const GONDOLA_FUNDO = { y0: 14, y1: 44 };

/** x inicial da gôndola i (0..16); cada gôndola tem 2 m de largura */
export const xGondola = (i: number) => 9 + 5 * i;

/** x do centro do corredor k (1..16) */
export const xCorredor = (k: number) => 7.5 + 5 * k;

/** y do centro do módulo m (1..12). Módulos 1–6 na metade da frente, 7–12 na metade do fundo. */
export const yModulo = (m: number) => (m <= 6 ? 75.5 - 5 * (m - 1) : 41.5 - 5 * (m - 7));

export interface Balcao {
  x: number;
  y: number;
  w: number;
  h: number;
  rotulo?: string;
}

export const BALCOES_CAIXA: Balcao[] = [8, 14, 20, 26, 32, 38].map((x) => ({ x, y: 90, w: 3, h: 4 }));
export const BALCAO_ATENDIMENTO: Balcao = { x: 64, y: 92, w: 28, h: 5, rotulo: 'Atendimento e retirada' };

export interface Departamento {
  corredor: number;
  nome: string;
  setor: Setor;
}

export type Setor =
  | 'Ferramentas'
  | 'Ferragens'
  | 'Elétrica'
  | 'Iluminação'
  | 'Hidráulica'
  | 'Banheiro e cozinha'
  | 'Pintura e acabamento'
  | 'Jardim e limpeza';

export const SETORES: { nome: Setor; letra: string; cor: string }[] = [
  { nome: 'Ferramentas', letra: 'T', cor: '#5B6B78' },
  { nome: 'Ferragens', letra: 'F', cor: '#8A6A3D' },
  { nome: 'Elétrica', letra: 'E', cor: '#9B6A00' },
  { nome: 'Iluminação', letra: 'I', cor: '#847300' },
  { nome: 'Hidráulica', letra: 'H', cor: '#1F6FB2' },
  { nome: 'Banheiro e cozinha', letra: 'B', cor: '#267F7F' },
  { nome: 'Pintura e acabamento', letra: 'P', cor: '#B24A7A' },
  { nome: 'Jardim e limpeza', letra: 'J', cor: '#388138' },
];

export const corSetor = (s: Setor) => SETORES.find((x) => x.nome === s)?.cor ?? '#555';

export const DEPARTAMENTOS: Departamento[] = [
  { corredor: 1, nome: 'Ferramentas manuais', setor: 'Ferramentas' },
  { corredor: 2, nome: 'Ferramentas elétricas e escadas', setor: 'Ferramentas' },
  { corredor: 3, nome: 'Fixação: buchas e parafusos', setor: 'Ferragens' },
  { corredor: 4, nome: 'Ferragens e prateleiras', setor: 'Ferragens' },
  { corredor: 5, nome: 'Tomadas e interruptores', setor: 'Elétrica' },
  { corredor: 6, nome: 'Fios e proteção elétrica', setor: 'Elétrica' },
  { corredor: 7, nome: 'Lâmpadas', setor: 'Iluminação' },
  { corredor: 8, nome: 'Luminárias e plafons', setor: 'Iluminação' },
  { corredor: 9, nome: 'Conexões hidráulicas', setor: 'Hidráulica' },
  { corredor: 10, nome: 'Reparos e desentupimento', setor: 'Hidráulica' },
  { corredor: 11, nome: 'Chuveiros e resistências', setor: 'Banheiro e cozinha' },
  { corredor: 12, nome: 'Metais e louças de banheiro', setor: 'Banheiro e cozinha' },
  { corredor: 13, nome: 'Cozinha e área de serviço', setor: 'Banheiro e cozinha' },
  { corredor: 14, nome: 'Tintas', setor: 'Pintura e acabamento' },
  { corredor: 15, nome: 'Pintura, massa e rejunte', setor: 'Pintura e acabamento' },
  { corredor: 16, nome: 'Limpeza, proteção e jardim', setor: 'Jardim e limpeza' },
];

export const departamento = (corredor: number) => DEPARTAMENTOS[corredor - 1];

export const NIVEIS: Record<number, string> = {
  1: 'perto do chão',
  2: 'na altura do joelho',
  3: 'na altura da cintura',
  4: 'na altura dos olhos',
  5: 'no alto — peça ajuda para pegar',
};

/** Célula (inteira) bloqueada para caminhar? */
export function bloqueado(cx: number, cy: number): boolean {
  if (cx < 2 || cx >= LOJA_W - 2 || cy < 2 || cy >= LOJA_H - 2) return true;
  // gôndolas
  if ((cy >= GONDOLA_FRENTE.y0 && cy < GONDOLA_FRENTE.y1) || (cy >= GONDOLA_FUNDO.y0 && cy < GONDOLA_FUNDO.y1)) {
    for (let i = 0; i <= NUM_CORREDORES; i++) {
      const x0 = xGondola(i);
      if (cx >= x0 && cx < x0 + 2) return true;
    }
  }
  for (const b of [...BALCOES_CAIXA, BALCAO_ATENDIMENTO]) {
    if (cx >= b.x && cx < b.x + b.w && cy >= b.y && cy < b.y + b.h) return true;
  }
  return false;
}

/** Ponto do corredor onde a pessoa para para pegar um produto */
export function pontoDaPrateleira(corredor: number, modulo: number): Ponto {
  return { x: xCorredor(corredor), y: yModulo(modulo) };
}

/** Corredor mais próximo de um ponto (para "você está perto do corredor X") */
export function corredorMaisProximo(p: Ponto): number | null {
  if (p.y > GONDOLA_FRENTE.y1 + 2 || p.y < GONDOLA_FUNDO.y0 - 2) return null;
  let melhor = 1;
  let dist = Infinity;
  for (let k = 1; k <= NUM_CORREDORES; k++) {
    const d = Math.abs(xCorredor(k) - p.x);
    if (d < dist) {
      dist = d;
      melhor = k;
    }
  }
  return melhor;
}
