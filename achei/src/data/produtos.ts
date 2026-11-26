// Catálogo de demonstração. Preços, estoques e posições são fictícios.
// A posição segue o planograma: corredor (1–16), lado (E = esquerda, D = direita, olhando
// da entrada para o fundo), módulo (1–12, contado a partir da frente) e nível da prateleira (1–5).

export interface Spec {
  rotulo: string;
  valor: string;
  /** chave do glossário (tradutor técnico) */
  termo?: string;
}

export interface Produto {
  id: string;
  nome: string;
  /** como um cliente leigo costuma chamar */
  simples: string;
  corredor: number;
  lado: 'E' | 'D';
  modulo: number;
  nivel: 1 | 2 | 3 | 4 | 5;
  preco: number;
  unidade?: string;
  /** estoque de referência (a loja ajusta) */
  estoque: number;
  termos: string[];
  explica: string;
  specs: Spec[];
  alternativas?: string[];
}

export const PRODUTOS: Produto[] = [
  // ── Corredor 1 · Ferramentas manuais
  {
    id: 'chave-ajustavel', nome: 'Chave ajustável 10"', simples: 'chave inglesa',
    corredor: 1, lado: 'D', modulo: 2, nivel: 4, preco: 39.9, estoque: 18,
    termos: ['chave inglesa', 'chave ajustavel', 'chave de boca', 'apertar porca', 'soltar porca'],
    explica: 'Uma chave que abre e fecha para servir em porcas de vários tamanhos. É a ferramenta para soltar e apertar torneiras, mangueirinhas e conexões.',
    specs: [{ rotulo: 'Tamanho', valor: '10"', termo: 'polegada' }, { rotulo: 'Abertura máxima', valor: '30 mm' }],
  },
  {
    id: 'jogo-chaves-fenda', nome: 'Jogo de chaves de fenda e Phillips (6 peças)', simples: 'chave de fenda',
    corredor: 1, lado: 'E', modulo: 3, nivel: 4, preco: 34.9, estoque: 25,
    termos: ['chave de fenda', 'phillips', 'chave estrela', 'parafusar', 'desparafusar', 'chave philips'],
    explica: 'Fenda é a ponta reta; Phillips é a ponta em cruz. Com as duas você abre a maioria dos parafusos de tomadas, fechaduras e dobradiças.',
    specs: [{ rotulo: 'Peças', valor: '3 fenda + 3 Phillips' }, { rotulo: 'Cabo', valor: 'Emborrachado' }],
  },
  {
    id: 'chave-teste', nome: 'Chave de teste de tensão', simples: 'chave que acende com energia',
    corredor: 1, lado: 'E', modulo: 4, nivel: 3, preco: 14.9, estoque: 40,
    termos: ['chave teste', 'chave de teste', 'testador', 'detector de tensao', 'caneta teste'],
    explica: 'Parece uma chave de fenda, mas acende uma luz quando encosta em um fio com energia. Use para conferir se a energia está mesmo desligada antes de mexer.',
    specs: [{ rotulo: 'Faixa', valor: '100 V a 500 V', termo: 'volt' }],
  },
  {
    id: 'alicate-universal', nome: 'Alicate universal 8"', simples: 'alicate',
    corredor: 1, lado: 'D', modulo: 3, nivel: 3, preco: 32.9, estoque: 22,
    termos: ['alicate', 'alicate universal', 'cortar fio', 'segurar'],
    explica: 'Segura, dobra e corta fios. Os cabos isolados protegem a mão em trabalhos elétricos.',
    specs: [{ rotulo: 'Tamanho', valor: '8"', termo: 'polegada' }, { rotulo: 'Isolação', valor: '1000 V', termo: 'volt' }],
  },
  {
    id: 'trena-5m', nome: 'Trena 5 m', simples: 'fita métrica',
    corredor: 1, lado: 'D', modulo: 5, nivel: 4, preco: 24.9, estoque: 30,
    termos: ['trena', 'fita metrica', 'medir', 'metro', 'medida'],
    explica: 'Fita de metal que puxa e recolhe. Serve para medir parede, porta e marcar onde furar.',
    specs: [{ rotulo: 'Comprimento', valor: '5 m' }, { rotulo: 'Largura da fita', valor: '19 mm' }],
  },
  {
    id: 'nivel-bolha', nome: 'Nível de bolha 40 cm', simples: 'régua com bolha',
    corredor: 1, lado: 'E', modulo: 5, nivel: 3, preco: 29.9, estoque: 14,
    termos: ['nivel', 'nivel de bolha', 'nivelar', 'reto', 'torto', 'alinhar'],
    explica: 'Barra com uma bolha de ar: quando a bolha fica no meio, a peça está reta. Evita prateleira e quadro tortos.',
    specs: [{ rotulo: 'Comprimento', valor: '40 cm' }, { rotulo: 'Bolhas', valor: 'Horizontal e vertical' }],
  },
  {
    id: 'martelo', nome: 'Martelo unha 27 mm', simples: 'martelo',
    corredor: 1, lado: 'E', modulo: 2, nivel: 3, preco: 36.9, estoque: 20,
    termos: ['martelo', 'pregar', 'prego'],
    explica: 'Bate pregos de um lado e arranca pregos com a "unha" do outro.',
    specs: [{ rotulo: 'Cabeça', valor: '27 mm' }, { rotulo: 'Cabo', valor: 'Fibra de vidro' }],
  },
  {
    id: 'estilete', nome: 'Estilete profissional 18 mm', simples: 'estilete',
    corredor: 1, lado: 'D', modulo: 1, nivel: 4, preco: 12.9, estoque: 45,
    termos: ['estilete', 'cortar', 'lamina'],
    explica: 'Lâmina que sai e entra no cabo, para cortar papelão, fita, lona e silicone.',
    specs: [{ rotulo: 'Lâmina', valor: '18 mm' }],
  },
  // ── Corredor 2 · Ferramentas elétricas e escadas
  {
    id: 'furadeira', nome: 'Furadeira de impacto 650 W', simples: 'furadeira',
    corredor: 2, lado: 'D', modulo: 2, nivel: 3, preco: 229.0, estoque: 9,
    termos: ['furadeira', 'furar', 'furar parede', 'parafusadeira', 'furadeira de impacto'],
    explica: 'Fura madeira, metal e, com o impacto ligado, também tijolo e concreto. Para pendurar coisas na parede, é ela que faz o furo da bucha.',
    specs: [
      { rotulo: 'Potência', valor: '650 W', termo: 'watt' },
      { rotulo: 'Mandril', valor: '1/2"', termo: 'mandril' },
      { rotulo: 'Impacto', valor: 'Sim', termo: 'impacto' },
      { rotulo: 'Voltagem', valor: '127 V ou 220 V (escolha a sua)', termo: 'volt' },
    ],
  },
  {
    id: 'broca-concreto-6', nome: 'Broca para concreto 6 mm', simples: 'broca de parede',
    corredor: 2, lado: 'E', modulo: 3, nivel: 4, preco: 9.9, estoque: 60,
    termos: ['broca', 'broca 6', 'broca de parede', 'broca concreto', 'broca widia', 'broca vidia'],
    explica: 'A ponta tem uma pastilha mais dura feita para tijolo e concreto. A de 6 mm faz o furo certo para a bucha nº 6.',
    specs: [{ rotulo: 'Diâmetro', valor: '6 mm' }, { rotulo: 'Ponta', valor: 'Metal duro', termo: 'vidia' }, { rotulo: 'Uso', valor: 'Tijolo e concreto', termo: 'alvenaria' }],
  },
  {
    id: 'escada-aluminio', nome: 'Escada de alumínio 5 degraus', simples: 'escada',
    corredor: 2, lado: 'D', modulo: 7, nivel: 1, preco: 189.9, estoque: 7,
    termos: ['escada', 'escadinha', 'alcancar teto'],
    explica: 'Escada dobrável e leve. Com 5 degraus, alcança o teto de um cômodo comum para trocar lâmpada ou luminária.',
    specs: [{ rotulo: 'Degraus', valor: '5' }, { rotulo: 'Carga máxima', valor: '120 kg' }],
  },
  // ── Corredor 3 · Fixação
  {
    id: 'bucha-6', nome: 'Bucha nº 6 com parafuso (10 un.)', simples: 'bucha 6',
    corredor: 3, lado: 'E', modulo: 2, nivel: 3, preco: 6.9, estoque: 80,
    termos: ['bucha', 'bucha 6', 'parafuso', 'parafuso com bucha', 'fixar na parede', 'prender na parede'],
    explica: 'A bucha é a peça de plástico que vai dentro do furo. Quando o parafuso entra, ela se abre e prende firme na parede de tijolo ou concreto.',
    specs: [{ rotulo: 'Bucha', valor: 'nº 6 (furo de 6 mm)' }, { rotulo: 'Parafuso', valor: '4,2 x 45 mm' }, { rotulo: 'Parede', valor: 'Tijolo e concreto', termo: 'alvenaria' }],
  },
  {
    id: 'bucha-8', nome: 'Bucha nº 8 com parafuso (10 un.)', simples: 'bucha 8',
    corredor: 3, lado: 'E', modulo: 2, nivel: 4, preco: 8.9, estoque: 55,
    termos: ['bucha 8', 'bucha grande', 'peso', 'armario'],
    explica: 'Versão mais grossa da bucha, para objetos pesados como armários e suportes de TV. Precisa de broca de 8 mm.',
    specs: [{ rotulo: 'Bucha', valor: 'nº 8 (furo de 8 mm)' }, { rotulo: 'Parafuso', valor: '5,5 x 50 mm' }],
  },
  {
    id: 'bucha-drywall', nome: 'Bucha basculante para drywall (4 un.)', simples: 'bucha para parede de gesso',
    corredor: 3, lado: 'D', modulo: 3, nivel: 3, preco: 14.9, estoque: 35,
    termos: ['drywall', 'parede de gesso', 'parede oca', 'bucha basculante', 'gesso acartonado'],
    explica: 'Parede de drywall é oca por dentro. Esta bucha passa pelo furo e se abre como uma âncora atrás da placa, segurando o peso.',
    specs: [{ rotulo: 'Parede', valor: 'Drywall', termo: 'drywall' }, { rotulo: 'Carga por bucha', valor: 'até 10 kg' }],
  },
  {
    id: 'fita-dupla-face', nome: 'Fita dupla face fixação forte 19 mm', simples: 'fita que cola dos dois lados',
    corredor: 3, lado: 'D', modulo: 5, nivel: 4, preco: 24.9, estoque: 28,
    termos: ['dupla face', 'fita dupla face', 'sem furar', 'colar quadro', 'colar na parede'],
    explica: 'Cola dos dois lados e segura objetos leves sem furar a parede. Boa para quem mora de aluguel.',
    specs: [{ rotulo: 'Largura', valor: '19 mm' }, { rotulo: 'Carga', valor: 'até 2 kg a cada 10 cm' }],
  },
  // ── Corredor 4 · Ferragens e prateleiras
  {
    id: 'prateleira-mdf', nome: 'Prateleira MDF branca 60 x 20 cm', simples: 'prateleira',
    corredor: 4, lado: 'D', modulo: 8, nivel: 3, preco: 39.9, estoque: 16,
    termos: ['prateleira', 'tabua', 'estante', 'prateleira branca'],
    explica: 'Tábua pronta para prateleira. Vai apoiada em suportes do tipo mão francesa.',
    specs: [{ rotulo: 'Medidas', valor: '60 x 20 x 1,5 cm' }, { rotulo: 'Material', valor: 'MDF', termo: 'mdf' }],
    alternativas: ['prateleira-invisivel'],
  },
  {
    id: 'prateleira-invisivel', nome: 'Prateleira com suporte invisível 60 cm', simples: 'prateleira sem suporte aparente',
    corredor: 4, lado: 'D', modulo: 8, nivel: 4, preco: 69.9, estoque: 10,
    termos: ['prateleira invisivel', 'suporte invisivel', 'prateleira flutuante'],
    explica: 'O suporte fica escondido dentro da prateleira, então ela parece "flutuar" na parede.',
    specs: [{ rotulo: 'Medidas', valor: '60 x 20 cm' }, { rotulo: 'Carga', valor: 'até 8 kg' }],
  },
  {
    id: 'mao-francesa', nome: 'Suporte mão francesa 20 cm (par)', simples: 'suporte de prateleira',
    corredor: 4, lado: 'E', modulo: 8, nivel: 3, preco: 19.9, estoque: 24,
    termos: ['mao francesa', 'suporte prateleira', 'cantoneira', 'suporte em l'],
    explica: 'Suporte em formato de L que vai parafusado na parede e segura a prateleira por baixo.',
    specs: [{ rotulo: 'Tamanho', valor: '20 cm' }, { rotulo: 'Carga por par', valor: 'até 15 kg' }],
  },
  {
    id: 'dobradica', nome: 'Dobradiça 3" para porta (par)', simples: 'dobradiça',
    corredor: 4, lado: 'E', modulo: 3, nivel: 3, preco: 17.9, estoque: 32,
    termos: ['dobradica', 'porta caida', 'porta raspando', 'porta arrastando'],
    explica: 'A peça que liga a porta ao batente e deixa ela girar. Quando gasta ou solta, a porta cai e raspa no chão.',
    specs: [{ rotulo: 'Tamanho', valor: '3"', termo: 'polegada' }, { rotulo: 'Acabamento', valor: 'Cromado' }],
  },
  {
    id: 'fechadura-interna', nome: 'Fechadura para porta interna', simples: 'fechadura de quarto',
    corredor: 4, lado: 'D', modulo: 4, nivel: 4, preco: 59.9, estoque: 12,
    termos: ['fechadura', 'macaneta', 'trinco', 'porta de quarto', 'fechadura interna'],
    explica: 'Fechadura com chave simples para portas de dentro de casa (quarto, escritório).',
    specs: [{ rotulo: 'Distância de broca', valor: '40 mm', termo: 'broca-fechadura' }, { rotulo: 'Uso', valor: 'Porta interna' }],
  },
  {
    id: 'fechadura-externa', nome: 'Fechadura para porta externa com cilindro', simples: 'fechadura de porta da rua',
    corredor: 4, lado: 'D', modulo: 4, nivel: 3, preco: 119.9, estoque: 8,
    termos: ['fechadura externa', 'porta da rua', 'porta da frente', 'fechadura segura'],
    explica: 'Mais reforçada, com cilindro que dificulta arrombamento. Para portas que dão para fora.',
    specs: [{ rotulo: 'Distância de broca', valor: '55 mm', termo: 'broca-fechadura' }, { rotulo: 'Uso', valor: 'Porta externa' }],
  },
  {
    id: 'oleo-desengripante', nome: 'Óleo desengripante spray 300 ml', simples: 'óleo para porta rangendo',
    corredor: 4, lado: 'E', modulo: 1, nivel: 4, preco: 24.9, estoque: 26,
    termos: ['oleo', 'lubrificante', 'desengripante', 'rangendo', 'rangido', 'chiando', 'emperrada', 'emperrado', 'enferrujado'],
    explica: 'Spray que lubrifica e solta peças travadas. Uma borrifada na dobradiça acaba com o rangido.',
    specs: [{ rotulo: 'Volume', valor: '300 ml' }],
  },
  // ── Corredor 5 · Tomadas e interruptores
  {
    id: 'tomada-10a', nome: 'Tomada 2P+T 10 A com placa 4x2', simples: 'tomada comum',
    corredor: 5, lado: 'D', modulo: 2, nivel: 4, preco: 16.9, estoque: 50,
    termos: ['tomada', 'tomada 10', 'tomada 10a', 'trocar tomada', 'tomada comum', 'tomada quebrada'],
    explica: 'A tomada do dia a dia: TV, carregador, luminária, ventilador.',
    specs: [{ rotulo: 'Padrão', valor: '2P+T', termo: '2p+t' }, { rotulo: 'Corrente', valor: '10 A', termo: 'ampere' }, { rotulo: 'Placa', valor: '4x2', termo: 'placa' }],
  },
  {
    id: 'tomada-20a', nome: 'Tomada 2P+T 20 A com placa 4x2', simples: 'tomada para aparelho forte',
    corredor: 5, lado: 'D', modulo: 2, nivel: 3, preco: 19.9, estoque: 34,
    termos: ['tomada 20', 'tomada 20a', 'tomada micro-ondas', 'tomada air fryer', 'tomada maquina de lavar'],
    explica: 'Tem os furos um pouco mais grossos. É a certa para micro-ondas, air fryer, máquina de lavar e outros aparelhos fortes — desde que a fiação da casa aguente.',
    specs: [{ rotulo: 'Padrão', valor: '2P+T', termo: '2p+t' }, { rotulo: 'Corrente', valor: '20 A', termo: 'ampere' }, { rotulo: 'Placa', valor: '4x2', termo: 'placa' }],
  },
  {
    id: 'interruptor-simples', nome: 'Interruptor simples com placa 4x2', simples: 'botão da luz',
    corredor: 5, lado: 'E', modulo: 3, nivel: 4, preco: 12.9, estoque: 41,
    termos: ['interruptor', 'botao da luz', 'interruptor quebrado', 'liga desliga'],
    explica: 'O botão de parede que acende e apaga a luz.',
    specs: [{ rotulo: 'Corrente', valor: '10 A', termo: 'ampere' }, { rotulo: 'Placa', valor: '4x2', termo: 'placa' }],
  },
  // ── Corredor 6 · Fios e proteção
  {
    id: 'fita-isolante', nome: 'Fita isolante 10 m', simples: 'fita preta de fio',
    corredor: 6, lado: 'E', modulo: 2, nivel: 4, preco: 6.9, estoque: 90,
    termos: ['fita isolante', 'isolar fio', 'emenda de fio', 'fita preta'],
    explica: 'Fita de plástico que cobre emendas de fio e evita choque e curto-circuito.',
    specs: [{ rotulo: 'Comprimento', valor: '10 m' }, { rotulo: 'Largura', valor: '19 mm' }],
  },
  {
    id: 'conector-alavanca', nome: 'Conector de emenda com alavanca (5 un.)', simples: 'emenda rápida de fio',
    corredor: 6, lado: 'E', modulo: 3, nivel: 4, preco: 19.9, estoque: 38,
    termos: ['conector', 'emenda', 'conector de alavanca', 'emendar fio', 'ligar fio'],
    explica: 'Substitui a emenda torcida com fita: você levanta a alavanca, encaixa o fio desencapado e fecha. Fica firme e dá para desfazer depois.',
    specs: [{ rotulo: 'Entradas', valor: '3 fios' }, { rotulo: 'Bitola', valor: 'até 4 mm²', termo: 'bitola' }],
  },
  {
    id: 'cabo-2-5', nome: 'Cabo flexível 2,5 mm² (metro)', simples: 'fio de tomada',
    corredor: 6, lado: 'D', modulo: 5, nivel: 2, preco: 3.49, unidade: 'm', estoque: 600,
    termos: ['fio', 'cabo', 'fio 2,5', 'cabo flexivel', 'fiacao'],
    explica: 'Fio usado nos circuitos de tomadas de uso geral. Vendido por metro.',
    specs: [{ rotulo: 'Bitola', valor: '2,5 mm²', termo: 'bitola' }, { rotulo: 'Isolação', valor: '750 V', termo: 'volt' }],
  },
  {
    id: 'disjuntor-32', nome: 'Disjuntor DIN 32 A', simples: 'chave do quadro de luz',
    corredor: 6, lado: 'D', modulo: 2, nivel: 4, preco: 24.9, estoque: 19,
    termos: ['disjuntor', 'quadro de luz', 'cai a luz', 'desarmando', 'chave geral'],
    explica: 'É a chave de segurança que fica no quadro de luz e desliga sozinha quando há sobrecarga. Troca de disjuntor deve ser feita por eletricista.',
    specs: [{ rotulo: 'Corrente', valor: '32 A', termo: 'ampere' }, { rotulo: 'Padrão', valor: 'DIN', termo: 'din' }],
  },
  // ── Corredor 7 · Lâmpadas
  {
    id: 'lampada-led-branca', nome: 'Lâmpada LED bulbo 9 W luz branca', simples: 'lâmpada branca',
    corredor: 7, lado: 'E', modulo: 2, nivel: 4, preco: 9.9, estoque: 120,
    termos: ['lampada', 'lampada led', 'lampada branca', 'lampada queimada', 'luz branca'],
    explica: 'Luz branca, boa para cozinha, banheiro e lugar de estudo. Gasta bem menos que a lâmpada antiga e ilumina o mesmo que uma de 60 W.',
    specs: [{ rotulo: 'Potência', valor: '9 W (equivale a 60 W)', termo: 'watt' }, { rotulo: 'Cor da luz', valor: '6500 K', termo: 'kelvin' }, { rotulo: 'Bocal', valor: 'E27', termo: 'e27' }, { rotulo: 'Voltagem', valor: 'Bivolt', termo: 'bivolt' }],
    alternativas: ['lampada-led-amarela'],
  },
  {
    id: 'lampada-led-amarela', nome: 'Lâmpada LED bulbo 9 W luz amarela', simples: 'lâmpada amarela',
    corredor: 7, lado: 'E', modulo: 2, nivel: 3, preco: 9.9, estoque: 95,
    termos: ['lampada amarela', 'luz amarela', 'luz quente', 'lampada quarto'],
    explica: 'Luz amarelada e mais aconchegante, boa para quarto e sala.',
    specs: [{ rotulo: 'Potência', valor: '9 W (equivale a 60 W)', termo: 'watt' }, { rotulo: 'Cor da luz', valor: '3000 K', termo: 'kelvin' }, { rotulo: 'Bocal', valor: 'E27', termo: 'e27' }, { rotulo: 'Voltagem', valor: 'Bivolt', termo: 'bivolt' }],
  },
  // ── Corredor 8 · Luminárias
  {
    id: 'plafon-led', nome: 'Plafon LED de sobrepor 18 W', simples: 'luminária redonda de teto',
    corredor: 8, lado: 'D', modulo: 3, nivel: 4, preco: 49.9, estoque: 21,
    termos: ['plafon', 'luminaria', 'luminaria de teto', 'luz de teto', 'lustre', 'instalar luminaria'],
    explica: 'Luminária que fica colada no teto, já com o LED embutido — não precisa de lâmpada.',
    specs: [{ rotulo: 'Potência', valor: '18 W', termo: 'watt' }, { rotulo: 'Cor da luz', valor: '6500 K', termo: 'kelvin' }, { rotulo: 'Voltagem', valor: 'Bivolt', termo: 'bivolt' }],
  },
  // ── Corredor 9 · Conexões hidráulicas
  {
    id: 'veda-rosca', nome: 'Fita veda-rosca 18 mm x 25 m', simples: 'fita branca de vedar cano',
    corredor: 9, lado: 'D', modulo: 2, nivel: 4, preco: 5.9, estoque: 140,
    termos: ['veda rosca', 'vedarosca', 'fita veda rosca', 'fita teflon', 'teflon', 'fita branca', 'vedar rosca'],
    explica: 'Fita fininha que você enrola na rosca antes de apertar. Ela preenche as folgas e impede vazamento.',
    specs: [{ rotulo: 'Medidas', valor: '18 mm x 25 m' }, { rotulo: 'Uso', valor: 'Roscas de água', termo: 'rosca' }],
  },
  {
    id: 'engate-flexivel', nome: 'Engate flexível 40 cm 1/2"', simples: 'mangueirinha da torneira',
    corredor: 9, lado: 'D', modulo: 3, nivel: 4, preco: 19.9, estoque: 48,
    termos: ['flexivel', 'engate', 'engate flexivel', 'mangueirinha', 'rabicho', 'ligacao da torneira', 'mangueira da pia'],
    explica: 'Mangueira trançada que liga a torneira (ou a caixa do vaso) ao cano da parede. Quando resseca, começa a vazar.',
    specs: [{ rotulo: 'Comprimento', valor: '40 cm' }, { rotulo: 'Rosca', valor: '1/2"', termo: 'polegada' }],
  },
  {
    id: 'cola-pvc', nome: 'Adesivo para tubos de PVC 75 g', simples: 'cola de cano',
    corredor: 9, lado: 'E', modulo: 4, nivel: 4, preco: 12.9, estoque: 44,
    termos: ['cola cano', 'cola pvc', 'adesivo pvc', 'colar cano'],
    explica: 'Cola própria para unir canos e conexões de PVC de água fria.',
    specs: [{ rotulo: 'Peso', valor: '75 g' }, { rotulo: 'Material', valor: 'PVC', termo: 'pvc' }],
  },
  // ── Corredor 10 · Reparos e desentupimento
  {
    id: 'reparo-torneira', nome: 'Reparo de vedação para torneira 1/2" e 3/4"', simples: 'borrachinha da torneira',
    corredor: 10, lado: 'E', modulo: 2, nivel: 4, preco: 12.9, estoque: 65,
    termos: ['reparo', 'reparo torneira', 'vedante', 'courinho', 'borrachinha', 'carrapeta', 'reparo de torneira'],
    explica: 'É a peça de dentro da torneira que fecha a passagem da água. Quando gasta, a torneira pinga mesmo fechada.',
    specs: [{ rotulo: 'Bitola', valor: '1/2" e 3/4"', termo: 'polegada' }, { rotulo: 'Tipo', valor: 'Torneira de várias voltas' }],
  },
  {
    id: 'mecanismo-ceramico', nome: 'Mecanismo 1/4 de volta para torneira 1/2"', simples: 'miolo de torneira de meia volta',
    corredor: 10, lado: 'E', modulo: 2, nivel: 3, preco: 29.9, estoque: 6,
    termos: ['mecanismo', '1/4 volta', 'quarto de volta', 'meia volta', 'mecanismo ceramico', 'torneira de alavanca'],
    explica: 'Torneiras que abrem com só um quarto de volta usam este miolo de cerâmica no lugar da borrachinha.',
    specs: [{ rotulo: 'Bitola', valor: '1/2"', termo: 'polegada' }, { rotulo: 'Abertura', valor: '1/4 de volta' }],
  },
  {
    id: 'reparo-caixa-acoplada', nome: 'Kit de reparo completo para caixa acoplada', simples: 'peças de dentro da descarga',
    corredor: 10, lado: 'D', modulo: 3, nivel: 3, preco: 64.9, estoque: 15,
    termos: ['caixa acoplada', 'reparo descarga', 'boia', 'valvula descarga', 'kit descarga'],
    explica: 'Troca as peças de dentro da caixa do vaso (boia e válvula). Resolve a água que fica escorrendo sem parar.',
    specs: [{ rotulo: 'Compatibilidade', valor: 'Caixas acopladas mais comuns', termo: 'caixa-acoplada' }],
  },
  {
    id: 'sifao-sanfonado', nome: 'Sifão sanfonado universal', simples: 'cano sanfonado embaixo da pia',
    corredor: 10, lado: 'D', modulo: 4, nivel: 4, preco: 14.9, estoque: 37,
    termos: ['sifao', 'sanfonado', 'cano da pia', 'embaixo da pia', 'cano sanfonado'],
    explica: 'É o cano em curva embaixo da pia. A curva guarda um pouco de água que segura o cheiro do esgoto.',
    specs: [{ rotulo: 'Tipo', valor: 'Universal (pia e lavatório)', termo: 'sifao' }],
  },
  {
    id: 'desentupidor-ventosa', nome: 'Desentupidor de pia (ventosa)', simples: 'desentupidor de pia',
    corredor: 10, lado: 'D', modulo: 5, nivel: 2, preco: 16.9, estoque: 30,
    termos: ['desentupidor', 'ventosa', 'desentupir pia', 'pia entupida'],
    explica: 'A ventosa de borracha cria pressão e empurra o que está entupindo. Funciona melhor com um pouco de água na pia.',
    specs: [{ rotulo: 'Uso', valor: 'Pias e tanques' }],
  },
  {
    id: 'desentupidor-vaso', nome: 'Desentupidor de vaso sanitário', simples: 'desentupidor de vaso',
    corredor: 10, lado: 'D', modulo: 5, nivel: 1, preco: 22.9, estoque: 18,
    termos: ['desentupidor vaso', 'vaso entupido', 'privada entupida'],
    explica: 'Ventosa maior, com formato próprio para encaixar no fundo do vaso.',
    specs: [{ rotulo: 'Uso', valor: 'Vaso sanitário' }],
  },
  {
    id: 'sonda-desentupidora', nome: 'Cabo desentupidor (mola) 5 m', simples: 'mola de desentupir',
    corredor: 10, lado: 'E', modulo: 5, nivel: 2, preco: 39.9, estoque: 11,
    termos: ['mola', 'sonda', 'cabo desentupidor', 'arame desentupir', 'ralo entupido'],
    explica: 'Mola comprida que entra no cano girando e quebra o que está entupindo, sem usar produto químico.',
    specs: [{ rotulo: 'Comprimento', valor: '5 m' }],
  },
  // ── Corredor 11 · Chuveiros
  {
    id: 'chuveiro-127', nome: 'Chuveiro elétrico 127 V 5500 W', simples: 'chuveiro 127',
    corredor: 11, lado: 'D', modulo: 2, nivel: 3, preco: 89.9, estoque: 14,
    termos: ['chuveiro', 'chuveiro eletrico', 'ducha', 'chuveiro 127', 'chuveiro 110'],
    explica: 'Chuveiro para casas onde o chuveiro é ligado em 127 V. A potência mostra o quanto ele consegue esquentar.',
    specs: [{ rotulo: 'Voltagem', valor: '127 V', termo: 'volt' }, { rotulo: 'Potência', valor: '5500 W', termo: 'watt' }, { rotulo: 'Temperaturas', valor: '4' }],
  },
  {
    id: 'chuveiro-220', nome: 'Chuveiro elétrico 220 V 7500 W', simples: 'chuveiro 220',
    corredor: 11, lado: 'D', modulo: 2, nivel: 4, preco: 99.9, estoque: 3,
    termos: ['chuveiro 220', 'chuveiro forte'],
    explica: 'Chuveiro para casas onde o chuveiro é ligado em 220 V. Esquenta mais que o de 127 V.',
    specs: [{ rotulo: 'Voltagem', valor: '220 V', termo: 'volt' }, { rotulo: 'Potência', valor: '7500 W', termo: 'watt' }, { rotulo: 'Temperaturas', valor: '4' }],
  },
  {
    id: 'resistencia-127', nome: 'Resistência para chuveiro 127 V 5500 W', simples: 'resistência do chuveiro 127',
    corredor: 11, lado: 'E', modulo: 3, nivel: 4, preco: 24.9, estoque: 33,
    termos: ['resistencia', 'resistencia chuveiro', 'resistencia queimada', 'resistencia 127'],
    explica: 'É a peça que esquenta a água. Se o chuveiro só sai frio, muitas vezes basta trocar ela. Leve a antiga para conferir o modelo.',
    specs: [{ rotulo: 'Voltagem', valor: '127 V', termo: 'volt' }, { rotulo: 'Potência', valor: '5500 W', termo: 'watt' }],
  },
  {
    id: 'resistencia-220', nome: 'Resistência para chuveiro 220 V 7500 W', simples: 'resistência do chuveiro 220',
    corredor: 11, lado: 'E', modulo: 3, nivel: 3, preco: 26.9, estoque: 27,
    termos: ['resistencia 220'],
    explica: 'É a peça que esquenta a água em chuveiros 220 V. Leve a antiga para conferir o modelo.',
    specs: [{ rotulo: 'Voltagem', valor: '220 V', termo: 'volt' }, { rotulo: 'Potência', valor: '7500 W', termo: 'watt' }],
  },
  // ── Corredor 12 · Banheiro
  {
    id: 'torneira-lavatorio', nome: 'Torneira de mesa para lavatório 1/4 de volta', simples: 'torneira da pia do banheiro',
    corredor: 12, lado: 'D', modulo: 3, nivel: 4, preco: 79.9, estoque: 13,
    termos: ['torneira banheiro', 'torneira lavatorio', 'torneira pia banheiro', 'torneira nova'],
    explica: 'Torneira que fica em cima da pia do banheiro e abre com um quarto de volta.',
    specs: [{ rotulo: 'Instalação', valor: 'Mesa (bancada)' }, { rotulo: 'Abertura', valor: '1/4 de volta' }, { rotulo: 'Rosca', valor: '1/2"', termo: 'polegada' }],
  },
  {
    id: 'assento-sanitario', nome: 'Assento sanitário universal', simples: 'tampa do vaso',
    corredor: 12, lado: 'E', modulo: 4, nivel: 2, preco: 59.9, estoque: 17,
    termos: ['assento', 'tampa do vaso', 'assento sanitario', 'tampa privada'],
    explica: 'Assento com tampa que serve na maioria dos vasos de formato oval.',
    specs: [{ rotulo: 'Formato', valor: 'Oval universal' }],
  },
  // ── Corredor 13 · Cozinha e área de serviço
  {
    id: 'torneira-cozinha', nome: 'Torneira de parede para cozinha bica móvel', simples: 'torneira da cozinha',
    corredor: 13, lado: 'E', modulo: 3, nivel: 4, preco: 89.9, estoque: 11,
    termos: ['torneira cozinha', 'torneira de parede', 'bica movel', 'torneira pia cozinha'],
    explica: 'Torneira que sai da parede, com bica que gira para os dois lados da pia.',
    specs: [{ rotulo: 'Instalação', valor: 'Parede' }, { rotulo: 'Rosca', valor: '1/2"', termo: 'polegada' }],
  },
  {
    id: 'torneira-tanque', nome: 'Torneira para tanque e jardim 1/2"', simples: 'torneira do tanque',
    corredor: 13, lado: 'D', modulo: 4, nivel: 4, preco: 24.9, estoque: 29,
    termos: ['torneira tanque', 'torneira jardim', 'torneira area de servico', 'torneira externa', 'torneira de mangueira'],
    explica: 'Torneira simples com bico para mangueira, para tanque, quintal e jardim.',
    specs: [{ rotulo: 'Rosca', valor: '1/2"', termo: 'polegada' }],
  },
  // ── Corredor 14 · Tintas
  {
    id: 'tinta-galao-branco', nome: 'Tinta acrílica fosca branco neve 3,6 L', simples: 'galão de tinta branca',
    corredor: 14, lado: 'E', modulo: 3, nivel: 1, preco: 119.9, estoque: 0,
    termos: ['tinta', 'tinta branca', 'galao', 'tinta parede', 'tinta acrilica', 'latex', 'pintar parede'],
    explica: 'Tinta à base de água para paredes. "Fosca" disfarça defeitos da parede.',
    specs: [{ rotulo: 'Acabamento', valor: 'Fosco', termo: 'fosco' }, { rotulo: 'Rendimento', valor: 'até 38 m² por demão', termo: 'rendimento' }, { rotulo: 'Embalagem', valor: '3,6 L' }],
    alternativas: ['tinta-galao-gelo', 'tinta-lata-branco'],
  },
  {
    id: 'tinta-galao-gelo', nome: 'Tinta acrílica fosca branco gelo 3,6 L', simples: 'galão de tinta branco gelo',
    corredor: 14, lado: 'E', modulo: 3, nivel: 2, preco: 114.9, estoque: 22,
    termos: ['branco gelo', 'tinta gelo', 'tinta off white'],
    explica: 'Mesmo tipo de tinta, num branco levemente acinzentado. Na parede, a diferença para o branco neve é pequena.',
    specs: [{ rotulo: 'Acabamento', valor: 'Fosco', termo: 'fosco' }, { rotulo: 'Rendimento', valor: 'até 38 m² por demão', termo: 'rendimento' }, { rotulo: 'Embalagem', valor: '3,6 L' }],
  },
  {
    id: 'tinta-lata-branco', nome: 'Tinta acrílica fosca branco neve 18 L', simples: 'lata grande de tinta',
    corredor: 14, lado: 'D', modulo: 3, nivel: 1, preco: 459.9, estoque: 12,
    termos: ['lata de tinta', 'tinta 18 litros', 'lata 18'],
    explica: 'A lata grande sai mais barata por litro. Vale a pena para casa inteira ou cômodos grandes.',
    specs: [{ rotulo: 'Acabamento', valor: 'Fosco', termo: 'fosco' }, { rotulo: 'Rendimento', valor: 'até 190 m² por demão', termo: 'rendimento' }, { rotulo: 'Embalagem', valor: '18 L' }],
  },
  {
    id: 'tinta-antimofo', nome: 'Tinta acrílica antimofo branca 3,6 L', simples: 'tinta para banheiro',
    corredor: 14, lado: 'E', modulo: 5, nivel: 1, preco: 149.9, estoque: 16,
    termos: ['tinta antimofo', 'antimofo', 'tinta banheiro', 'tinta cozinha', 'tinta umidade'],
    explica: 'Tem aditivo que impede o mofo de crescer de novo. Ideal para banheiro, cozinha e lavanderia.',
    specs: [{ rotulo: 'Acabamento', valor: 'Acetinado', termo: 'acetinado' }, { rotulo: 'Rendimento', valor: 'até 38 m² por demão', termo: 'rendimento' }, { rotulo: 'Embalagem', valor: '3,6 L' }],
  },
  // ── Corredor 15 · Pintura, massa e rejunte
  {
    id: 'rolo-la-23', nome: 'Rolo de lã 23 cm com cabo', simples: 'rolo de pintar',
    corredor: 15, lado: 'D', modulo: 2, nivel: 4, preco: 29.9, estoque: 27,
    termos: ['rolo', 'rolo de pintura', 'rolo de la', 'rolo de pintar'],
    explica: 'Rolo de lã pinta paredes rápido e deixa o acabamento uniforme.',
    specs: [{ rotulo: 'Largura', valor: '23 cm' }, { rotulo: 'Pelo', valor: 'Lã sintética média' }],
  },
  {
    id: 'bandeja-pintura', nome: 'Bandeja para pintura', simples: 'bandeja de tinta',
    corredor: 15, lado: 'D', modulo: 2, nivel: 3, preco: 9.9, estoque: 40,
    termos: ['bandeja', 'bandeja tinta', 'caçamba de tinta'],
    explica: 'Onde você coloca a tinta para molhar e tirar o excesso do rolo.',
    specs: [{ rotulo: 'Para rolos de', valor: 'até 23 cm' }],
  },
  {
    id: 'trincha-2', nome: 'Trincha 2"', simples: 'pincel largo',
    corredor: 15, lado: 'D', modulo: 3, nivel: 4, preco: 12.9, estoque: 36,
    termos: ['trincha', 'pincel', 'pincel largo'],
    explica: 'Pincel largo para cantos, rodapés e recortes onde o rolo não alcança.',
    specs: [{ rotulo: 'Largura', valor: '2"', termo: 'polegada' }],
  },
  {
    id: 'fita-crepe', nome: 'Fita crepe 48 mm x 50 m', simples: 'fita de papel',
    corredor: 15, lado: 'E', modulo: 2, nivel: 4, preco: 14.9, estoque: 52,
    termos: ['fita crepe', 'fita de papel', 'proteger rodape', 'fita pintura'],
    explica: 'Fita de papel que protege tomadas, rodapés e batentes da tinta e sai sem arrancar a pintura.',
    specs: [{ rotulo: 'Medidas', valor: '48 mm x 50 m' }],
  },
  {
    id: 'lona-plastica', nome: 'Lona plástica 4 x 4 m', simples: 'plástico para cobrir o chão',
    corredor: 15, lado: 'E', modulo: 3, nivel: 2, preco: 12.9, estoque: 33,
    termos: ['lona', 'proteger chao', 'forrar', 'plastico'],
    explica: 'Cobre o chão e os móveis para não respingar tinta.',
    specs: [{ rotulo: 'Tamanho', valor: '4 x 4 m' }],
  },
  {
    id: 'lixa-150', nome: 'Lixa para parede grão 150 (5 un.)', simples: 'lixa',
    corredor: 15, lado: 'E', modulo: 4, nivel: 4, preco: 7.9, estoque: 70,
    termos: ['lixa', 'lixar', 'lixa parede', 'lixa 150'],
    explica: 'O número indica a aspereza: 150 é média, boa para deixar a parede lisinha antes de pintar.',
    specs: [{ rotulo: 'Grão', valor: '150', termo: 'grao' }],
  },
  {
    id: 'massa-corrida', nome: 'Massa corrida 1,4 kg', simples: 'massa de tapar furo',
    corredor: 15, lado: 'D', modulo: 4, nivel: 2, preco: 24.9, estoque: 24,
    termos: ['massa corrida', 'tapar furo', 'buraco na parede', 'massa parede', 'furo na parede'],
    explica: 'Massa para tapar furinhos e imperfeições da parede antes de pintar (uso interno).',
    specs: [{ rotulo: 'Peso', valor: '1,4 kg' }, { rotulo: 'Uso', valor: 'Áreas internas secas' }],
  },
  {
    id: 'espatula', nome: 'Espátula de aço 8 cm', simples: 'espátula',
    corredor: 15, lado: 'D', modulo: 4, nivel: 4, preco: 9.9, estoque: 31,
    termos: ['espatula', 'aplicar massa', 'raspar'],
    explica: 'Lâmina larga para aplicar massa e raspar tinta velha.',
    specs: [{ rotulo: 'Largura', valor: '8 cm' }],
  },
  {
    id: 'rejunte-flex', nome: 'Rejunte flexível branco 1 kg', simples: 'rejunte',
    corredor: 15, lado: 'E', modulo: 8, nivel: 3, preco: 14.9, estoque: 46,
    termos: ['rejunte', 'rejuntar', 'rejunte branco', 'rejunte flexivel', 'junta azulejo'],
    explica: 'Massa que preenche o espaço entre os azulejos. O flexível aguenta pequenas movimentações sem trincar.',
    specs: [{ rotulo: 'Peso', valor: '1 kg' }, { rotulo: 'Tipo', valor: 'Flexível', termo: 'rejunte-flexivel' }],
  },
  {
    id: 'raspador-rejunte', nome: 'Raspador de rejunte com ponta de metal duro', simples: 'ferramenta para tirar rejunte velho',
    corredor: 15, lado: 'E', modulo: 8, nivel: 4, preco: 19.9, estoque: 15,
    termos: ['raspador rejunte', 'tirar rejunte', 'remover rejunte', 'riscador'],
    explica: 'Ponta dura que raspa o rejunte velho de dentro da junta sem quebrar o azulejo.',
    specs: [{ rotulo: 'Ponta', valor: 'Metal duro', termo: 'vidia' }],
  },
  {
    id: 'desempenadeira-borracha', nome: 'Desempenadeira de borracha', simples: 'espalhador de rejunte',
    corredor: 15, lado: 'D', modulo: 8, nivel: 4, preco: 14.9, estoque: 19,
    termos: ['desempenadeira', 'desempenadeira de borracha', 'espalhar rejunte'],
    explica: 'Espalha o rejunte e empurra para dentro das juntas sem riscar o azulejo.',
    specs: [{ rotulo: 'Base', valor: 'Borracha' }],
  },
  // ── Corredor 16 · Limpeza, proteção e jardim
  {
    id: 'luva-borracha', nome: 'Luva de borracha multiuso (par)', simples: 'luva de limpeza',
    corredor: 16, lado: 'E', modulo: 2, nivel: 4, preco: 7.9, estoque: 75,
    termos: ['luva', 'luva de borracha', 'luva limpeza'],
    explica: 'Protege as mãos de sujeira, produtos de limpeza e água de esgoto.',
    specs: [{ rotulo: 'Tamanho', valor: 'M' }],
  },
  {
    id: 'mascara-pff2', nome: 'Máscara de proteção PFF2', simples: 'máscara',
    corredor: 16, lado: 'E', modulo: 3, nivel: 4, preco: 6.9, estoque: 60,
    termos: ['mascara', 'poeira', 'pff2', 'respirador'],
    explica: 'Filtra poeira e esporos de mofo enquanto você lixa ou limpa.',
    specs: [{ rotulo: 'Proteção', valor: 'PFF2', termo: 'pff2' }],
  },
  {
    id: 'oculos-protecao', nome: 'Óculos de proteção', simples: 'óculos de segurança',
    corredor: 16, lado: 'E', modulo: 3, nivel: 3, preco: 14.9, estoque: 23,
    termos: ['oculos', 'oculos de protecao', 'proteger olhos'],
    explica: 'Protege os olhos do pó e de lascas ao furar ou lixar.',
    specs: [{ rotulo: 'Lente', valor: 'Incolor antirrisco' }],
  },
  {
    id: 'limpador-antimofo', nome: 'Limpador antimofo 500 ml', simples: 'tira-mofo',
    corredor: 16, lado: 'D', modulo: 2, nivel: 4, preco: 16.9, estoque: 38,
    termos: ['tira mofo', 'limpador antimofo', 'limpar mofo', 'bolor'],
    explica: 'Remove as manchas pretas de mofo da parede e do rejunte. Use com janela aberta e luvas.',
    specs: [{ rotulo: 'Volume', valor: '500 ml' }],
  },
  {
    id: 'limpa-rejunte', nome: 'Limpa rejunte 1 L', simples: 'produto para clarear rejunte',
    corredor: 16, lado: 'D', modulo: 2, nivel: 3, preco: 19.9, estoque: 29,
    termos: ['limpa rejunte', 'rejunte encardido', 'rejunte sujo', 'clarear rejunte'],
    explica: 'Solta a sujeira impregnada no rejunte. Aplique, espere alguns minutos e esfregue com escova.',
    specs: [{ rotulo: 'Volume', valor: '1 L' }],
  },
  {
    id: 'escova-limpeza', nome: 'Escova de limpeza cerdas duras', simples: 'escovinha',
    corredor: 16, lado: 'D', modulo: 3, nivel: 4, preco: 9.9, estoque: 42,
    termos: ['escova', 'esfregar', 'escovinha'],
    explica: 'Escova firme para esfregar rejunte, cantos e manchas.',
    specs: [{ rotulo: 'Cerdas', valor: 'Duras' }],
  },
  {
    id: 'esponja-dupla', nome: 'Esponja dupla face (4 un.)', simples: 'esponja',
    corredor: 16, lado: 'D', modulo: 3, nivel: 3, preco: 7.9, estoque: 58,
    termos: ['esponja', 'limpar'],
    explica: 'Um lado macio para limpar e um áspero para tirar sujeira e excesso de rejunte.',
    specs: [{ rotulo: 'Unidades', valor: '4' }],
  },
  {
    id: 'vaso-plastico', nome: 'Vaso plástico 30 cm', simples: 'vaso de planta',
    corredor: 16, lado: 'D', modulo: 9, nivel: 2, preco: 24.9, estoque: 25,
    termos: ['vaso', 'vaso de planta', 'plantar', 'floreira'],
    explica: 'Vaso leve com furos no fundo para a água escoar.',
    specs: [{ rotulo: 'Diâmetro', valor: '30 cm' }],
  },
  {
    id: 'terra-adubada', nome: 'Terra vegetal adubada 10 kg', simples: 'terra',
    corredor: 16, lado: 'E', modulo: 10, nivel: 1, preco: 16.9, estoque: 34,
    termos: ['terra', 'terra adubada', 'adubo', 'substrato'],
    explica: 'Terra já misturada com adubo, pronta para vaso e horta.',
    specs: [{ rotulo: 'Peso', valor: '10 kg' }],
  },
  {
    id: 'argila-expandida', nome: 'Argila expandida 2 kg', simples: 'bolinhas para o fundo do vaso',
    corredor: 16, lado: 'E', modulo: 10, nivel: 2, preco: 14.9, estoque: 20,
    termos: ['argila expandida', 'drenagem', 'bolinha de argila', 'fundo do vaso'],
    explica: 'As bolinhas no fundo do vaso deixam a água escoar e evitam que a raiz apodreça.',
    specs: [{ rotulo: 'Peso', valor: '2 kg' }],
  },
  {
    id: 'sementes-temperos', nome: 'Sementes de temperos sortidos', simples: 'sementes de tempero',
    corredor: 16, lado: 'D', modulo: 9, nivel: 4, preco: 4.9, estoque: 85,
    termos: ['semente', 'sementes', 'tempero', 'cebolinha', 'salsinha', 'manjericao'],
    explica: 'Envelope com sementes de cebolinha, salsinha e manjericão.',
    specs: [{ rotulo: 'Variedades', valor: 'Cebolinha, salsinha e manjericão' }],
  },
  {
    id: 'regador', nome: 'Regador 5 L', simples: 'regador',
    corredor: 16, lado: 'D', modulo: 10, nivel: 2, preco: 19.9, estoque: 17,
    termos: ['regador', 'regar', 'molhar planta'],
    explica: 'Regador com bico de chuveirinho, que molha sem encharcar.',
    specs: [{ rotulo: 'Capacidade', valor: '5 L' }],
  },
];

export const produtoPorId: Record<string, Produto> = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]));

export const getProduto = (id: string): Produto | undefined => produtoPorId[id];

/** Tradutor técnico: explica em palavras simples os termos que aparecem nas fichas */
export const GLOSSARIO: Record<string, { termo: string; explica: string }> = {
  polegada: { termo: 'Polegada (")', explica: 'Medida usada em canos, roscas e ferramentas. 1/2" (meia polegada) é o tamanho mais comum de cano de água dentro de casa.' },
  rosca: { termo: 'Rosca', explica: 'A parte com "caminhos" em espiral onde uma peça gira e se prende na outra.' },
  volt: { termo: 'Volt (V)', explica: 'A "força" da energia da tomada. Aparelho de 127 V ligado em 220 V queima; o contrário funciona fraco. Confira sempre.' },
  watt: { termo: 'Watt (W)', explica: 'Quanta energia o aparelho usa. Em chuveiro, mais watts = água mais quente. Em lâmpada LED, poucos watts já iluminam bastante.' },
  ampere: { termo: 'Ampere (A)', explica: 'Quanta corrente a peça aguenta. Tomada de 10 A é para uso comum; 20 A é para aparelhos fortes, como micro-ondas.' },
  '2p+t': { termo: '2P+T', explica: 'Dois polos + terra: o padrão brasileiro de três furos. O furo do meio é o "terra", que protege contra choque.' },
  placa: { termo: 'Placa 4x2', explica: 'O tamanho da caixinha na parede (4 por 2 polegadas). É o padrão mais comum de tomada e interruptor no Brasil.' },
  bitola: { termo: 'Bitola (mm²)', explica: 'A grossura do fio. Fio mais grosso aguenta mais corrente sem esquentar.' },
  kelvin: { termo: 'Kelvin (K)', explica: 'A cor da luz. Perto de 3000 K é amarelada e aconchegante; perto de 6500 K é branca, boa para enxergar detalhes.' },
  e27: { termo: 'Bocal E27', explica: 'O encaixe de rosca comum das lâmpadas no Brasil.' },
  bivolt: { termo: 'Bivolt', explica: 'Funciona tanto em 127 V quanto em 220 V, sem precisar escolher.' },
  rendimento: { termo: 'Rendimento', explica: 'Quantos metros quadrados de parede a embalagem cobre em cada camada de tinta.' },
  demao: { termo: 'Demão', explica: 'Cada camada de tinta. Em geral são necessárias duas demãos para cobrir bem.' },
  fosco: { termo: 'Fosco', explica: 'Acabamento sem brilho, que disfarça imperfeições da parede.' },
  acetinado: { termo: 'Acetinado', explica: 'Brilho suave. É mais fácil de limpar, por isso é indicado para áreas úmidas.' },
  drywall: { termo: 'Drywall', explica: 'Parede feita de placas de gesso, oca por dentro. Bata nela: se o som for oco, provavelmente é drywall.' },
  alvenaria: { termo: 'Alvenaria', explica: 'Parede de tijolo ou bloco, rebocada. Precisa de broca para concreto e bucha comum.' },
  vidia: { termo: 'Ponta de metal duro (vídia)', explica: 'Pastilha mais dura que o aço comum, que aguenta furar ou raspar materiais duros.' },
  mandril: { termo: 'Mandril', explica: 'A "boca" da furadeira que prende a broca. 1/2" aceita brocas de até 13 mm.' },
  impacto: { termo: 'Impacto', explica: 'Função que dá pequenas marteladas enquanto a broca gira. É ela que permite furar tijolo e concreto.' },
  sifao: { termo: 'Sifão', explica: 'Cano em curva embaixo da pia. A água parada na curva bloqueia o cheiro do esgoto.' },
  'caixa-acoplada': { termo: 'Caixa acoplada', explica: 'A caixa de descarga que fica em cima do vaso, presa nele.' },
  pvc: { termo: 'PVC', explica: 'O plástico dos canos de água fria. Os canos marrons são de PVC soldável (colados).' },
  mdf: { termo: 'MDF', explica: 'Placa de madeira prensada, lisa e fácil de pintar. Não gosta de umidade.' },
  grao: { termo: 'Grão da lixa', explica: 'Quanto maior o número, mais fina a lixa. 80 é grossa, 150 é média, 220 é fina.' },
  'rejunte-flexivel': { termo: 'Rejunte flexível', explica: 'Tem aditivos que deixam o rejunte menos rígido, então ele trinca menos.' },
  pff2: { termo: 'PFF2', explica: 'Nível de filtragem da máscara. Segura poeira fina e partículas no ar.' },
  din: { termo: 'Padrão DIN', explica: 'O encaixe em trilho usado nos quadros de luz mais novos.' },
  'broca-fechadura': { termo: 'Distância de broca', explica: 'Distância entre a borda da porta e o centro da maçaneta. Meça a sua fechadura antiga antes de comprar: precisa ser igual.' },
};
