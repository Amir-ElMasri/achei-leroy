// Lojas fictícias usadas na demonstração. Todas seguem a mesma planta (planograma padrão),
// mas cada uma tem o seu estoque.

export interface Loja {
  id: string;
  nome: string;
  bairro: string;
  /** multiplica o estoque de referência do catálogo */
  fator: number;
  /** estoques que fogem do padrão nesta loja (ruptura, estoque baixo...) */
  ajustes: Record<string, number>;
}

export const LOJAS: Loja[] = [
  {
    id: 'zona-oeste',
    nome: 'Loja Zona Oeste',
    bairro: 'São Paulo, SP',
    fator: 1,
    ajustes: { 'tinta-galao-branco': 0, 'chuveiro-220': 3, 'mecanismo-ceramico': 2, 'bucha-drywall': 4 },
  },
  {
    id: 'zona-sul',
    nome: 'Loja Zona Sul',
    bairro: 'São Paulo, SP',
    fator: 1.3,
    ajustes: { 'tinta-galao-branco': 26, 'furadeira': 0, 'reparo-caixa-acoplada': 2 },
  },
  {
    id: 'zona-norte',
    nome: 'Loja Zona Norte',
    bairro: 'São Paulo, SP',
    fator: 0.8,
    ajustes: { 'tinta-galao-branco': 8, 'sonda-desentupidora': 0, 'chuveiro-127': 2 },
  },
];

export const lojaPorId = (id: string) => LOJAS.find((l) => l.id === id) ?? LOJAS[0];
